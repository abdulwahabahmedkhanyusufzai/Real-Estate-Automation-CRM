from pydantic import BaseModel, field_validator, Field


class AuthPayload(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def username_no_whitespace(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Username cannot be blank")
        return v


class LeadPayload(BaseModel):
    lead_id: int = Field(..., ge=1)
    message: str = Field(..., min_length=1, max_length=4096)
    source: str = Field(
        ...,
        pattern=r"^(WhatsApp|Property Finder / Bayut|Email Inbox|Website / Dribbble Form)$",
    )
