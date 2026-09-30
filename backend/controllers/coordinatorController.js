import prisma from '../config/prisma.js';

// GET /api/coordinator/complaints — Complaints for coordinator's classes
export async function getCoordinatorComplaints(req, res, next) {
  try {
    // Find classes managed by this coordinator
    const classes = await prisma.class.findMany({
      where: { coordinatorId: req.user.id },
      select: { id: true },
    });

    const classIds = classes.map((c) => c.id);

    if (classIds.length === 0) {
      return res.json({ complaints: [] });
    }

    const complaints = await prisma.complaint.findMany({
      where: { classId: { in: classIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, className: true } },
        department: { select: { id: true, name: true } },
      },
    });

    res.json({ complaints });
  } catch (err) {
    next(err);
  }
}

// GET /api/coordinator/complaints/:id — Coordinator views complaint details
export async function getCoordinatorComplaintById(req, res, next) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        student: { select: { id: true, name: true, email: true } },
        class: { select: { id: true, className: true, coordinatorId: true } },
        department: { select: { id: true, name: true } },
        feedback: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Verify this coordinator manages the complaint's class
    if (complaint.class.coordinatorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only view complaints from your assigned classes.' });
    }

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

// PUT /api/coordinator/complaints/:id/verify
export async function verifyComplaint(req, res, next) {
  try {
    const { coordinatorRemark } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        class: { select: { coordinatorId: true } },
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Verify coordinator manages this class
    if (complaint.class.coordinatorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only verify complaints from your assigned classes.' });
    }

    if (complaint.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ message: `Complaint is already ${complaint.status}. Only pending complaints can be verified.` });
    }

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        status: 'VERIFIED',
        coordinatorRemark: coordinatorRemark || null,
      },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { className: true } },
        department: { select: { name: true } },
      },
    });

    res.json({
      message: 'Complaint verified successfully.',
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/coordinator/complaints/:id/reject
export async function rejectComplaint(req, res, next) {
  try {
    const { rejectionReason, coordinatorRemark } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({ message: 'A rejection reason is required.' });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        class: { select: { coordinatorId: true } },
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Verify coordinator manages this class
    if (complaint.class.coordinatorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only reject complaints from your assigned classes.' });
    }

    if (complaint.status !== 'PENDING_VERIFICATION') {
      return res.status(400).json({ message: `Complaint is already ${complaint.status}. Only pending complaints can be rejected.` });
    }

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        coordinatorRemark: coordinatorRemark || null,
      },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { className: true } },
        department: { select: { name: true } },
      },
    });

    res.json({
      message: 'Complaint rejected.',
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
}
