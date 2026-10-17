from math import ceil
from typing import Annotated

from fastapi import Query
from pydantic import BaseModel, ConfigDict


class Schema(BaseModel):
    """Base for every API schema: reads straight from ORM objects."""

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    detail: str
    code: str


class Page[T](BaseModel):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def build(cls, items: list[T], *, total: int, page: int, size: int) -> "Page[T]":
        return cls(items=items, total=total, page=page, size=size, pages=ceil(total / size))


class PageParams(BaseModel):
    page: int
    size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


def page_params(
    page: Annotated[int, Query(ge=1, description="Page number, starting at 1")] = 1,
    size: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 12,
) -> PageParams:
    return PageParams(page=page, size=size)
