import { Router } from 'express';
import {
  getAdminComplaints,
  getAdminComplaintById,
  assignDepartment,
  updateStatus,
  getDepartments,
  getUsers,
  createCoordinator,
  createDepartmentUser,
  changeUserRole,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/complaints', getAdminComplaints);
router.get('/complaints/:id', getAdminComplaintById);
router.put('/complaints/:id/assign', assignDepartment);
router.put('/complaints/:id/status', updateStatus);
router.get('/departments', getDepartments);
router.get('/users', getUsers);
router.post('/users/coordinators', createCoordinator);
router.post('/users/departments', createDepartmentUser);
router.put('/users/:id/role', changeUserRole);

export default router;
