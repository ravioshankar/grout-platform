from sqlmodel import SQLModel, Field, Column
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Text

class PartnerProduct(SQLModel, table=True):
    __tablename__ = "partner_product"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    price: Decimal = Field(max_digits=10, decimal_places=2)
    category: str = Field(max_length=50, index=True)
    image_url: Optional[str] = Field(default=None, max_length=500)
    supplier_name: str = Field(max_length=255)
    supplier_website: Optional[str] = Field(default=None, max_length=500)
    supplier_phone: Optional[str] = Field(default=None, max_length=50)
    supplier_email: Optional[str] = Field(default=None, max_length=255)
    affiliate_link: Optional[str] = Field(default=None, max_length=500)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserListing(SQLModel, table=True):
    __tablename__ = "user_listing"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    price: Decimal = Field(max_digits=10, decimal_places=2)
    category: str = Field(max_length=50, index=True)
    condition: str = Field(max_length=20)
    images: Optional[List] = Field(default=None, sa_column=Column(JSONB))
    location_city: Optional[str] = Field(default=None, max_length=100)
    location_state: Optional[str] = Field(default=None, max_length=2)
    status: str = Field(default="active", max_length=20, index=True)
    facebook_link: Optional[str] = Field(default=None, max_length=500)
    ebay_link: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class ListingInquiry(SQLModel, table=True):
    __tablename__ = "listing_inquiry"
    id: Optional[int] = Field(default=None, primary_key=True)
    listing_id: int = Field(foreign_key="user_listing.id", index=True)
    buyer_user_id: int = Field(foreign_key="user.id", index=True)
    seller_user_id: int = Field(foreign_key="user.id", index=True)
    message: str = Field(sa_column=Column(Text))
    contact_info: Optional[str] = Field(default=None, max_length=255)
    status: str = Field(default="pending", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PartnerLead(SQLModel, table=True):
    __tablename__ = "partner_lead"
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="partner_product.id", index=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    action: str = Field(max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)
