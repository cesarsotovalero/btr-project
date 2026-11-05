"""Tests for authentication endpoints."""

import pytest


@pytest.mark.asyncio
async def test_register(client):
    res = await client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "new@seb.se",
            "password": "secret1234",
            "full_name": "New User",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_username(client):
    await client.post(
        "/api/auth/register",
        json={
            "username": "dupuser",
            "email": "dup1@seb.se",
            "password": "secret1234",
            "full_name": "Dup User",
        },
    )
    res = await client.post(
        "/api/auth/register",
        json={
            "username": "dupuser",
            "email": "dup2@seb.se",
            "password": "secret1234",
            "full_name": "Dup User 2",
        },
    )
    assert res.status_code == 400
    assert "username" in res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_success(client):
    # Register first
    await client.post(
        "/api/auth/register",
        json={
            "username": "loginuser",
            "email": "login@seb.se",
            "password": "mypassword",
            "full_name": "Login User",
        },
    )
    # Login
    res = await client.post(
        "/api/auth/login",
        json={"username": "loginuser", "password": "mypassword"},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/api/auth/register",
        json={
            "username": "wrongpw",
            "email": "wrongpw@seb.se",
            "password": "correctpw",
            "full_name": "WP User",
        },
    )
    res = await client.post(
        "/api/auth/login",
        json={"username": "wrongpw", "password": "wrongpassword"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client, auth_headers):
    res = await client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@seb.se"
    assert data["full_name"] == "Test Analyst"


@pytest.mark.asyncio
async def test_update_me(client, auth_headers):
    res = await client.patch(
        "/api/auth/me",
        json={"theme_preference": "dark"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    assert res.json()["theme_preference"] == "dark"


@pytest.mark.asyncio
async def test_me_without_token(client):
    res = await client.get("/api/auth/me")
    assert res.status_code == 401
