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
        # ValueError is a known business rule violation (e.g. duplicate username)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        # Never expose internal exception details — log server-side only
        raise HTTPException(
            status_code=500, detail="Registration failed. Please try again."
        )


@router.post("/login")
async def api_login(payload: AuthPayload):
    user_info = authenticate_user(payload.username, payload.password)
    if not user_info:
        # Use the same message for both "user not found" and "wrong password".
        # A different message for each case would let attackers enumerate
        # valid usernames via the /login endpoint.
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"status": "success", "user": user_info}
