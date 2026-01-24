from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)

def get_db():
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise

def init_db():
    SQLModel.metadata.create_all(engine)
