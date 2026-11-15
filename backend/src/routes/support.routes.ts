import { Router } from 'express';
import { supportController } from '../controllers/support.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', requireAuth, supportController.createTicket);
router.get('/', requireAuth, supportController.getUserTickets);
router.get('/all', requireAuth, supportController.getAllTickets);
router.put('/:id', requireAuth, supportController.updateTicket);

export default router;
