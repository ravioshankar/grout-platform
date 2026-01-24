from sqlmodel import SQLModel, Field

class EmailVerificationRequest(SQLModel):
    email: str = Field(description="Email to verify")

class EmailVerificationConfirm(SQLModel):
    token: str = Field(description="Verification token from email")

class PasswordResetRequest(SQLModel):
    email: str = Field(description="Email address for password reset")

class PasswordResetConfirm(SQLModel):
    token: str = Field(description="Reset token from email")
    new_password: str = Field(min_length=8, description="New password")

class MessageResponse(SQLModel):
    message: str
