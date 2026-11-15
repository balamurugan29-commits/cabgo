import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/profile', requireAuth, customerController.getProfile);
router.put('/profile', requireAuth, customerController.updateProfile);
router.post('/saved-addresses', requireAuth, customerController.addSavedAddress);
router.get('/emergency-contacts', requireAuth, customerController.getEmergencyContacts);
router.post('/emergency-contacts', requireAuth, customerController.addEmergencyContact);
router.delete('/emergency-contacts/:contactId', requireAuth, customerController.deleteEmergencyContact);

export default router;
