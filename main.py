from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker
from Database import engine
from models import Base, Message
from schemas import MessageCreate  # ✅ import your schema

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Async session
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@app.post("/submit")
async def submit_message(msg: MessageCreate):  # ✅ receive schema here
    if not msg.message:
        raise HTTPException(status_code=400, detail="Message is required")

    async with async_session() as session:
        new_msg = Message(content=msg.message)
        session.add(new_msg)
        await session.commit()

    return {"status": "success", "message": msg.message}
@app.get("/messages")
async def get_messages():
    async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        result = await session.execute(select(Message))
        messages = result.scalars().all()
        return {"messages": [{"id": msg.id, "text": msg.content} for msg in messages]}


    
@app.delete("/messages/{message_id}")
async def delete_message(message_id: int):
    async with async_session() as session:
        # Fetch the message to delete by its ID
        msg = await session.get(Message, message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")

        # Delete the message
        await session.delete(msg)
        await session.commit()

        return {"message": "Message deleted successfully"}

