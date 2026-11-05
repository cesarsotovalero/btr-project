"""
Shared test fixtures — async test client backed by SQLite for isolation.
"""

import asyncio
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

# In-memory SQLite for tests
TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture()
async def db_session() -> AsyncGenerator[AsyncSession]:
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture()
async def client(db_session: AsyncSession, tmp_path) -> AsyncGenerator[AsyncClient]:
    """AsyncClient with DB session override and temp upload dir."""
    from app.config import settings

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    original_upload_dir = settings.upload_dir
    settings.upload_dir = str(tmp_path / "uploads")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    settings.upload_dir = original_upload_dir
    app.dependency_overrides.clear()


@pytest_asyncio.fixture()
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    """Register a test user and return Authorization headers."""
    res = await client.post(
        "/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@seb.se",
            "password": "testpass123",
            "full_name": "Test Analyst",
        },
    )
    assert res.status_code == 200, f"Registration failed: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
