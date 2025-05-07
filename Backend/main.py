from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker, joinedload
from Database import engine, async_session
from models import Base, Message, Driver, DriverStatus
from schemas import MessageCreate, DriverCreate, Driver as DriverSchema, Message as MessageSchema, DriverAssignment
from typing import List
from datetime import datetime
from sqlalchemy.sql import text
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return JSONResponse(
        content={
            "message": "Welcome to the Order Board API",
            "status": "running",
            "endpoints": {
                "messages": "/messages",
                "drivers": "/drivers",
                "submit": "/submit"
            }
        }
    )

# Dependency to get database session
async def get_db():
    async with async_session() as session:
        try:
            yield session
        except Exception as e:
            raise HTTPException(status_code=500, detail="Database error occurred")
        finally:
            await session.close()

# Messages endpoints
@app.post("/submit")
async def submit_message(msg: MessageCreate, db: AsyncSession = Depends(get_db)):
    try:
        if not msg.content:
            raise HTTPException(status_code=400, detail="Message is required")

        new_msg = Message(content=msg.content)
        db.add(new_msg)
        await db.commit()
        await db.refresh(new_msg)
        return MessageSchema.model_validate(new_msg)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error submitting message")

@app.get("/messages")
async def get_messages(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(Message)
            .options(joinedload(Message.driver))
            .order_by(Message.timestamp.desc())
        )
        messages = result.unique().scalars().all()
        return {"messages": [MessageSchema.model_validate(msg) for msg in messages]}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching messages")

@app.delete("/messages/{message_id}")
async def delete_message(message_id: int, db: AsyncSession = Depends(get_db)):
    try:
        msg = await db.get(Message, message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")

        if msg.driver:
            msg.driver.update_status()
            await db.commit()

        await db.delete(msg)
        await db.commit()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error deleting message")

@app.post("/messages/{message_id}/assign")
async def assign_driver(message_id: int, assignment: DriverAssignment, db: AsyncSession = Depends(get_db)):
    try:
        message = await db.get(Message, message_id)
        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        driver = await db.get(Driver, assignment.driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        if message.driver:
            message.driver.update_status()

        message.driver_id = driver.id
        driver.update_status()
        
        await db.commit()
        await db.refresh(message)
        return MessageSchema.model_validate(message)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error assigning driver")

# Drivers endpoints
@app.get("/drivers")
async def get_drivers(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(Driver)
            .options(joinedload(Driver.messages))
        )
        drivers = result.unique().scalars().all()
        
        for driver in drivers:
            driver.update_status()
        await db.commit()
        
        return {"drivers": [DriverSchema.model_validate(driver).model_dump() for driver in drivers]}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error fetching drivers")

@app.post("/drivers", response_model=DriverSchema)
async def create_driver(driver: DriverCreate):
    try:
        new_driver = Driver(
            name=driver.name.strip(),
            phone=driver.phone.strip(),
            status=DriverStatus.FREE,
            last_status_update=datetime.utcnow()
        )
        
        async with async_session() as session:
            try:
                session.add(new_driver)
                await session.commit()
                await session.refresh(new_driver)
                return DriverSchema.model_validate(new_driver)
            except IntegrityError as e:
                await session.rollback()
                if "duplicate key value violates unique constraint" in str(e):
                    raise HTTPException(
                        status_code=400,
                        detail="A driver with this phone number already exists"
                    )
                raise HTTPException(
                    status_code=500,
                    detail="Database error occurred"
                )
            except Exception as e:
                await session.rollback()
                raise HTTPException(
                    status_code=500,
                    detail="An unexpected error occurred"
                )
    except ValidationError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

@app.delete("/drivers/{driver_id}")
async def delete_driver(driver_id: int, db: AsyncSession = Depends(get_db)):
    try:
        driver = await db.get(Driver, driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        result = await db.execute(
            select(Message).where(Message.driver_id == driver_id)
        )
        messages = result.scalars().all()
        for message in messages:
            message.driver_id = None

        await db.delete(driver)
        await db.commit()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error deleting driver")

@app.put("/drivers/{driver_id}/status")
async def update_driver_status(
    driver_id: int,
    status: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        status = status.lower()
        if status not in [s.value for s in DriverStatus]:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {[s.value for s in DriverStatus]}"
            )

        driver = await db.get(Driver, driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        driver.status = DriverStatus(status)
        driver.last_status_update = datetime.utcnow()
        await db.commit()
        await db.refresh(driver)
        return DriverSchema.model_validate(driver)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

