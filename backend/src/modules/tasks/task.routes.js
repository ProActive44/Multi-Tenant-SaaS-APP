import express from 'express';
import taskController from './task.controller.js';
import { authenticate, requireOrganization } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = express.Router();

// All task routes require authentication and organization context
// Super Admins are blocked by requireOrganization
router.use(authenticate, requireOrganization,   );

// Create task
router.post('/', taskController.createTask);

// Get all tasks
router.get('/', taskController.getTasks);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Update task
router.patch('/:id', taskController.updateTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

export default router;
