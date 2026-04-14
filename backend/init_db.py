from database import engine, Base
# Import the models so Base knows about them when we create tables
from models import User, RepairLog

def create_tables():
    print("Dropping existing tables (Schema update)...")
    Base.metadata.drop_all(bind=engine)
    print("Creating new database tables...")
    # This command inspects the models and creates tables in Supabase
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()
