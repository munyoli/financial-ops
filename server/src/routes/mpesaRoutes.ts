import { Router } from 'express';
import { getTransactions, createTransaction, uploadStatement } from '../controllers/mpesaController';

const router = Router();

router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.post('/upload', uploadStatement);

export default router;
