import express from 'express';
import { 
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus
} from '../controllers/projectController.js';
import { protect, clientOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, clientOnly, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, clientOnly, updateProject)
  .delete(protect, clientOnly, deleteProject);

router.route('/:id/status')
  .put(protect, clientOnly, updateProjectStatus);

export default router;