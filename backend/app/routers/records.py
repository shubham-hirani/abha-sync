import uuid
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.s3_client import upload_file_to_s3, download_file_from_s3, delete_file_from_s3
from app.core.config import get_settings
from app.middleware.auth import get_current_user_id
from app.models.user import User
from app.models.record import MedicalRecord
from app.schemas.records import RecordOut, RecordListResponse, RecordDeleteResponse

router = APIRouter(prefix="/records", tags=["records"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _record_to_out(record: MedicalRecord) -> RecordOut:
    """Convert a MedicalRecord to RecordOut with a backend proxy preview URL."""
    data = record.to_dict()
    # Use backend proxy URL instead of S3 presigned URL to avoid CORS issues
    data["preview_url"] = f"/api/v1/records/{record.id}/file"
    return RecordOut(**data)


@router.post("/upload", response_model=RecordOut, status_code=status.HTTP_201_CREATED)
async def upload_record(
    file: UploadFile = File(...),
    record_type: str = Form("record"),
    notes: str = Form(""),
    uid: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Upload a medical record file (JPEG, PNG, or PDF, max 10 MB).
    Stores the file in S3 and metadata in PostgreSQL.
    """
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file.content_type}' is not allowed. Accepted: JPEG, PNG, PDF.",
        )

    # Validate record type
    if record_type not in ("report", "record", "lab_report"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="record_type must be 'report', 'record', or 'lab_report'.",
        )

    # Read file bytes
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large ({file_size} bytes). Maximum is 10 MB.",
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # Get the user
    db_user = db.query(User).filter(User.supabase_uid == uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Build S3 key
    unique_id = uuid.uuid4().hex[:12]
    safe_filename = file.filename.replace(" ", "_") if file.filename else "unnamed"
    s3_key = f"records/{db_user.user_id}/{unique_id}_{safe_filename}"

    # Upload to S3
    try:
        upload_file_to_s3(file_bytes, s3_key, file.content_type or "application/octet-stream")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file to storage: {str(e)}",
        )

    # Save metadata in DB
    record = MedicalRecord(
        user_id=db_user.user_id,
        file_name=file.filename or "unnamed",
        s3_key=s3_key,
        content_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        record_type=record_type,
        notes=notes if notes else None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return _record_to_out(record)


@router.get("", response_model=RecordListResponse)
async def list_records(
    uid: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """List all medical records for the authenticated user."""
    db_user = db.query(User).filter(User.supabase_uid == uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    records = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.user_id == db_user.user_id)
        .order_by(MedicalRecord.uploaded_at.desc())
        .all()
    )

    return RecordListResponse(
        records=[_record_to_out(r) for r in records],
        total=len(records),
    )


@router.get("/{record_id}/file")
async def get_record_file(
    record_id: str,
    token: str = Query(..., description="Bearer token for authentication"),
    db: Session = Depends(get_db),
):
    """
    Proxy endpoint: streams the file from S3 through the backend.
    Uses token as a query param so <img src="..."> tags can authenticate.
    """
    from app.core.supabase_client import get_supabase_client

    # Validate token manually (since <img> tags can't send Authorization headers)
    try:
        supabase = get_supabase_client()
        res = supabase.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        uid = res.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_user = db.query(User).filter(User.supabase_uid == uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    record = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.id == record_id, MedicalRecord.user_id == db_user.user_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    try:
        file_bytes = download_file_from_s3(record.s3_key)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not retrieve file from storage")

    return Response(
        content=file_bytes,
        media_type=record.content_type,
        headers={
            "Content-Disposition": f'inline; filename="{record.file_name}"',
            "Cache-Control": "private, max-age=3600",
        },
    )


@router.get("/{record_id}", response_model=RecordOut)
async def get_record(
    record_id: str,
    uid: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a single medical record metadata."""
    db_user = db.query(User).filter(User.supabase_uid == uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    record = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.id == record_id, MedicalRecord.user_id == db_user.user_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    return _record_to_out(record)


@router.delete("/{record_id}", response_model=RecordDeleteResponse)
async def delete_record(
    record_id: str,
    uid: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a medical record from S3 and database."""
    db_user = db.query(User).filter(User.supabase_uid == uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    record = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.id == record_id, MedicalRecord.user_id == db_user.user_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")

    # Delete from S3
    try:
        delete_file_from_s3(record.s3_key)
    except Exception:
        pass  # file may already be gone; continue with DB cleanup

    # Delete from DB
    db.delete(record)
    db.commit()

    return RecordDeleteResponse(message="Record deleted successfully", id=record_id)
