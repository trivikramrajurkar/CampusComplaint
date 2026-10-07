import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/jwt.js';

// POST /api/auth/register — Student only
export async function register(req, res, next) {
  try {
    const { name, email, password, contactNumber, classId } = req.body;

    if (!name || !email || !password || !classId) {
      return res.status(400).json({ message: 'Name, email, password, and class are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const classRecord = await prisma.class.findUnique({ where: { id: classId } });
    if (!classRecord) {
      return res.status(400).json({ message: 'Selected class does not exist.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role: 'STUDENT',
        contactNumber: contactNumber || null,
        classId,
      },
      select: { id: true, name: true, email: true, role: true, contactNumber: true, classId: true },
    });

    const token = generateToken({ userId: user.id, role: user.role });

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login — All roles
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user.id, role: user.role });

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
      classId: user.classId,
      departmentId: user.departmentId,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        contactNumber: true,
        classId: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
        class: { select: { id: true, className: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/classes — list classes for registration dropdown
export async function listClasses(req, res, next) {
  try {
    const classes = await prisma.class.findMany({
      select: { id: true, className: true },
      orderBy: { className: 'asc' },
    });
    res.json({ classes });
  } catch (err) {
    next(err);
  }
}
