from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from crud import (
    create_user, get_user, get_user_by_email, get_all_users, update_user, delete_user,
    create_repair_log, get_user_repairs,
    get_manuals, create_manual, delete_manual
)
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from auth_utils import get_current_user


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
    id: str # Supabase UUID
    email: str
    username: str

class UserUpdate(BaseModel):
    username: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    class Config:
        from_attributes = True

class ManualCreate(BaseModel):
    title: str
    category: str
    content: str
    is_default: Optional[int] = 0

class ManualResponse(BaseModel):
    id: int
    title: str
    category: str
    content: str
    is_default: int
    user_id: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class RepairLogCreate(BaseModel):
    user_id: str
    item_name: str
    diagnosis: str
    status: Optional[str] = "Pending"

class RepairLogResponse(BaseModel):
    id: int
    user_id: str
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
        return existing # Return existing user if already synced
    return create_user(db, user.id, user.email, user.username)

@app.get("/users/", response_model=list[UserResponse])
def api_get_users(skip: int=0,limit: int=100,db:Session = Depends(get_db)):
    return get_all_users(db, skip=skip, limit=limit)

@app.get("/users/{user_id}",response_model=UserResponse)
def api_get_user(user_id:str,db:Session=Depends(get_db)):
    user = get_user(db,user_id)
    if not user :
        raise HTTPException(status_code=404,detail="User not found")
    return user

@app.put("/users/{user_id}",response_model=UserResponse)
def api_update_user(user_id:str,user:UserUpdate,db:Session=Depends(get_db)):
    updated = update_user(db,user_id, user.username)
    if not updated:
        raise HTTPException(status_code=404,detail="User not found")
    return updated

@app.delete("/users/{user_id}")
def api_delete_user(user_id:str,db:Session=Depends(get_db)):
    deleted = delete_user(db,user_id)
    if not deleted:
        raise HTTPException(status_code=404,detail="User not found")
    return {"message":"User deleted successfully"}

# REPAIR LOG ROUTES
@app.post("/repairs/", response_model=RepairLogResponse)
def api_create_repair(
    repair: RepairLogCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Ensure user ID in request matches current authenticated user ID
    if repair.user_id != current_user["id"]:
         raise HTTPException(status_code=403, detail="Not authorized to save for another user")
         
    return create_repair_log(
        db, 
        user_id=repair.user_id, 
        item_name=repair.item_name, 
        diagnosis=repair.diagnosis, 
        status=repair.status
    )

@app.get("/repairs/{user_id}", response_model=list[RepairLogResponse])
def api_get_user_repairs(
    user_id: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if user_id != current_user["id"]:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    return get_user_repairs(db, user_id=user_id)

# MANUAL ROUTES
@app.get("/manuals/", response_model=List[ManualResponse])
def api_get_manuals(
    search: Optional[str] = None, 
    category: Optional[str] = None, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_manuals(db, search=search, category=category, user_id=current_user["id"])

@app.post("/manuals/", response_model=ManualResponse)
def api_create_manual(
    manual: ManualCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return create_manual(
        db, 
        title=manual.title, 
        category=manual.category, 
        content=manual.content, 
        user_id=current_user["id"],
        is_default=manual.is_default
    )

@app.delete("/manuals/{manual_id}")
def api_delete_manual(
    manual_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    success = delete_manual(db, manual_id=manual_id, user_id=current_user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Manual not found or not authorized to delete")
    return {"status": "success"}