import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load the environment variables from the .env file
load_dotenv()

# Retrieve the database URLs from the environment
DATABASE_URL = os.getenv("DATABASE_URL")
DIRECT_URL = os.getenv("DIRECT_URL")

# Make sure the URLs exist so we don't fail silently
if not DATABASE_URL:
    raise ValueError("No DATABASE_URL found in environment variables.")

# Create the SQLAlchemy Engine using the cleaned pooler URL
engine = create_engine(DATABASE_URL)

# Create a customized Session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for our database models (Tables)
Base = declarative_base()
