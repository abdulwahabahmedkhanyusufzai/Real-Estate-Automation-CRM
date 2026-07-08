from fastapi import APIRouter, HTTPException
from app.models.schemas import LeadPayload
from app.services.lead_service import extract_omnichannel_lead

router = APIRouter()

@router.post("/api/v1/qualify-lead")
async def qualify_lead(payload: LeadPayload):
    try:
        # Pass both the message and the source to the specialized extraction engine
        extracted_data = extract_omnichannel_lead(payload.message, payload.source)
        return {"status": "success", "data": extracted_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
