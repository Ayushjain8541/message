from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
import logging
import sys

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = "postgresql+asyncpg://postgres:Nanogram%40123@localhost:5432/test_db"

try:
    # Create engine with echo for SQL logging
    engine = create_async_engine(
        DATABASE_URL,
        echo=True,
        pool_pre_ping=True,  # Enable connection health checks
        pool_size=5,         # Set connection pool size
        max_overflow=10      # Maximum number of connections that can be created beyond pool_size
    )
    logger.info("Database engine created successfully")

    # Create session factory
    async_session = sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
    logger.info("Session factory created successfully")

except Exception as e:
    logger.error(f"Error initializing database: {str(e)}")
    sys.exit(1)

class Base(DeclarativeBase):
    pass

async def get_db():
    session = async_session()
    try:
        logger.info("Creating new database session")
        yield session
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        await session.rollback()
        raise
    finally:
        logger.info("Closing database session")
        await session.close()