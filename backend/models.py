# backend/models.py
from pydantic import BaseModel
from typing import Literal, List, Dict, Optional

class ChatRequest(BaseModel):
    query: str
    doc_ids: Optional[List[str]] = None

class UploadResponse(BaseModel):
    doc_id: str
    filename: str
    pages: int

class Citation(BaseModel):
    id: int
    doc_id: str
    page: int
    quote: str

class StreamEvent(BaseModel):
    type: Literal["tool", "text", "citation"]
    content: Dict
