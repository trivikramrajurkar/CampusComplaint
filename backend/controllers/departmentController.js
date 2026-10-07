import prisma from '../config/prisma.js';

const detailInclude = {
  student: { select: { id: true, name: true, email: true } },
  class: { select: { id: true, className: true } },
  department: { select: { id: true, name: true } },
  updates: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, name: true, role: true } } } },
};

function departmentFilter(req, res) {
  if (!req.user.departmentId) {
    res.status(403).json({ message: 'Your account is not linked to a department.' });
    return null;
  }
  return { departmentId: req.user.departmentId };
}

export async function getDepartmentComplaints(req, res, next) {
  try {
    const filter = departmentFilter(req, res); if (!filter) return;
    const complaints = await prisma.complaint.findMany({ where: filter, orderBy: { updatedAt: 'desc' }, include: detailInclude });
    res.json({ complaints, stats: {
      assigned: complaints.filter(c => c.status === 'ASSIGNED').length,
      inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
      resolved: complaints.filter(c => c.status === 'RESOLVED').length,
      total: complaints.length,
    } });
  } catch (err) { next(err); }
}

export async function getDepartmentComplaintById(req, res, next) {
  try {
    const filter = departmentFilter(req, res); if (!filter) return;
    const complaint = await prisma.complaint.findFirst({ where: { id: req.params.id, ...filter }, include: detailInclude });
    if (!complaint) {
      const exists = await prisma.complaint.findUnique({ where: { id: req.params.id }, select: { id: true } });
      return res.status(exists ? 403 : 404).json({ message: exists ? 'You cannot access complaints assigned to another department.' : 'Complaint not found.' });
    }
    res.json({ complaint });
  } catch (err) { next(err); }
}

export async function acceptComplaint(req, res, next) {
  try {
    const filter = departmentFilter(req, res); if (!filter) return;
    const complaint = await prisma.complaint.findFirst({ where: { id: req.params.id, ...filter } });
    if (!complaint) {
      const exists = await prisma.complaint.findUnique({ where: { id: req.params.id }, select: { id: true } });
      return res.status(exists ? 403 : 404).json({ message: exists ? 'You cannot access complaints assigned to another department.' : 'Complaint not found.' });
    }
    if (complaint.status !== 'ASSIGNED') return res.status(400).json({ message: 'Only assigned complaints can be accepted.' });
    const message = (req.body.message || `Work started by ${req.user.name}.`).trim();
    await prisma.$transaction(async tx => {
      await tx.complaint.update({ where: { id: complaint.id }, data: { status: 'IN_PROGRESS' } });
      await tx.complaintUpdate.create({ data: { complaintId: complaint.id, userId: req.user.id, status: 'IN_PROGRESS', message } });
    });
    const updated = await prisma.complaint.findUnique({ where: { id: complaint.id }, include: detailInclude });
    res.json({ message: 'Complaint accepted.', complaint: updated });
  } catch (err) { next(err); }
}

export async function updateDepartmentComplaint(req, res, next) {
  try {
    const filter = departmentFilter(req, res); if (!filter) return;
    const { status, message } = req.body;
    if (!['IN_PROGRESS', 'RESOLVED'].includes(status) || !message?.trim()) return res.status(400).json({ message: 'Choose a valid status and enter an update message.' });
    const complaint = await prisma.complaint.findFirst({ where: { id: req.params.id, ...filter } });
    if (!complaint) {
      const exists = await prisma.complaint.findUnique({ where: { id: req.params.id }, select: { id: true } });
      return res.status(exists ? 403 : 404).json({ message: exists ? 'You cannot access complaints assigned to another department.' : 'Complaint not found.' });
    }
    if (!((complaint.status === 'IN_PROGRESS' && status === 'RESOLVED') || complaint.status === status)) return res.status(400).json({ message: `Invalid status transition from ${complaint.status} to ${status}.` });
    await prisma.$transaction(async tx => {
      await tx.complaint.update({ where: { id: complaint.id }, data: { status, ...(status === 'RESOLVED' ? { resolvedAt: new Date(), adminRemark: message.trim() } : {}) } });
      await tx.complaintUpdate.create({ data: { complaintId: complaint.id, userId: req.user.id, status, message: message.trim() } });
    });
    const updated = await prisma.complaint.findUnique({ where: { id: complaint.id }, include: detailInclude });
    res.json({ message: 'Progress updated.', complaint: updated });
  } catch (err) { next(err); }
}
