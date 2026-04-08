import { Router } from 'express';
import { getProductionOrders, createProductionOrder, updateProductionOrder } from '../controllers/productionController';

const router = Router();

router.get('/', getProductionOrders);
router.post('/', createProductionOrder);
router.put('/:id', updateProductionOrder);

export default router;
