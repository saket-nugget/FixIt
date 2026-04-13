from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from crud import (
    create_user, get_user, get_user_by_email, get_all_users, update_user, delete_user,
    create_repair_log, get_user_repairs
)
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


app = FastAPI(title="FixIt.API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fix-it-tawny.vercel.app",
        "http://localhost:5173",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    email:str
    username:str
class UserUpdate(BaseModel):
    username:str
class UserResponse(BaseModel):
    id:int
    email:str
    username:str
    class Config:
        from_attributes=True

class RepairLogCreate(BaseModel):
    user_id: int
    item_name: str
    diagnosis: str
    status: Optional[str] = "Pending"

class RepairLogResponse(BaseModel):
    id: int
    user_id: int
    item_name: str
    diagnosis: str
    status: str
    created_at: datetime
    class Config:
        from_attributes=True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message":"FixIt API is running"}

@app.post("/users/",response_model=UserResponse)
def api_create_user(user: UserCreate,db:Session=Depends(get_db)):
    existing = get_user_by_email(db,user.email)
    if existing:
        raise HTTPException(status_code=400,detail="Email already registered")
    return create_user(db, user.email, user.username)

@app.get("/users/", response_model=list[UserResponse])
def api_get_users(skip: int=0,limit: int=100,db:Session = Depends(get_db)):
    return get_all_users(db, skip=skip, limit=limit)

@app.get("/users/{user_id}",response_model=UserResponse)
def api_get_user(user_id:int,db:Session=Depends(get_db)):
    user = get_user(db,user_id)
    if not user :
        raise HTTPException(status_code=404,detail="User not found")
    return user

@app.put("/users/{user_id}",response_model=UserResponse)
def api_update_user(user_id:int,user:UserUpdate,db:Session=Depends(get_db)):
    updated = update_user(db,user_id, user.username)
    if not updated:
        raise HTTPException(status_code=404,detail="User not found")
    return updated

@app.delete("/users/{user_id}")
def api_delete_user(user_id:int,db:Session=Depends(get_db)):
    deleted = delete_user(db,user_id)
    if not deleted:
        raise HTTPException(status_code=404,detail="User not found")
    return {"message":"User deleted successfully"}

# REPAIR LOG ROUTES
@app.post("/repairs/", response_model=RepairLogResponse)
def api_create_repair(repair: RepairLogCreate, db: Session = Depends(get_db)):
    # Verify user exists first to prevent 500 ForeignKey errors
    user = get_user(db, repair.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User with ID {repair.user_id} not found. Please create a user first.")
    
    return create_repair_log(
        db, 
        user_id=repair.user_id, 
        item_name=repair.item_name, 
        diagnosis=repair.diagnosis, 
        status=repair.status
    )

@app.get("/repairs/{user_id}", response_model=list[RepairLogResponse])
def api_get_user_repairs(user_id: int, db: Session = Depends(get_db)):
    return get_user_repairs(db, user_id=user_id)