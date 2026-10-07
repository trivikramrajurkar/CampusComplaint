import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const demoPassword = process.env.SEED_DEMO_PASSWORD || 'password123';

async function main() {
  const password = await bcrypt.hash(demoPassword, 10);
  const departments = {};
  for (const name of ['Administration', 'IT', 'Maintenance', 'Library', 'Hostel', 'Security', 'Transport', 'Other']) {
    departments[name] = await prisma.department.upsert({ where: { name }, update: {}, create: { name } });
  }

  const ensureUser = async (email, data) => prisma.user.upsert({ where: { email }, update: data, create: { ...data, email, password } });
  const admin = await ensureUser('admin@campus.edu', { name: 'Campus Admin', role: 'ADMIN', contactNumber: '9000000000' });
  const coordinator = await ensureUser('coord.a@campus.edu', { name: 'Coordinator A', role: 'COORDINATOR', contactNumber: '9100000001' });
  const classA = await prisma.class.upsert({ where: { className: 'SY-CSE-A' }, update: { coordinatorId: coordinator.id }, create: { className: 'SY-CSE-A', department: 'Computer Engineering', coordinatorId: coordinator.id } });
  const coordinatorB = await ensureUser('coord.b@campus.edu', { name: 'Coordinator B', role: 'COORDINATOR', contactNumber: '9100000002' });
  const coordinatorC = await ensureUser('coord.c@campus.edu', { name: 'Coordinator C', role: 'COORDINATOR', contactNumber: '9100000003' });
  const classB = await prisma.class.upsert({ where: { className: 'SY-CSE-B' }, update: { coordinatorId: coordinatorB.id }, create: { className: 'SY-CSE-B', department: 'Computer Engineering', coordinatorId: coordinatorB.id } });
  const classC = await prisma.class.upsert({ where: { className: 'SY-CSE-C' }, update: { coordinatorId: coordinatorC.id }, create: { className: 'SY-CSE-C', department: 'Computer Engineering', coordinatorId: coordinatorC.id } });
  const student = await ensureUser('student1@campus.edu', { name: 'Student One', role: 'STUDENT', contactNumber: '9200000001', classId: classA.id });
  const staff = [
    ['it@campus.edu', 'IT Department', 'IT'],
    ['maintenance@campus.edu', 'Maintenance Department', 'Maintenance'],
    ['library@campus.edu', 'Library Department', 'Library'],
    ['hostel@campus.edu', 'Hostel Department', 'Hostel'],
    ['transport@campus.edu', 'Transport Department', 'Transport'],
  ];
  for (const [email, name, departmentName] of staff) await ensureUser(email, { name, role: 'DEPARTMENT', departmentId: departments[departmentName].id });
  await ensureUser('student2@campus.edu', { name: 'Student Two', role: 'STUDENT', contactNumber: '9200000002', classId: classB.id });
  await ensureUser('student3@campus.edu', { name: 'Student Three', role: 'STUDENT', contactNumber: '9200000003', classId: classC.id });

  const examples = [
    { title: 'Sample projector inspection', category: 'Classroom', status: 'PENDING_VERIFICATION', priority: 'HIGH' },
    { title: 'Wi-Fi not working in Lab 3', category: 'Wi-Fi / Internet', status: 'ASSIGNED', priority: 'HIGH', departmentId: departments.IT.id, assignedAt: new Date() },
    { title: 'Library reading room lights', category: 'Library', status: 'IN_PROGRESS', priority: 'MEDIUM', departmentId: departments.Library.id, assignedAt: new Date() },
    { title: 'Hostel water supply repaired', category: 'Hostel', status: 'RESOLVED', priority: 'HIGH', departmentId: departments.Hostel.id, assignedAt: new Date(), resolvedAt: new Date(), adminRemark: 'Water supply restored and checked.' },
    { title: 'Academic marks query', category: 'Other', status: 'REJECTED', priority: 'LOW', rejectionReason: 'Academic matters should be raised with the course faculty.' },
  ];
  for (const example of examples) {
    let complaint = await prisma.complaint.findFirst({ where: { title: example.title } });
    if (!complaint) complaint = await prisma.complaint.create({ data: { studentId: student.id, classId: classA.id, description: `Demonstration complaint for ${example.category}.`, location: 'Campus', ...example } });
    const currentHistory = await prisma.complaintUpdate.count({ where: { complaintId: complaint.id } });
    if (!currentHistory) {
      await prisma.complaintUpdate.create({ data: { complaintId: complaint.id, userId: student.id, status: 'PENDING_VERIFICATION', message: 'Complaint submitted by student.' } });
      if (['ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].includes(complaint.status)) {
        await prisma.complaintUpdate.create({ data: { complaintId: complaint.id, userId: coordinator.id, status: 'VERIFIED', message: 'Complaint verified by coordinator.' } });
        const assignedDepartment = await prisma.department.findUnique({ where: { id: complaint.departmentId }, select: { name: true } });
        await prisma.complaintUpdate.create({ data: { complaintId: complaint.id, userId: coordinator.id, status: 'ASSIGNED', message: `Complaint automatically assigned to ${assignedDepartment?.name || 'department'} department.` } });
      } else if (complaint.status === 'REJECTED') {
        await prisma.complaintUpdate.create({ data: { complaintId: complaint.id, userId: coordinator.id, status: 'REJECTED', message: complaint.rejectionReason || 'Complaint rejected.' } });
      }
      if (['IN_PROGRESS', 'RESOLVED'].includes(complaint.status)) await prisma.complaintUpdate.create({ data: { complaintId: complaint.id, userId: null, status: 'IN_PROGRESS', message: 'Work started by department.' } });
      if (complaint.status === 'RESOLVED') await prisma.complaintUpdate.create({ data: { complaintId: complaint.id, userId: null, status: 'RESOLVED', message: complaint.adminRemark || 'Complaint resolved by department.' } });
    }
  }
  console.log('Seed complete. Demo password is configured with SEED_DEMO_PASSWORD or defaults to password123.');
  console.log(`Admin: ${admin.email}; Department accounts: ${staff.map(([email]) => email).join(', ')}`);
}

main().catch(error => { console.error('Seed error:', error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
