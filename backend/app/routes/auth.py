from fastapi import APIRouter, HTTPException
from app.models.schemas import AuthPayload
from app.services.auth_service import register_user, authenticate_user

router = APIRouter()

@router.post("/register")
async def api_register(payload: AuthPayload):
    try:
        user_info = register_user(payload.username, payload.password)
        return {"status": "success", "user": user_info}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def api_login(payload: AuthPayload):
    user_info = authenticate_user(payload.username, payload.password)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"status": "success", "user": user_info}
