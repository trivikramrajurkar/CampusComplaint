const CATEGORY_DEPARTMENT = {
  Infrastructure: 'Maintenance',
  Classroom: 'Maintenance',
  Laboratory: 'Maintenance',
  Library: 'Library',
  Cleanliness: 'Maintenance',
  'Wi-Fi / Internet': 'IT',
  Hostel: 'Hostel',
  Transport: 'Transport',
  Other: 'Administration',
};

export async function routeComplaint(prisma, category) {
  const targetName = CATEGORY_DEPARTMENT[category] || 'Other';
  let department = await tx.department.findUnique({ where: { name: targetName } });
  if (!department) department = await tx.department.findUnique({ where: { name: 'Other' } });
  if (!department) department = await tx.department.findUnique({ where: { name: 'Administration' } });
  if (!department) throw new Error(`No department configured for category: ${category}`);
  return department;
}
