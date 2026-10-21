from fastapi import APIRouter

from app.api.routes import admin, auth, bookings, catalog, health, membership, rooms

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(rooms.router)
api_router.include_router(catalog.router)
api_router.include_router(bookings.router)
api_router.include_router(membership.router)
api_router.include_router(admin.router)
