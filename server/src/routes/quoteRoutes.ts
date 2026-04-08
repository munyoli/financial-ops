import { Router } from 'express';
import { getQuotes, createQuote, updateQuote, deleteQuote } from '../controllers/quoteController';

const router = Router();

router.get('/', getQuotes);
router.post('/', createQuote);
router.put('/:id', updateQuote);
router.delete('/:id', deleteQuote);

export default router;
