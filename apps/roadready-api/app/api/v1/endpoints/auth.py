from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from datetime import timedelta, datetime
from app.core.database import get_db
from app.core.security import (
    verify_password, create_tokens, get_current_user, 
    get_password_hash, revoke_session, revoke_all_user_sessions, oauth2_scheme, hash_token
)
from app.core.oauth import oauth
from app.models.user import User
from app.schemas.user import Token, LoginRequest, UserRead, UserCreate
from app.schemas.auth import SignupRequest, UserProfileUpdate, TokenResponse, ChangePasswordRequest, ChangeEmailRequest
from app.core.config import settings

router = APIRouter()

@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=201,
    summary="Signup new user",
    description="Create a new user account with only email and password. Profile details can be added later.",
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "Email already registered"},
    },
)
async def signup(signup_data: SignupRequest, request: Request, db: Session = Depends(get_db)):
    existing = db.exec(select(User).where(User.email == signup_data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        email=signup_data.email,
        hashed_password=get_password_hash(signup_data.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    access_token, refresh_token = create_tokens(db_user.id, db, request)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login user",
    description="Authenticate user and return JWT access token",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
    },
)
async def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    if '@' not in login_data.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.exec(select(User).where(User.email == login_data.email)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not registered",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.hashed_password or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is inactive")
    
    access_token, refresh_token = create_tokens(user.id, db, request)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current user",
    description="Get the currently authenticated user's information",
    responses={
        200: {"description": "Current user data"},
        401: {"description": "Not authenticated"},
    },
)
async def get_me(request: Request, current_user: User = Depends(get_current_user)):
    auth_header = request.headers.get("authorization")
    print(f"Auth header received: {auth_header[:50] if auth_header else 'None'}...")
    return current_user

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Get new access token using refresh token",
)
async def refresh_token(refresh_data: dict, request: Request, db: Session = Depends(get_db)):
    from jose import jwt, JWTError
    from app.models.session import Session as SessionModel
    
    refresh_token = refresh_data.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
        session_id = payload.get("session_id")
        token_type = payload.get("type")
        
        if token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        token_hash = hash_token(refresh_token)
        session = db.exec(select(SessionModel).where(
            SessionModel.session_id == session_id,
            SessionModel.refresh_token_hash == token_hash,
            SessionModel.is_active == True
        )).first()
        
        if not session:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        revoke_session(session_id, db)
        access_token, new_refresh_token = create_tokens(user_id, db, request)
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post(
    "/logout",
    summary="Logout user",
    description="Invalidate current session",
    responses={
        200: {"description": "Logout successful"},
        401: {"description": "Not authenticated"},
    },
)
async def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import jwt
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        session_id = payload.get("session_id")
        if session_id:
            revoke_session(session_id, db)
    except:
        pass
    return {"message": "Logged out successfully"}

@router.post(
    "/logout-all",
    summary="Logout from all devices",
    description="Invalidate all user sessions",
    responses={
        200: {"description": "All sessions logged out"},
        401: {"description": "Not authenticated"},
    },
)
async def logout_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    revoke_all_user_sessions(current_user.id, db)
    return {"message": "Logged out from all devices"}

@router.patch(
    "/me",
    response_model=UserRead,
    summary="Update user profile",
    description="Update current user's profile information",
    responses={
        200: {"description": "Profile updated successfully"},
        401: {"description": "Not authenticated"},
    },
)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    if profile_data.phone_number is not None:
        current_user.phone_number = profile_data.phone_number
    if profile_data.date_of_birth is not None:
        current_user.date_of_birth = profile_data.date_of_birth
    if profile_data.avatar_url is not None:
        current_user.avatar_url = profile_data.avatar_url
    if profile_data.state is not None:
        current_user.state = profile_data.state
    if profile_data.test_type is not None:
        current_user.test_type = profile_data.test_type
    if profile_data.license_number is not None:
        current_user.license_number = profile_data.license_number
    
    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post(
    "/change-password",
    summary="Change password",
    description="Change user password (requires current password)",
    responses={
        200: {"description": "Password changed successfully"},
        401: {"description": "Invalid current password"},
    },
)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="OAuth users cannot change password")
    
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.post(
    "/change-email",
    response_model=UserRead,
    summary="Change email",
    description="Change user email (requires password verification)",
    responses={
        200: {"description": "Email changed successfully"},
        400: {"description": "Email already in use"},
        401: {"description": "Invalid password"},
    },
)
async def change_email(
    email_data: ChangeEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.hashed_password:
        raise HTTPException(status_code=400, detail="OAuth users cannot change email")
    
    if not verify_password(email_data.password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Password is incorrect")
    
    existing = db.exec(select(User).where(User.email == email_data.new_email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")
    
    current_user.email = email_data.new_email
    current_user.email_verified = False
    current_user.updated_at = datetime.utcnow()
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get(
    "/login/{provider}",
    summary="OAuth login",
    description="Initiate OAuth login with Google or Facebook",
)
async def oauth_login(provider: str, request: Request):
    if provider not in ['google', 'facebook']:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    redirect_uri = request.url_for('oauth_callback', provider=provider)
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)

@router.get(
    "/callback/{provider}",
    response_model=Token,
    summary="OAuth callback",
    description="Handle OAuth callback and create user session",
)
async def oauth_callback(provider: str, request: Request, db: Session = Depends(get_db)):
    if provider not in ['google', 'facebook']:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    try:
        client = oauth.create_client(provider)
        token = await client.authorize_access_token(request)
        
        if provider == 'google':
            user_info = token.get('userinfo')
            email = user_info.get('email')
            provider_id = user_info.get('sub')
        else:  # facebook
            user_info = await client.get('me?fields=id,email', token=token)
            user_data = user_info.json()
            email = user_data.get('email')
            provider_id = user_data.get('id')
        
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by OAuth provider")
        
        # Find or create user
        user = db.exec(select(User).where(User.email == email)).first()
        
        if not user:
            # Create new user with OAuth
            user = User(
                email=email,
                oauth_provider=provider,
                oauth_provider_id=provider_id,
                state="CA",  # Default, should be updated by user
                test_type="car",  # Default, should be updated by user
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.oauth_provider:
            # Link OAuth to existing email account
            user.oauth_provider = provider
            user.oauth_provider_id = provider_id
            db.add(user)
            db.commit()
        
        # Create access token
        access_token, refresh_token = create_tokens(user.id, db, request)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth authentication failed: {str(e)}")
