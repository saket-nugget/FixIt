from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # Supabase UUID
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
    
    user_id = Column(String, ForeignKey("users.id"))
    
    # Relationship: Link back to the user
    owner = relationship("User", back_populates="repairs")

class Manual(Base):
    __tablename__ = "manuals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True)
    description = Column(Text, nullable=True)
    content = Column(Text) # JSON string of manual content
    is_default = Column(Integer, default=0) # 1 for system manuals, 0 for user-created
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
