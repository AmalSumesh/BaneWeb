from typing import Optional
from pydantic import BaseModel


class ExplainRequest(BaseModel):
    drug: str
    disease: str
    question: Optional[str] = None
