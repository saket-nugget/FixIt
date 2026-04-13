from sqlalchemy.orm import Session
from models import User

# CREATE - Add a new user to the database
def create_user(db: Session, email: str, username: str):
    new_user = User(email=email, username=username)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# READ - Get a user by their ID
def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

# READ - Get a user by their email
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# READ - Get all users (with a limit)
def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

# UPDATE - Update a user's username
def update_user(db: Session, user_id: int, new_username: str):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.username = new_username
        db.commit()
        db.refresh(user)
    return user

# DELETE - Remove a user
def delete_user(db: Session, user_id: int):
    if user:
        db.delete(user)
        db.commit()
    return user

# REPAIR LOGS
from models import RepairLog

def create_repair_log(db: Session, user_id: int, item_name: str, diagnosis: str, status: str = "Pending"):
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

def get_user_repairs(db: Session, user_id: int):
    return db.query(RepairLog).filter(RepairLog.user_id == user_id).order_by(RepairLog.created_at.desc()).all()
