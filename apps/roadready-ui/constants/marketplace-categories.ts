export interface MarketplaceCategory {
  name: string;
  icon: string;
  description?: string;
}

// Unified categories for both Partner Store and Community Marketplace
// Focused on road safety, driving preparation, and road travel
export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { name: 'All', icon: 'grid', description: 'All items' },
  { name: 'Safety Gear', icon: 'shield-checkmark', description: 'Helmets, vests, reflective gear, protective equipment' },
  { name: 'Study Materials', icon: 'book', description: 'DMV guides, practice tests, driving manuals' },
  { name: 'Vehicle Accessories', icon: 'car', description: 'Phone mounts, organizers, dash cams, GPS' },
  { name: 'Emergency Kits', icon: 'medkit', description: 'First aid, roadside emergency supplies, tools' },
  { name: 'Riding Gear', icon: 'bicycle', description: 'Motorcycle/bike gear, gloves, jackets' },
  { name: 'Travel Essentials', icon: 'bag-handle', description: 'Road trip gear, coolers, travel bags' },
  { name: 'Navigation & Tech', icon: 'navigate', description: 'GPS devices, maps, communication devices' },
  { name: 'Maintenance Tools', icon: 'construct', description: 'Vehicle maintenance, repair kits, tire tools' },
  { name: 'Other', icon: 'ellipsis-horizontal', description: 'Miscellaneous road-related items' },
];

// Category name type for type safety
export type CategoryName = typeof MARKETPLACE_CATEGORIES[number]['name'];
