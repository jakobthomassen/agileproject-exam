from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database file location
DATABASE_URL = "sqlite:///./peers.db"

# Create the database engine
# This connects to the SQLite database
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # needed for SQLite + FastAPI
)

# SessionLocal is a factory for creating database sessions
# Each session is like a "conversation" with the database
SessionLocal = sessionmaker(
    autocommit=False,  # We manually control when to save changes
    autoflush=False,   # We manually control when to send changes to DB
    bind=engine,       # Connect sessions to our database
)

# Base class for all our database models
Base = declarative_base()

# Function to initialize the database
# This creates all the tables defined in our models
def init_db():
    # Import models here to avoid circular imports
    # The dot (.) means "import from THIS folder"
    from .models import Event  # Import all models here
    Base.metadata.create_all(bind=engine)

# Helper function to get a database session
# Use this in your API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()