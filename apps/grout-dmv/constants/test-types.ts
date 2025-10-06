export interface TestType {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'commercial' | 'motorcycle' | 'special' | 'endorsement';
  icon: string;
  requiresCDL?: boolean;
}

export const TEST_TYPES: TestType[] = [
  // Standard License Tests
  { id: 'class-c', name: 'Class C - Passenger Car', description: 'Standard automobile license', category: 'standard', icon: '🚗' },
  { id: 'learners-permit', name: "Learner's Permit", description: 'First-time drivers (written only)', category: 'standard', icon: '📝' },
  { id: 'provisional', name: 'Provisional License', description: 'Teen/intermediate drivers', category: 'standard', icon: '🎓' },
  
  // Motorcycle Tests
  { id: 'class-m', name: 'Class M - Motorcycle', description: 'Two-wheeled motorcycles', category: 'motorcycle', icon: '🏍️' },
  { id: 'scooter', name: 'Scooter/Moped', description: 'Low-speed two-wheeled vehicles', category: 'motorcycle', icon: '🛵' },
  
  // Commercial License Tests
  { id: 'class-a', name: 'Class A - Commercial', description: 'Combination vehicles (tractor-trailers)', category: 'commercial', icon: '🚛', requiresCDL: true },
  { id: 'class-b', name: 'Class B - Commercial', description: 'Heavy straight vehicles (buses, trucks)', category: 'commercial', icon: '🚌', requiresCDL: true },
  { id: 'school-bus', name: 'School Bus', description: 'Passenger transport for students', category: 'commercial', icon: '🚸', requiresCDL: true },
  { id: 'passenger-bus', name: 'Passenger Bus', description: 'Public/private passenger transport', category: 'commercial', icon: '🚍', requiresCDL: true },
  { id: 'tank-vehicle', name: 'Tank Vehicle', description: 'Liquid/gas cargo transport', category: 'commercial', icon: '🛢️', requiresCDL: true },
  { id: 'hazmat', name: 'Hazardous Materials', description: 'Dangerous goods transport', category: 'commercial', icon: '☢️', requiresCDL: true },
  { id: 'double-triple', name: 'Double/Triple Trailers', description: 'Multiple trailer combinations', category: 'commercial', icon: '🚚', requiresCDL: true },
  
  // Endorsements
  { id: 'endorsement-p', name: 'P - Passenger Endorsement', description: 'Buses carrying 16+ passengers', category: 'endorsement', icon: '👥', requiresCDL: true },
  { id: 'endorsement-s', name: 'S - School Bus Endorsement', description: 'School bus operation', category: 'endorsement', icon: '🎒', requiresCDL: true },
  { id: 'endorsement-n', name: 'N - Tank Endorsement', description: 'Tank vehicle operation', category: 'endorsement', icon: '⛽', requiresCDL: true },
  { id: 'endorsement-h', name: 'H - HazMat Endorsement', description: 'Hazardous materials transport', category: 'endorsement', icon: '⚠️', requiresCDL: true },
  { id: 'endorsement-t', name: 'T - Trailer Endorsement', description: 'Double/triple trailers', category: 'endorsement', icon: '🔗', requiresCDL: true },
  { id: 'air-brakes', name: 'Air Brakes', description: 'Vehicles with air brake systems', category: 'endorsement', icon: '🔧', requiresCDL: true },
  
  // Special Tests
  { id: 'rv-motorhome', name: 'RV/Motorhome', description: 'Recreational vehicles', category: 'special', icon: '🚐' },
  { id: 'taxi-livery', name: 'Taxi/Livery', description: 'For-hire vehicle operators', category: 'special', icon: '🚕' },
  { id: 'rideshare', name: 'Rideshare (TNC)', description: 'Uber/Lyft driver requirements', category: 'special', icon: '📱' },
  { id: 'manual-transmission', name: 'Manual Transmission', description: 'Stick shift vehicles', category: 'special', icon: '⚙️' },
  { id: 'senior-renewal', name: 'Senior Driver Renewal', description: 'Age-specific testing', category: 'special', icon: '👴' },
];

export const getTestTypesByCategory = (category: string): TestType[] => {
  return TEST_TYPES.filter(t => t.category === category);
};

export const getTestTypeById = (id: string): TestType | undefined => {
  return TEST_TYPES.find(t => t.id === id);
};

export const TEST_CATEGORIES = [
  { id: 'standard', name: 'Standard License', icon: '🚗' },
  { id: 'motorcycle', name: 'Motorcycle', icon: '🏍️' },
  { id: 'commercial', name: 'Commercial (CDL)', icon: '🚛' },
  { id: 'endorsement', name: 'Endorsements', icon: '✅' },
  { id: 'special', name: 'Special Tests', icon: '⭐' },
];
