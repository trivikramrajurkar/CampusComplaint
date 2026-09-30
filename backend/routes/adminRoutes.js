import { Router } from 'express';
import {
  getAdminComplaints,
  getAdminComplaintById,
  assignDepartment,
  updateStatus,
  getDepartments,
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

export default router;
