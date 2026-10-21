from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.membership import MembershipRead, TierRead
from app.services import membership

router = APIRouter(prefix="/membership", tags=["membership"])


@router.get("/tiers", response_model=list[TierRead], summary="Club tiers, lowest first")
def list_tiers() -> list[TierRead]:
    """Public: the nights each tier needs and the discount it gives on room nights."""
    return membership.tiers()


@router.get("/me", response_model=MembershipRead, summary="The signed-in guest's club card")
def read_my_membership(user: CurrentUser, db: DbSession) -> MembershipRead:
    return membership.status(db, user)
