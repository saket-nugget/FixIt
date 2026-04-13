from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    
    # Relationship: One user can have many repair logs
    repairs = relationship("RepairLog", back_populates="owner")

class RepairLog(Base):
    __tablename__ = "repair_logs"

    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String, index=True)
    diagnosis = Column(Text)
    status = Column(String, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship: Link back to the user
    owner = relationship("User", back_populates="repairs")
