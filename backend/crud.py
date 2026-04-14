from sqlalchemy.orm import Session
from models import User

# CREATE - Add a new user to the database
def create_user(db: Session, user_id: str, email: str, username: str):
    new_user = User(id=user_id, email=email, username=username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# READ - Get a user by their ID
def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

# READ - Get a user by their email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# READ - Get all users (with a limit)
def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

# UPDATE - Update a user's username
def update_user(db: Session, user_id: str, new_username: str):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.username = new_username
        db.commit()
        db.refresh(user)
    return user

# DELETE - Remove a user
def delete_user(db: Session, user_id: str):
    if user:
        db.delete(user)
        db.commit()
    return user

# REPAIR LOGS
from models import RepairLog

def create_repair_log(db: Session, user_id: str, item_name: str, diagnosis: str, status: str = "Pending"):
    new_repair = RepairLog(
        user_id=user_id,
        item_name=item_name,
        diagnosis=diagnosis,
        status=status
    )
    db.add(new_repair)
    db.commit()
    db.refresh(new_repair)
    return new_repair

def get_user_repairs(db: Session, user_id: str):
    return db.query(RepairLog).filter(RepairLog.user_id == user_id).order_by(RepairLog.created_at.desc()).all()

# MANUALS
from models import Manual

def get_manuals(db: Session, search: str = None, category: str = None, user_id: str = None):
    query = db.query(Manual)
    
    # 1. Logic: Include default manuals OR user-specific manuals
    if user_id:
        query = query.filter((Manual.is_default == 1) | (Manual.user_id == user_id))
    else:
        query = query.filter(Manual.is_default == 1)
        
    if category and category != "All":
        query = query.filter(Manual.category == category)
        
    if search:
        query = query.filter(Manual.title.ilike(f"%{search}%"))
        
    return query.order_by(Manual.is_default.desc(), Manual.created_at.desc()).all()

def create_manual(db: Session, title: str, category: str, content: str, user_id: str = None, is_default: int = 0):
    new_manual = Manual(
        title=title,
        category=category,
        content=content,
        user_id=user_id,
        is_default=is_default
    )
    db.add(new_manual)
    db.commit()
    db.refresh(new_manual)
    return new_manual

def delete_manual(db: Session, manual_id: int, user_id: str):
    manual = db.query(Manual).filter(Manual.id == manual_id, Manual.user_id == user_id).first()
    if manual:
        db.delete(manual)
        db.commit()
        return True
    return False
