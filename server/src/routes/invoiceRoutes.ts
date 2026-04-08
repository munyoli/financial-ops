import { Router } from 'express';
import { getInvoices, createInvoice, updateInvoiceAndCheckAutomation, deleteInvoice } from '../controllers/invoiceController';

const router = Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.put('/:id', updateInvoiceAndCheckAutomation);
router.delete('/:id', deleteInvoice);

export default router;
