from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agents import extract_omnichannel_lead

app = FastAPI()


class LeadPayload(BaseModel):
    lead_id: int
    message: str
    source: str  # 'WhatsApp', 'Property Finder / Bayut', 'Email Inbox', 'Website / Dribbble Form'


@app.post("/api/v1/qualify-lead")
async def qualify_lead(payload: LeadPayload):
    try:
        # Pass both the message and the source to the specialized extraction engine
        extracted_data = extract_omnichannel_lead(payload.message, payload.source)

        # (Rest of your PyTorch scoring and Supabase update logic runs here)
        return {"status": "success", "data": extracted_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
