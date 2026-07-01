from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agents import extract_omnichannel_lead

app = FastAPI()


from auth import register_user, authenticate_user

class AuthPayload(BaseModel):
    username: str
    password: str


@app.post("/register")
async def api_register(payload: AuthPayload):
    try:
        user_info = register_user(payload.username, payload.password)
        return {"status": "success", "user": user_info}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/login")
async def api_login(payload: AuthPayload):
    user_info = authenticate_user(payload.username, payload.password)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"status": "success", "user": user_info}


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
