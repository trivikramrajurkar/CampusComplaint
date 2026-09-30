import prisma from '../config/prisma.js';
import { COMPLAINT_CATEGORIES, PRIORITY_LEVELS } from '../utils/constants.js';

// POST /api/complaints — Student creates complaint
export async function createComplaint(req, res, next) {
  try {
    const { title, category, description, location, priority } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({ message: 'Title, category, and description are required.' });
    }

    if (!COMPLAINT_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category.' });
    }

    const priorityValue = priority || 'MEDIUM';
    if (!PRIORITY_LEVELS.includes(priorityValue)) {
      return res.status(400).json({ message: 'Invalid priority level.' });
    }

    // Get student's class
    const student = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { classId: true, role: true },
    });

    if (!student || student.role !== 'STUDENT') {
      return res.status(403).json({ message: 'Only students can submit complaints.' });
    }

    if (!student.classId) {
      return res.status(400).json({ message: 'You are not assigned to a class. Please contact support.' });
    }

    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const complaint = await prisma.complaint.create({
      data: {
        studentId: req.user.id,
        classId: student.classId,
        title,
        category,
        description,
        location: location || null,
        priority: priorityValue,
        attachmentUrl,
        status: 'PENDING_VERIFICATION',
      },
      include: {
        class: { select: { id: true, className: true } },
        department: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/my — Student's own complaints
export async function getMyComplaints(req, res, next) {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        class: { select: { className: true } },
        department: { select: { name: true } },
      },
    });

    res.json({ complaints });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id — Student views own complaint
export async function getComplaintById(req, res, next) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, className: true } },
        department: { select: { id: true, name: true } },
        feedback: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Students can only see their own complaints
    if (req.user.role === 'STUDENT' && complaint.studentId !== req.user.id) {
      return res.status(403).json({ message: 'You can only view your own complaints.' });
    }

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

// POST /api/complaints/:id/feedback — Student submits feedback
export async function createFeedback(req, res, next) {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { feedback: true },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    if (complaint.studentId !== req.user.id) {
      return res.status(403).json({ message: 'You can only submit feedback for your own complaints.' });
    }

    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({ message: 'Feedback can only be submitted after the complaint is resolved.' });
    }

    if (complaint.feedback) {
      return res.status(409).json({ message: 'Feedback has already been submitted for this complaint.' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        complaintId: complaint.id,
        studentId: req.user.id,
        rating: parseInt(rating),
        comment: comment || null,
      },
    });

    res.status(201).json({
      message: 'Feedback submitted successfully.',
      feedback,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/complaints/:id/feedback — Get feedback for a complaint
export async function getFeedback(req, res, next) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Students can only view feedback for their own complaints
    if (req.user.role === 'STUDENT' && complaint.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { complaintId: req.params.id },
    });

    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}
