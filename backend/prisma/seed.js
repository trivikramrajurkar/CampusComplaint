import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.feedback.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.department.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Create Admin ---
  const admin = await prisma.user.create({
    data: {
      name: 'Campus Admin',
      email: 'admin@campus.edu',
      password: passwordHash,
      role: 'ADMIN',
      contactNumber: '9000000000',
    },
  });
  console.log('Created admin:', admin.email);

  // --- Create Coordinators ---
  const coordinatorA = await prisma.user.create({
    data: {
      name: 'Coordinator A',
      email: 'coord.a@campus.edu',
      password: passwordHash,
      role: 'COORDINATOR',
      contactNumber: '9100000001',
    },
  });

  const coordinatorB = await prisma.user.create({
    data: {
      name: 'Coordinator B',
      email: 'coord.b@campus.edu',
      password: passwordHash,
      role: 'COORDINATOR',
      contactNumber: '9100000002',
    },
  });

  const coordinatorC = await prisma.user.create({
    data: {
      name: 'Coordinator C',
      email: 'coord.c@campus.edu',
      password: passwordHash,
      role: 'COORDINATOR',
      contactNumber: '9100000003',
    },
  });
  console.log('Created coordinators');

  // --- Create Classes ---
  const classA = await prisma.class.create({
    data: {
      className: 'SY-CSE-A',
      department: 'Computer Engineering',
      coordinatorId: coordinatorA.id,
    },
  });

  const classB = await prisma.class.create({
    data: {
      className: 'SY-CSE-B',
      department: 'Computer Engineering',
      coordinatorId: coordinatorB.id,
    },
  });

  const classC = await prisma.class.create({
    data: {
      className: 'SY-CSE-C',
      department: 'Computer Engineering',
      coordinatorId: coordinatorC.id,
    },
  });
  console.log('Created classes');

  // --- Create Students ---
  const student1 = await prisma.user.create({
    data: {
      name: 'Student One',
      email: 'student1@campus.edu',
      password: passwordHash,
      role: 'STUDENT',
      contactNumber: '9200000001',
      classId: classA.id,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'Student Two',
      email: 'student2@campus.edu',
      password: passwordHash,
      role: 'STUDENT',
      contactNumber: '9200000002',
      classId: classB.id,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'Student Three',
      email: 'student3@campus.edu',
      password: passwordHash,
      role: 'STUDENT',
      contactNumber: '9200000003',
      classId: classC.id,
    },
  });
  console.log('Created students');

  // --- Create Departments ---
  const departmentNames = [
    'Administration',
    'IT',
    'Maintenance',
    'Library',
    'Hostel',
    'Security',
    'Transport',
    'Other',
  ];

  const departments = await Promise.all(
    departmentNames.map((name) =>
      prisma.department.create({ data: { name } })
    )
  );
  console.log('Created departments');

  const itDept = departments.find((d) => d.name === 'IT');

  // --- Create Sample Complaints in various statuses ---
  // 1. Pending verification
  await prisma.complaint.create({
    data: {
      studentId: student1.id,
      classId: classA.id,
      title: 'Projector not working in Room 201',
      category: 'Classroom',
      description: 'The projector in Room 201 is not displaying any image. It has been broken for two days.',
      location: 'Room 201, Main Building',
      priority: 'HIGH',
      status: 'PENDING_VERIFICATION',
    },
  });

  // 2. Verified (waiting for admin)
  const verifiedComplaint = await prisma.complaint.create({
    data: {
      studentId: student2.id,
      classId: classB.id,
      title: 'Wi-Fi not working in Lab 3',
      category: 'Wi-Fi / Internet',
      description: 'The internet connection in Lab 3 has been down since yesterday.',
      location: 'Lab 3, IT Building',
      priority: 'MEDIUM',
      status: 'VERIFIED',
      coordinatorRemark: 'Confirmed. Wi-Fi issue is real and needs IT attention.',
    },
  });

  // 3. Assigned
  await prisma.complaint.create({
    data: {
      studentId: student3.id,
      classId: classC.id,
      title: 'Broken chair in classroom',
      category: 'Classroom',
      description: 'Several chairs in the classroom are broken and need replacement.',
      location: 'Room 105',
      priority: 'LOW',
      status: 'ASSIGNED',
      coordinatorRemark: 'Verified during rounds.',
      departmentId: departments.find((d) => d.name === 'Maintenance').id,
      adminRemark: 'Assigned to Maintenance department.',
    },
  });

  // 4. In Progress
  await prisma.complaint.create({
    data: {
      studentId: student1.id,
      classId: classA.id,
      title: 'Library AC not cooling',
      category: 'Library',
      description: 'The air conditioning in the library is not working, making it uncomfortable to study.',
      location: 'Library, 2nd Floor',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      coordinatorRemark: 'Confirmed by librarian.',
      departmentId: departments.find((d) => d.name === 'Maintenance').id,
      adminRemark: 'Maintenance team is working on it.',
    },
  });

  // 5. Resolved (with feedback)
  const resolvedComplaint = await prisma.complaint.create({
    data: {
      studentId: student2.id,
      classId: classB.id,
      title: 'Water cooler not working',
      category: 'Infrastructure',
      description: 'The water cooler on the ground floor is not dispensing water.',
      location: 'Ground Floor, Main Building',
      priority: 'HIGH',
      status: 'RESOLVED',
      coordinatorRemark: 'Confirmed. Needs immediate attention.',
      departmentId: itDept.id,
      adminRemark: 'Water cooler repaired and tested. Working fine now.',
      resolvedAt: new Date(),
    },
  });

  await prisma.feedback.create({
    data: {
      complaintId: resolvedComplaint.id,
      studentId: student2.id,
      rating: 4,
      comment: 'Issue was resolved quickly. Thank you!',
    },
  });

  // 6. Rejected
  await prisma.complaint.create({
    data: {
      studentId: student3.id,
      classId: classC.id,
      title: 'Unfair marking in assignment',
      category: 'Other',
      description: 'I think the marks for assignment 2 are unfair.',
      location: 'N/A',
      priority: 'LOW',
      status: 'REJECTED',
      coordinatorRemark: 'This is an academic evaluation matter, not a campus facility complaint. Please contact the subject teacher.',
      rejectionReason: 'This does not fall under campus facility complaints. Please raise it with the respective faculty.',
    },
  });

  console.log('Created sample complaints');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
