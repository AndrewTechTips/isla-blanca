from collections.abc import Sequence

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.schemas.common import PageParams


def paginate[T](
    db: Session, query: Select[tuple[T]], params: PageParams
) -> tuple[Sequence[T], int]:
    """One page of results plus the total count of the unpaginated query."""
    total = db.scalar(select(func.count()).select_from(query.order_by(None).subquery())) or 0
    items = db.scalars(query.limit(params.size).offset(params.offset)).all()
    return items, total
