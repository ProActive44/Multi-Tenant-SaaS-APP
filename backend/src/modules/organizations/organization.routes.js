import express from 'express';
import organizationController from './organization.controller.js';

const router = express.Router();

// Organization CRUD routes
router.post('/', organizationController.createOrganization);
router.get('/', organizationController.getAllOrganizations);
router.get('/:id', organizationController.getOrganization);
router.patch('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

// Organization management routes
router.patch('/:id/plan', organizationController.updatePlan);
router.patch('/:id/suspend', organizationController.suspendOrganization);
router.patch('/:id/activate', organizationController.activateOrganization);

export default router;
