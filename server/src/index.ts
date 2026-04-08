import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';

// Load env vars from parent directory (monorepo root)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin during development, or explicitly matching localhost/IPs
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.includes('192.168.')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now to solve the user's immediate issue
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import invoiceRoutes from './routes/invoiceRoutes';
import productionRoutes from './routes/productionRoutes';
import quoteRoutes from './routes/quoteRoutes';
import expenseRoutes from './routes/expenseRoutes';
import mpesaRoutes from './routes/mpesaRoutes';
import reportsRoutes from './routes/reportsRoutes';
import institutionalRoutes from './routes/institutionalRoutes';
import authRoutes from './routes/authRoutes';
import settingsRoutes from './routes/settingsRoutes';

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Couture Studio API', timestamp: new Date().toISOString() });
});

// Import and use routes here
app.use('/api/invoices', invoiceRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/institutional', institutionalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
