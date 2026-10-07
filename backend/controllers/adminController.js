import prisma from '../config/prisma.js';
import { isValidTransition, STATUS_LIST } from '../utils/constants.js';
import bcrypt from 'bcryptjs';

// GET /api/admin/complaints — Verified and later-stage complaints
export async function getAdminComplaints(req, res, next) {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, className: true } },
        department: { select: { id: true, name: true } },
      },
    });
    const [coordinators, admins, departmentUsers, departmentActivity] = await Promise.all([
      prisma.user.count({ where: { role: 'COORDINATOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'DEPARTMENT' } }),
      prisma.department.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { complaints: { where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } } } } } },
      }),
    ]);
    res.json({ complaints, userCounts: { coordinators, admins, departmentUsers }, departmentActivity: departmentActivity.map(d => ({ id: d.id, name: d.name, activeComplaints: d._count.complaints })) });
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
        updates: { orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true, role: true } } } },
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

    await prisma.$transaction(async tx => {
      const updatedComplaint = await tx.complaint.update({ where: { id: req.params.id }, data: { departmentId, status: 'ASSIGNED', assignedAt: new Date(), adminRemark: adminRemark || `Assigned to ${department.name} department.` } });
      await tx.complaintUpdate.create({ data: { complaintId: updatedComplaint.id, userId: req.user.id, status: 'ASSIGNED', message: `Admin changed department assignment to ${department.name}. ${adminRemark || ''}`.trim() } });
    });
    const updated = await prisma.complaint.findUnique({ where: { id: req.params.id }, include: {
      student: { select: { id: true, name: true } },
      class: { select: { className: true } },
      department: { select: { id: true, name: true } },
      updates: { orderBy: { createdAt: 'asc' } },
    } });

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
    if (!STATUS_LIST.includes(status)) return res.status(400).json({ message: 'Invalid complaint status.' });

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
    });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Validate transition
    if (complaint.status !== status && !isValidTransition(complaint.status, status) && !adminRemark?.trim()) {
      return res.status(400).json({
        message: `An administrative override remark is required to change status from ${complaint.status} to ${status}.`,
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

    await prisma.$transaction(async tx => {
      await tx.complaint.update({ where: { id: complaint.id }, data: updateData });
      await tx.complaintUpdate.create({ data: { complaintId: complaint.id, userId: req.user.id, status, message: (adminRemark || `Admin changed complaint status to ${status}.`).trim() } });
    });
    const updated = await prisma.complaint.findUnique({ where: { id: complaint.id }, include: {
      student: { select: { id: true, name: true } },
      class: { select: { className: true } },
      department: { select: { id: true, name: true } },
      updates: { orderBy: { createdAt: 'asc' } },
    } });

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

const safeUser = { id: true, name: true, email: true, role: true, contactNumber: true, classId: true, departmentId: true, createdAt: true, department: { select: { id: true, name: true } }, managedClasses: { select: { id: true, className: true } } };

export async function getUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({ where: { role: { in: ['COORDINATOR', 'ADMIN', 'DEPARTMENT'] } }, select: safeUser, orderBy: { name: 'asc' } });
    const classes = await prisma.class.findMany({ select: { id: true, className: true }, orderBy: { className: 'asc' } });
    const departments = await prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    res.json({ users, classes, departments });
  } catch (err) { next(err); }
}

export async function createCoordinator(req, res, next) {
  try {
    const { name, email, contactNumber, password, classIds } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8 || !Array.isArray(classIds) || !classIds.length) return res.status(400).json({ message: 'Name, email, password (at least 8 characters), and one or more classes are required.' });
    const normalizedEmail = email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const validCount = await prisma.class.count({ where: { id: { in: classIds } } });
    if (validCount !== new Set(classIds).size) return res.status(400).json({ message: 'One or more selected classes do not exist.' });
    const hash = await bcrypt.hash(password, 10);
    const created = await prisma.$transaction(async tx => {
      const created = await tx.user.create({ data: { name: name.trim(), email: normalizedEmail, contactNumber: contactNumber?.trim() || null, password: hash, role: 'COORDINATOR' }, select: safeUser });
      await tx.class.updateMany({ where: { id: { in: classIds } }, data: { coordinatorId: created.id } });
      return created.id;
    });
    const user = await prisma.user.findUnique({ where: { id: created }, select: safeUser });
    res.status(201).json({ message: 'Coordinator created.', user });
  } catch (err) { next(err); }
}

export async function createDepartmentUser(req, res, next) {
  try {
    const { name, email, contactNumber, password, departmentId } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8 || !departmentId) return res.status(400).json({ message: 'Name, email, password (at least 8 characters), and department are required.' });
    const [exists, department] = await Promise.all([prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } }), prisma.department.findUnique({ where: { id: departmentId } })]);
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    if (!department) return res.status(400).json({ message: 'Department does not exist.' });
    const user = await prisma.user.create({ data: { name: name.trim(), email: email.trim().toLowerCase(), contactNumber: contactNumber?.trim() || null, password: await bcrypt.hash(password, 10), role: 'DEPARTMENT', departmentId }, select: safeUser });
    res.status(201).json({ message: 'Department account created.', user });
  } catch (err) { next(err); }
}

export async function changeUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['COORDINATOR', 'ADMIN'].includes(role)) return res.status(400).json({ message: 'Role must be COORDINATOR or ADMIN.' });
    if (req.params.id === req.user.id) return res.status(400).json({ message: 'You cannot change your own role.' });
    const result = await prisma.$transaction(async tx => {
      const target = await tx.user.findUnique({ where: { id: req.params.id } });
      if (!target || !['COORDINATOR', 'ADMIN'].includes(target.role)) return { error: 'Only coordinator and admin accounts can be changed.' };
      if (target.role === 'ADMIN' && role === 'COORDINATOR') {
        const adminCount = await tx.user.count({ where: { role: 'ADMIN' } });
        if (adminCount <= 1) return { error: 'At least one administrator must remain.' };
      }
      await tx.user.update({ where: { id: target.id }, data: { role } });
      await tx.auditLog.create({ data: { actorUserId: req.user.id, targetUserId: target.id, action: 'ROLE_CHANGED', oldRole: target.role, newRole: role } });
      return { userId: target.id };
    });
    if (result.error) return res.status(400).json({ message: result.error });
    const user = await prisma.user.findUnique({ where: { id: result.userId }, select: safeUser });
    res.json({ message: 'User role updated.', user });
  } catch (err) { next(err); }
}
