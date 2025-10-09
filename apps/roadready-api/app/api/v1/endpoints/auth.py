from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from datetime import timedelta, datetime
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user, get_password_hash
from app.core.oauth import oauth
from app.models.user import User
from app.schemas.user import Token, LoginRequest, UserRead, UserCreate
from app.schemas.auth import SignupRequest, UserProfileUpdate
from app.core.config import settings

router = APIRouter()

@router.post(
    "/signup",
    response_model=Token,
    status_code=201,
    summary="Signup new user",
    description="Create a new user account with only email and password. Profile details can be added later.",
    responses={
        201: {"description": "User created successfully"},
        400: {"description": "Email already registered"},
    },
)
async def signup(signup_data: SignupRequest, db: Session = Depends(get_db)):
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
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post(
    "/login",
    response_model=Token,
    summary="Login user",
    description="Authenticate user and return JWT access token",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
    },
)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.email == login_data.email)).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

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
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch(
    "/me",
    response_model=UserRead,
    summary="Update user profile",
    description="Update current user's profile information (first_name, last_name, state, test_type)",
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
    if profile_data.state is not None:
        current_user.state = profile_data.state
    if profile_data.test_type is not None:
        current_user.test_type = profile_data.test_type
    
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
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth authentication failed: {str(e)}")
