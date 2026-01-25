"""add marketplace tables

Revision ID: 20250128_marketplace
Revises: 20250128_gamification
Create Date: 2025-01-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = '20250128_marketplace'
down_revision = '20250128_gamification'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Partner Products Table
    op.create_table('partner_product',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('supplier_name', sa.String(length=255), nullable=False),
        sa.Column('supplier_website', sa.String(length=500), nullable=True),
        sa.Column('supplier_phone', sa.String(length=50), nullable=True),
        sa.Column('supplier_email', sa.String(length=255), nullable=True),
        sa.Column('affiliate_link', sa.String(length=500), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_partner_product_category', 'partner_product', ['category'])
    
    # User Listings Table
    op.create_table('user_listing',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('condition', sa.String(length=20), nullable=False),
        sa.Column('images', JSONB, nullable=True),
        sa.Column('location_city', sa.String(length=100), nullable=True),
        sa.Column('location_state', sa.String(length=2), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('facebook_link', sa.String(length=500), nullable=True),
        sa.Column('ebay_link', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_user_listing_user_id', 'user_listing', ['user_id'])
    op.create_index('ix_user_listing_category', 'user_listing', ['category'])
    op.create_index('ix_user_listing_status', 'user_listing', ['status'])
    
    # Listing Inquiries Table
    op.create_table('listing_inquiry',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('listing_id', sa.Integer(), nullable=False),
        sa.Column('buyer_user_id', sa.Integer(), nullable=False),
        sa.Column('seller_user_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('contact_info', sa.String(length=255), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['listing_id'], ['user_listing.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['buyer_user_id'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_listing_inquiry_listing_id', 'listing_inquiry', ['listing_id'])
    op.create_index('ix_listing_inquiry_buyer', 'listing_inquiry', ['buyer_user_id'])
    op.create_index('ix_listing_inquiry_seller', 'listing_inquiry', ['seller_user_id'])
    
    # Lead Tracking Table
    op.create_table('partner_lead',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['partner_product.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_partner_lead_product_id', 'partner_lead', ['product_id'])

def downgrade() -> None:
    op.drop_index('ix_partner_lead_product_id', table_name='partner_lead')
    op.drop_table('partner_lead')
    op.drop_index('ix_listing_inquiry_seller', table_name='listing_inquiry')
    op.drop_index('ix_listing_inquiry_buyer', table_name='listing_inquiry')
    op.drop_index('ix_listing_inquiry_listing_id', table_name='listing_inquiry')
    op.drop_table('listing_inquiry')
    op.drop_index('ix_user_listing_status', table_name='user_listing')
    op.drop_index('ix_user_listing_category', table_name='user_listing')
    op.drop_index('ix_user_listing_user_id', table_name='user_listing')
    op.drop_table('user_listing')
    op.drop_index('ix_partner_product_category', table_name='partner_product')
    op.drop_table('partner_product')
