import prisma from '../config/prisma.js';
import { isValidTransition } from '../utils/constants.js';

// GET /api/admin/complaints — Verified and later-stage complaints
export async function getAdminComplaints(req, res, next) {
  try {
    const { status } = req.query;

    let where = {};
    if (status) {
      where.status = status;
    } else {
      // Admin sees verified and beyond (not pending verification or rejected)
      where.status = { in: ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] };
    }

    const complaints = await prisma.complaint.findMany({
      where,
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

// GET /api/admin/complaints/:id
export async function getAdminComplaintById(req, res, next) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        student: { select: { id: true, name: true, email: true, contactNumber: true } },
        class: { select: { id: true, className: true } },
        department: { select: { id: true, name: true } },
        feedback: { include: { student: { select: { name: true } } } },
      },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    res.json({ complaint });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/complaints/:id/assign — Assign department
export async function assignDepartment(req, res, next) {
  try {
    const { departmentId, adminRemark } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: 'Department is required for assignment.' });
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) {
      return res.status(400).json({ message: 'Selected department does not exist.' });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    if (complaint.status !== 'VERIFIED') {
      return res.status(400).json({ message: 'Only verified complaints can be assigned to a department.' });
    }

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        departmentId,
        status: 'ASSIGNED',
        adminRemark: adminRemark || `Assigned to ${department.name} department.`,
      },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { className: true } },
        department: { select: { id: true, name: true } },
      },
    });

    res.json({
      message: `Complaint assigned to ${department.name} department.`,
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/complaints/:id/status — Update status
export async function updateStatus(req, res, next) {
  try {
    const { status, adminRemark } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Validate transition
    if (!isValidTransition(complaint.status, status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${complaint.status} to ${status}.`,
      });
    }

    const updateData = { status };
    if (adminRemark !== undefined) {
      updateData.adminRemark = adminRemark;
    }

    // When resolving, set resolvedAt
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      if (!adminRemark) {
        return res.status(400).json({ message: 'A resolution remark is required when resolving a complaint.' });
      }
      updateData.adminRemark = adminRemark;
    }

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { className: true } },
        department: { select: { id: true, name: true } },
      },
    });

    res.json({
      message: `Complaint status updated to ${status}.`,
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/departments — List all departments
export async function getDepartments(req, res, next) {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
    res.json({ departments });
  } catch (err) {
    next(err);
  }
}
