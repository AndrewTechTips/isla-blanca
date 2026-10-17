from fastapi import APIRouter

from app.api.deps import DbSession
from app.models import Amenity, Service
from app.schemas.catalog import AmenityRead, ServiceRead
from app.services import catalog

router = APIRouter(tags=["catalog"])


@router.get("/amenities", response_model=list[AmenityRead], summary="In-room amenities")
def list_amenities(db: DbSession) -> list[Amenity]:
    return catalog.list_amenities(db)


@router.get("/services", response_model=list[ServiceRead], summary="Extras for a stay")
def list_services(db: DbSession) -> list[Service]:
    return catalog.list_services(db)
