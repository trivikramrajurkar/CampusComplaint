import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

// Authenticate user via JWT
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contactNumber: true,
        classId: true,
        departmentId: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }
    if (user.role === 'DEPARTMENT' && !user.departmentId) {
      return res.status(403).json({ message: 'This department account is not linked to a department. Contact an administrator.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in.' });
  }
}

// Role-based authorization
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}
