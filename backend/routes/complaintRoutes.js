import { Router } from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  createFeedback,
  getFeedback,
  getComplaintUpdates,
} from '../controllers/complaintController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// All complaint routes require authentication
router.use(authenticate);

// Student complaint routes
router.post('/', authorize('STUDENT'), upload.single('attachment'), createComplaint);
router.get('/my', authorize('STUDENT'), getMyComplaints);
router.get('/:id', getComplaintById);
router.get('/:id/updates', getComplaintUpdates);

// Feedback routes — students only can submit
router.post('/:id/feedback', authorize('STUDENT'), createFeedback);
router.get('/:id/feedback', getFeedback);

export default router;
