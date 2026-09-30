import { Router } from 'express';
import {
  getCoordinatorComplaints,
  getCoordinatorComplaintById,
  verifyComplaint,
  rejectComplaint,
} from '../controllers/coordinatorController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All coordinator routes require COORDINATOR role
router.use(authenticate, authorize('COORDINATOR'));

router.get('/complaints', getCoordinatorComplaints);
router.get('/complaints/:id', getCoordinatorComplaintById);
router.put('/complaints/:id/verify', verifyComplaint);
router.put('/complaints/:id/reject', rejectComplaint);

export default router;
