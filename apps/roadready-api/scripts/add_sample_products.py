"""Add sample partner products"""
from app.core.database import engine
from app.models.marketplace import PartnerProduct
from sqlmodel import Session
from decimal import Decimal

def add_sample_products():
    with Session(engine) as session:
        products = [
            PartnerProduct(
                name="DOT Certified Full Face Helmet",
                description="Premium safety helmet with DOT certification. Multiple sizes available.",
                price=Decimal("89.99"),
                category="Safety Gear",
                image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                supplier_name="SafeRide Gear",
                supplier_website="https://saferidegear.com",
                supplier_phone="+1-800-SAFE-RIDE",
                supplier_email="sales@saferidegear.com",
                affiliate_link="https://saferidegear.com?ref=roadready"
            ),
            PartnerProduct(
                name="Reflective Safety Vest - High Visibility",
                description="ANSI Class 2 certified reflective vest for maximum visibility.",
                price=Decimal("24.99"),
                category="Safety Gear",
                image_url="https://images.unsplash.com/photo-1614359036194-c5c6ab5e8b7f?w=400",
                supplier_name="VisiGuard Safety",
                supplier_website="https://visiguard.com",
                supplier_phone="+1-888-VISI-SAFE",
                supplier_email="info@visiguard.com"
            ),
            PartnerProduct(
                name="Premium Motorcycle Gloves",
                description="Leather gloves with reinforced knuckles and touchscreen compatibility.",
                price=Decimal("45.99"),
                category="Riding Gear",
                image_url="https://images.unsplash.com/photo-1605733513597-a9e5d6f0f8f3?w=400",
                supplier_name="RideGrip Pro",
                supplier_website="https://ridegrip.com",
                supplier_email="support@ridegrip.com"
            ),
            PartnerProduct(
                name="Emergency Roadside Kit - 125 Pieces",
                description="Complete emergency kit with jumper cables, flashlight, first aid, and tools.",
                price=Decimal("79.99"),
                category="Emergency Kits",
                image_url="https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
                supplier_name="RoadReady Supplies",
                supplier_website="https://roadreadysupplies.com",
                supplier_phone="+1-877-ROAD-KIT"
            ),
            PartnerProduct(
                name="Compact First Aid Kit - 200 Pieces",
                description="Comprehensive first aid kit for vehicles. FDA approved supplies.",
                price=Decimal("34.99"),
                category="Emergency Kits",
                image_url="https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400",
                supplier_name="MediCare Auto",
                supplier_website="https://medicareauto.com",
                supplier_email="orders@medicareauto.com"
            ),
            PartnerProduct(
                name="Universal Phone Mount - Dashboard & Windshield",
                description="360° rotation phone holder with strong suction. Fits all phones.",
                price=Decimal("19.99"),
                category="Vehicle Accessories",
                image_url="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",
                supplier_name="MountTech",
                supplier_website="https://mounttech.com",
                supplier_phone="+1-866-MOUNT-IT"
            ),
            PartnerProduct(
                name="LED Tactical Flashlight - 2000 Lumens",
                description="Rechargeable tactical flashlight with 5 modes. Water resistant.",
                price=Decimal("29.99"),
                category="Emergency Kits",
                image_url="https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400",
                supplier_name="BrightPath Gear",
                supplier_website="https://brightpathgear.com",
                supplier_email="sales@brightpathgear.com"
            ),
            PartnerProduct(
                name="Half Face Helmet - Lightweight",
                description="Comfortable half helmet with quick release buckle. DOT approved.",
                price=Decimal("54.99"),
                category="Safety Gear",
                image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                supplier_name="SafeRide Gear",
                supplier_website="https://saferidegear.com",
                supplier_phone="+1-800-SAFE-RIDE"
            ),
            PartnerProduct(
                name="DMV Practice Test Guide 2024",
                description="Complete study guide with 500+ practice questions and answers.",
                price=Decimal("19.99"),
                category="Study Materials",
                image_url="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
                supplier_name="DriveTest Pro",
                supplier_website="https://drivetestpro.com",
                supplier_email="info@drivetestpro.com"
            )
        ]
        
        for product in products:
            session.add(product)
        
        session.commit()
        print(f"Added {len(products)} sample products")

if __name__ == "__main__":
    add_sample_products()
