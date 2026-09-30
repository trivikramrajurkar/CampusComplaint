// Valid complaint status transitions
export const VALID_TRANSITIONS = {
  PENDING_VERIFICATION: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  REJECTED: [],
  RESOLVED: [],
};

export function isValidTransition(from, to) {
  const allowed = VALID_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export const COMPLAINT_CATEGORIES = [
  'Infrastructure',
  'Classroom',
  'Laboratory',
  'Library',
  'Cleanliness',
  'Wi-Fi / Internet',
  'Hostel',
  'Transport',
  'Other',
];

export const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const STATUS_LIST = [
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
];
