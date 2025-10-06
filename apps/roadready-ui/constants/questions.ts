import { Question } from './types';

export const QUESTIONS_DATABASE: Question[] = [
  // Road Signs Questions
  {
    id: 'rs_001',
    stateCode: 'CA',
    category: 'road-signs',
    question: 'What does a red octagonal sign mean?',
    options: ['Yield', 'Stop', 'Caution', 'No Entry'],
    correctAnswer: 1,
    explanation: 'A red octagonal sign always means STOP.',
  },
  {
    id: 'rs_002',
    stateCode: 'CA',
    category: 'road-signs',
    question: 'What does a yellow diamond-shaped sign indicate?',
    options: ['Construction zone', 'Warning', 'School zone', 'Speed limit'],
    correctAnswer: 1,
    explanation: 'Yellow diamond-shaped signs are warning signs.',
  },
  {
    id: 'rs_003',
    stateCode: 'CA',
    category: 'road-signs',
    question: 'What does a triangular sign with red border mean?',
    options: ['Stop', 'Yield', 'Merge', 'No passing'],
    correctAnswer: 1,
    explanation: 'A triangular sign with red border means yield.',
  },

  // Traffic Laws Questions
  {
    id: 'tl_001',
    stateCode: 'CA',
    category: 'traffic-laws',
    question: 'What is the speed limit in residential areas in California?',
    options: ['15 mph', '25 mph', '35 mph', '45 mph'],
    correctAnswer: 1,
    explanation: 'The speed limit in residential areas is 25 mph unless otherwise posted.',
  },
  {
    id: 'tl_002',
    stateCode: 'CA',
    category: 'traffic-laws',
    question: 'When must you use headlights?',
    options: ['Only at night', '30 minutes after sunset', 'When visibility is less than 1000 feet', 'All of the above'],
    correctAnswer: 3,
    explanation: 'Headlights are required at night, 30 minutes after sunset, and when visibility is less than 1000 feet.',
  },

  // Safe Driving Questions
  {
    id: 'sd_001',
    stateCode: 'CA',
    category: 'safe-driving',
    question: 'What is the recommended following distance in good weather?',
    options: ['1 second', '2 seconds', '3 seconds', '4 seconds'],
    correctAnswer: 2,
    explanation: 'The 3-second rule is recommended for following distance in good weather.',
  },
  {
    id: 'sd_002',
    stateCode: 'CA',
    category: 'safe-driving',
    question: 'When should you check your blind spots?',
    options: ['Before changing lanes', 'Before merging', 'Before turning', 'All of the above'],
    correctAnswer: 3,
    explanation: 'Always check blind spots before changing lanes, merging, or turning.',
  },

  // Parking Questions
  {
    id: 'pk_001',
    stateCode: 'CA',
    category: 'parking',
    question: 'How far from a fire hydrant must you park?',
    options: ['5 feet', '10 feet', '15 feet', '20 feet'],
    correctAnswer: 2,
    explanation: 'You must park at least 15 feet away from a fire hydrant.',
  },

  // Right of Way Questions
  {
    id: 'rw_001',
    stateCode: 'CA',
    category: 'right-of-way',
    question: 'At a 4-way stop, who has the right of way?',
    options: ['The largest vehicle', 'The vehicle that arrived first', 'The vehicle on the right', 'The vehicle going straight'],
    correctAnswer: 1,
    explanation: 'At a 4-way stop, the vehicle that arrived first has the right of way.',
  },

  // Emergency Questions
  {
    id: 'em_001',
    stateCode: 'CA',
    category: 'emergency',
    question: 'What should you do if your brakes fail?',
    options: ['Pump the brakes', 'Use the parking brake gradually', 'Shift to lower gear', 'All of the above'],
    correctAnswer: 3,
    explanation: 'If brakes fail, pump the brakes, use parking brake gradually, and shift to lower gear.',
  },

  // Add questions for other states (NY example)
  {
    id: 'ny_rs_001',
    stateCode: 'NY',
    category: 'road-signs',
    question: 'What does a red octagonal sign mean?',
    options: ['Yield', 'Stop', 'Caution', 'No Entry'],
    correctAnswer: 1,
    explanation: 'A red octagonal sign always means STOP.',
  },
  {
    id: 'ny_tl_001',
    stateCode: 'NY',
    category: 'traffic-laws',
    question: 'What is the speed limit in school zones in New York?',
    options: ['15 mph', '20 mph', '25 mph', '30 mph'],
    correctAnswer: 1,
    explanation: 'The speed limit in school zones is 15 mph when children are present.',
  },

  // Texas questions
  {
    id: 'tx_rs_001',
    stateCode: 'TX',
    category: 'road-signs',
    question: 'What does a red octagonal sign mean?',
    options: ['Yield', 'Stop', 'Caution', 'No Entry'],
    correctAnswer: 1,
    explanation: 'A red octagonal sign always means STOP.',
  },
  {
    id: 'tx_tl_001',
    stateCode: 'TX',
    category: 'traffic-laws',
    question: 'What is the maximum speed limit on Texas highways?',
    options: ['65 mph', '70 mph', '75 mph', '85 mph'],
    correctAnswer: 3,
    explanation: 'Some Texas highways have speed limits up to 85 mph.',
  },
];

export const getQuestionsByState = (stateCode: string): Question[] => {
  return QUESTIONS_DATABASE.filter(q => q.stateCode === stateCode);
};

export const getQuestionsByCategory = (stateCode: string, category: string): Question[] => {
  return QUESTIONS_DATABASE.filter(q => q.stateCode === stateCode && q.category === category);
};

export const getRandomQuestions = (stateCode: string, count: number = 20): Question[] => {
  const stateQuestions = getQuestionsByState(stateCode);
  const shuffled = [...stateQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};