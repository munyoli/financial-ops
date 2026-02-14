export interface Settings {
  businessName: string;
  currency: string;
  overheadRate: number; // Percentage (e.g., 10 for 10%)
  minProfitMargin: number; // Percentage
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface GarmentType {
  id: string;
  name: string;
  defaultLaborCost: number;
}

export interface QuoteItem {
  id: string;
  garmentTypeId: string;
  garmentName: string;
  quantity: number;
  unitPrice: number; // The target client price per unit
  fabricCost: number;
  trimCost: number;
  laborCost: number;
  complexityAdjustment: number;
  overheadAmount: number;
  profitAmount: number;
  clientPrice: number; // Total for this line (quantity * unitPrice)
  notes?: string;
}

export interface Quote {
  id: string;
  clientName: string;
  clientPhone?: string;
  date: string;
  items: QuoteItem[];
  totalCost: number;
  totalClientPrice: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string; // ISO String
  method: 'cash' | 'mpesa' | 'bank' | 'other';
  notes?: string;
}

export interface Invoice {
  id: string;
  quoteId: string; // Link back to original quote
  invoiceNumber: string; // e.g., INV-001
  issueDate: string; // ISO String
  dueDate: string; // ISO String
  clientName: string;
  clientPhone?: string;
  items: QuoteItem[]; // Copied from quote at time of creation
  totalAmount: number; // Final client price
  payments: Payment[];
  status: 'pending' | 'partial' | 'paid' | 'overdue';
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  notes?: string;
}

export interface AppData {
  settings: Settings;
  garmentTypes: GarmentType[];
  quotes: Quote[];
  invoices: Invoice[];
  expenses: Expense[];
  unmatchedPayments: any[];
}

export const DEFAULT_SETTINGS: Settings = {
  businessName: 'Couture Studio',
  currency: 'KES',
  overheadRate: 10,
  minProfitMargin: 20,
};

export const DEFAULT_GARMENT_TYPES: GarmentType[] = [
  { id: '1', name: 'Simple Dress', defaultLaborCost: 3000 },
  { id: '2', name: 'Corset Outfit', defaultLaborCost: 4500 },
  { id: '3', name: 'Gown', defaultLaborCost: 14000 },
  { id: '4', name: 'Pants', defaultLaborCost: 2000 },
  { id: '5', name: 'Kimono', defaultLaborCost: 2000 },
];
