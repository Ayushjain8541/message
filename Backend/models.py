from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

Base = declarative_base()

class DriverStatus(str, enum.Enum):
    FREE = "free"
    BUSY = "busy"
    OFFLINE = "offline"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            value = value.lower()
            for member in cls:
                if member.value == value:
                    return member
        return None

    def __str__(self):
        return self.value

    def __repr__(self):
        return f"DriverStatus.{self.name}"

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    status = Column(
        Enum(DriverStatus, name='driverstatus', create_constraint=True),
        nullable=False,
        server_default='free'
    )
    last_status_update = Column(DateTime, default=datetime.utcnow)
    messages = relationship("Message", back_populates="driver")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if 'status' not in kwargs:
            self.status = DriverStatus.FREE
        elif isinstance(kwargs.get('status'), str):
            self.status = DriverStatus(kwargs['status'].lower())
        elif isinstance(kwargs.get('status'), DriverStatus):
            self.status = kwargs['status']

    def update_status(self):
        """Update driver status based on current assignments"""
        try:
            if not self.messages:
                self.status = DriverStatus.FREE
            else:
                # Check if any message is within the current time window
                current_time = datetime.utcnow()
                for message in self.messages:
                    if message.timestamp and abs((current_time - message.timestamp).total_seconds()) < 3600:  # Within 1 hour
                        self.status = DriverStatus.BUSY
                        return
                self.status = DriverStatus.FREE
            self.last_status_update = current_time
        except Exception as e:
            logger.error(f"Error updating driver status: {str(e)}")
            raise

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    driver = relationship("Driver", back_populates="messages")

