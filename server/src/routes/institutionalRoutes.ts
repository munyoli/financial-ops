import { Router } from 'express';
import { getInventory, getNotifications, markNotificationRead } from '../controllers/institutionalController';

const router = Router();

router.get('/inventory', getInventory);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

export default router;
