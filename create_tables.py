import asyncio
from Database import engine  # Ensure the connection string in 'engine' is correct
from models import Base

async def create_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

try:
    asyncio.run(create_db())
except RuntimeError as e:
    if "asyncio.run()" in str(e):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(create_db())  # Check your database host, port, and credentials