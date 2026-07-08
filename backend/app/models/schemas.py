from pydantic import BaseModel


class AuthPayload(BaseModel):
    username: str
    password: str


class LeadPayload(BaseModel):
    lead_id: int
    message: str
    source: str  # 'WhatsApp', 'Property Finder / Bayut', 'Email Inbox', 'Website / Dribbble Form'
