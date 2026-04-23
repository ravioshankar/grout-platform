from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings


def _create_engine():
    url = settings.DATABASE_URL
    if url.startswith("sqlite"):
        return create_engine(
            url,
            echo=False,
            connect_args={"check_same_thread": False},
        )
    return create_engine(
        url,
        echo=False,
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        pool_recycle=3600,
        pool_pre_ping=True,
        connect_args={
            "connect_timeout": 10,
            "options": "-c statement_timeout=30000",
        },
    )


engine = _create_engine()

def get_db():
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise


def _import_orm_models() -> None:
    """Import table models so they register on SQLModel.metadata before create_all."""
    import app.models.user  # noqa: F401
    import app.models.session  # noqa: F401
    import app.models.password_reset  # noqa: F401
    import app.models.email_verification  # noqa: F401
    import app.models.onboarding_profile  # noqa: F401
    import app.models.test_record  # noqa: F401
    import app.models.marketplace  # noqa: F401


def init_db():
    _import_orm_models()
    SQLModel.metadata.create_all(engine)
