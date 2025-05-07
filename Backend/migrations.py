from sqlalchemy import text
from Database import engine
import asyncio
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_migrations():
    try:
        async with engine.begin() as conn:
            logger.info("Starting migrations...")
            
            # Drop existing tables and types separately
            logger.info("Dropping existing tables and types...")
            await conn.execute(text("DROP TABLE IF EXISTS messages CASCADE"))
            await conn.execute(text("DROP TABLE IF EXISTS drivers CASCADE"))
            await conn.execute(text("DROP TYPE IF EXISTS driverstatus CASCADE"))
            
            # Create enum type with explicit values
            logger.info("Creating driverstatus enum type...")
            await conn.execute(text("""
                CREATE TYPE driverstatus AS ENUM ('free', 'busy', 'offline');
            """))
            
            # Verify enum type was created
            result = await conn.execute(text("SELECT 1 FROM pg_type WHERE typname = 'driverstatus'"))
            if not result.scalar():
                raise Exception("Failed to create driverstatus enum type")
            
            # Create drivers table with explicit enum usage
            logger.info("Creating drivers table...")
            await conn.execute(text("""
                CREATE TABLE drivers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    phone VARCHAR NOT NULL,
                    status driverstatus NOT NULL DEFAULT 'free',
                    last_status_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            
            # Create messages table
            logger.info("Creating messages table...")
            await conn.execute(text("""
                CREATE TABLE messages (
                    id SERIAL PRIMARY KEY,
                    content VARCHAR NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    driver_id INTEGER REFERENCES drivers(id)
                );
            """))
            
            # Verify tables were created
            result = await conn.execute(text("SELECT 1 FROM drivers LIMIT 1"))
            if result.scalar() is None:
                logger.info("Drivers table created successfully")
            
            result = await conn.execute(text("SELECT 1 FROM messages LIMIT 1"))
            if result.scalar() is None:
                logger.info("Messages table created successfully")
            
            logger.info("Migrations completed successfully!")
    except Exception as e:
        logger.error(f"Error during migration: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()

def main():
    try:
        asyncio.run(run_migrations())
    except KeyboardInterrupt:
        print("\nMigration interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 