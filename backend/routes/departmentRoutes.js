import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { acceptComplaint, getDepartmentComplaintById, getDepartmentComplaints, updateDepartmentComplaint } from '../controllers/departmentController.js';

const router = Router();
router.use(authenticate, authorize('DEPARTMENT'));
router.get('/complaints', getDepartmentComplaints);
router.get('/complaints/:id', getDepartmentComplaintById);
router.put('/complaints/:id/accept', acceptComplaint);
router.put('/complaints/:id/status', updateDepartmentComplaint);
router.post('/complaints/:id/updates', updateDepartmentComplaint);
export default router;
