from typing import Optional
from pydantic import BaseModel, Field


class ApiErrorDetail(BaseModel):
    code: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[str] = Field(None, description="Detailed stack trace or context")
    request_id: Optional[str] = Field(None, description="Unique identifier for tracking the request")
