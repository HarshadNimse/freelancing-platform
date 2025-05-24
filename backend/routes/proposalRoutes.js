import express from 'express';
import { 
  createProposal,
  getProjectProposals,
  getFreelancerProposals,
  updateProposalStatus
} from '../controllers/proposalController.js';
import { protect, clientOnly, freelancerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, freelancerOnly, createProposal);

router.route('/freelancer')
  .get(protect, freelancerOnly, getFreelancerProposals);

router.route('/project/:projectId')
  .get(protect, clientOnly, getProjectProposals);

router.route('/:id/status')
  .put(protect, clientOnly, updateProposalStatus);

export default router;