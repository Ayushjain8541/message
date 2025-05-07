from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models import DriverStatus

class DriverBase(BaseModel):
    name: str = Field(..., min_length=1)
    phone: str = Field(..., min_length=1)

class DriverCreate(DriverBase):
    pass

class Driver(DriverBase):
    id: int
    status: DriverStatus = Field(default=DriverStatus.FREE)
    last_status_update: datetime

    class Config:
        from_attributes = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            DriverStatus: lambda v: v.value
        }

class MessageBase(BaseModel):
    content: str = Field(..., min_length=1)

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    timestamp: datetime
    driver_id: Optional[int] = None
    driver: Optional[Driver] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class DriverAssignment(BaseModel):
    driver_id: int = Field(..., gt=0)
