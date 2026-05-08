"""Map Location Models and Schemas for Pungi Map API 🦅🗺️"""

from typing import Optional
from pydantic import BaseModel, Field


# ==================== MAP DATA MODELS ====================

class LocationBase(BaseModel):
    """Base class for all map locations"""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    
    class Config:
        from_attributes = True


class LocationGeometry(BaseModel):
    """Geometric representation of a location"""
    type: str  # "Point", "Polygon", etc.
    coordinates: list[float]  # Array of coordinates


# ==================== LOCATION SCHEMAS ====================

class LocationCreate(LocationBase):
    """Schema for creating a new location"""
    geometry: LocationGeometry


class LocationUpdate(BaseModel):
    """Schema for updating a location"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    geometry: Optional[LocationGeometry] = None


# ==================== LOCATION RESPONSES ====================

class Location(BaseModel):
    """Map location response model"""
    id: int
    name: str
    description: Optional[str]
    geometry: LocationGeometry
    created_at: Optional[float] = None  # Unix timestamp
    updated_at: Optional[float] = None


# ==================== VIEWPOINT MODELS (User viewing map) ====================

class ViewpointBase(BaseModel):
    """Base class for viewpoints"""
    name: str = Field(..., min_length=1, max_length=200)


class Viewpoint(BaseModel):
    """Viewpoint where user can view the map from"""
    id: int
    name: str
    description: Optional[str]
    latitude: float
    longitude: float
    zoom_level: int  # 1-18 (OpenStreetMap standard)
    pan: bool  # Allow panning
    created_at: Optional[float] = None
    updated_at: Optional[float] = None


# ==================== COORDINATE UTILITIES ====================

class Coordinates(BaseModel):
    """Coordinate utility endpoint response"""
    latitude: float  # WGS84 decimal degrees (-90 to 90)
    longitude: float  # WGS84 decimal degrees (-180 to 180)
    altitude: Optional[float] = None


class GeoJSONFeature(BaseModel):
    """GeoJSON feature for map integration"""
    type: str = "Feature"
    id: Optional[str] = None
    geometry: dict
    properties: dict


# ==================== MAP TILE ENDPOINTS ====================

class MapTilesResponse(BaseModel):
    """Map tiles endpoint response (for tms:// URLs)"""
    url: str  # Base URL for map tiles
    min_zoom: int = 0
    max_zoom: int = 28
    scheme: str = "xyz"


class BoundingRectangles(BaseModel):
    """Bounding rectangles for map queries"""
    northwest: dict[str, float]  # {"lat": ..., "lng": ...}
    southeast: dict[str, float]
