from database import engine, Base
# Import the models so Base knows about them when we create tables
from models import User

def create_tables():
    print("Creating database tables...")
    # This command inspects the models and creates tables in Supabase
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    create_tables()

