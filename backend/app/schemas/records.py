from pydantic import BaseModel


class RecordOut(BaseModel):
    id: str
    user_id: str
    file_name: str
    content_type: str
    file_size: int
    record_type: str
    notes: str | None
    uploaded_at: str | None
    preview_url: str
    ai_analysis: str | None = None
    ai_status: str | None = None
    analyzed_at: str | None = None


class RecordListResponse(BaseModel):
    records: list[RecordOut]
    total: int


class RecordDeleteResponse(BaseModel):
    message: str
    id: str
