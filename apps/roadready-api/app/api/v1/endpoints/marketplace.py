from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.marketplace import PartnerProduct, UserListing, ListingInquiry, PartnerLead
from datetime import datetime, timedelta
import json

router = APIRouter()

# Partner Products Endpoints
@router.get("/partner-products")
async def get_partner_products(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = select(PartnerProduct).where(PartnerProduct.is_active == True)
    if category:
        query = query.where(PartnerProduct.category == category)
    products = db.exec(query).all()
    return products

@router.get("/partner-products/{product_id}")
async def get_partner_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(PartnerProduct, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/partner-products/{product_id}/track-lead")
async def track_lead(
    product_id: int,
    lead_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lead = PartnerLead(
        product_id=product_id,
        user_id=current_user.id,
        action=lead_data.get("contact_method", "view")
    )
    db.add(lead)
    db.commit()
    return {"message": "Lead tracked"}

# User Listings Endpoints
@router.get("/listings")
async def get_listings(
    category: Optional[str] = None,
    status: str = "active",
    db: Session = Depends(get_db)
):
    query = select(UserListing, User).join(User).where(UserListing.status == status)
    if category:
        query = query.where(UserListing.category == category)
    query = query.order_by(UserListing.created_at.desc())
    results = db.exec(query).all()
    
    listings = []
    for listing, user in results:
        listing_dict = listing.model_dump()
        seller_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email.split('@')[0]
        listing_dict["seller_name"] = seller_name
        listing_dict["seller_contact"] = user.email
        listings.append(listing_dict)
    return listings

@router.get("/listings/{listing_id}")
async def get_listing(listing_id: int, db: Session = Depends(get_db)):
    result = db.exec(
        select(UserListing, User).join(User).where(UserListing.id == listing_id)
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    listing, user = result
    listing_dict = listing.model_dump()
    seller_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.email.split('@')[0]
    listing_dict["seller_name"] = seller_name
    listing_dict["seller_contact"] = user.email
    return listing_dict

@router.post("/listings")
async def create_listing(
    listing_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    location = listing_data.get("location", "")
    location_parts = location.split(",") if location else ["", ""]
    
    listing = UserListing(
        user_id=current_user.id,
        title=listing_data["title"],
        description=listing_data.get("description"),
        price=listing_data["price"],
        category=listing_data["category"],
        condition=listing_data["condition"],
        images=listing_data.get("images", []),
        location_city=location_parts[0].strip() if len(location_parts) > 0 else None,
        location_state=location_parts[1].strip() if len(location_parts) > 1 else None,
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.put("/listings/{listing_id}")
async def update_listing(
    listing_id: int,
    listing_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.get(UserListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for key, value in listing_data.items():
        setattr(listing, key, value)
    
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/listings/{listing_id}")
async def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.get(UserListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted"}

@router.get("/my-listings")
async def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listings = db.exec(
        select(UserListing)
        .where(UserListing.user_id == current_user.id)
        .order_by(UserListing.created_at.desc())
    ).all()
    return [listing.model_dump() for listing in listings]

# Inquiry Endpoints
@router.post("/listings/{listing_id}/inquire")
async def create_inquiry(
    listing_id: int,
    inquiry_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    listing = db.get(UserListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    inquiry = ListingInquiry(
        listing_id=listing_id,
        buyer_user_id=current_user.id,
        seller_user_id=listing.user_id,
        message=inquiry_data.get("message", "I am interested in this item"),
        contact_info=current_user.email
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return {"message": "Inquiry sent", "seller_contact": db.get(User, listing.user_id).email}

@router.get("/inquiries")
async def get_inquiries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get inquiries where user is buyer or seller
    inquiries = db.exec(
        select(ListingInquiry).where(
            (ListingInquiry.buyer_user_id == current_user.id) |
            (ListingInquiry.seller_user_id == current_user.id)
        ).order_by(ListingInquiry.created_at.desc())
    ).all()
    return inquiries

@router.get("/categories")
async def get_categories():
    return {
        "partner_categories": [
            {"id": "helmets", "name": "Helmets", "icon": "🪖"},
            {"id": "gloves", "name": "Gloves", "icon": "🧤"},
            {"id": "vests", "name": "Safety Vests", "icon": "🦺"},
            {"id": "emergency", "name": "Emergency Kits", "icon": "🚨"},
            {"id": "first_aid", "name": "First Aid", "icon": "🩹"},
            {"id": "mounts", "name": "Phone Mounts", "icon": "📱"},
            {"id": "flashlights", "name": "Flashlights", "icon": "🔦"}
        ],
        "community_categories": [
            {"id": "safety_gear", "name": "Safety Gear", "icon": "🪖"},
            {"id": "study_materials", "name": "Study Materials", "icon": "📚"},
            {"id": "car_accessories", "name": "Car Accessories", "icon": "🚗"},
            {"id": "electronics", "name": "Electronics", "icon": "📱"},
            {"id": "books", "name": "Books", "icon": "📖"},
            {"id": "free_stuff", "name": "Free Stuff", "icon": "🆓"}
        ]
    }
