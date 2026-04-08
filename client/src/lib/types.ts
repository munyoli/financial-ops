export interface Settings {
  businessName: string;
  currency: string;
  overheadRate: number; // Percentage (legacy)
  minProfitMargin: number; // Percentage
  wholesaleMarkup?: number;
  retailMarkup?: number;
  taxRate?: number;
  // Institutional Pricing
  monthlyOverheads?: {
    rent: number;
    electricity: number;
    internet: number;
    phone: number;
    maintenance: number;
    salaries: number;
    insurance: number;
    depreciation: number;
    transport: number;
  };
  estimatedMonthlyVolume?: number; // How many garments are made per month on average
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department?: 'admin' | 'sales' | 'production' | 'inventory' | 'finance';
}

export interface GarmentType {
  id: string;
  name: string;
  defaultLaborCost: number;
}

export interface DirectCosts {
  materials: {
    main_fabric: number;
    lining: number;
    interfacing: number;
    zip: number;
    buttons_hooks: number;
    thread: number;
    trims: number;
    labels: number;
    subtotal_materials: number;
  };
  labour: {
    pattern_making: number;
    cutting: number;
    sewing: number;
    handwork: number;
    finishing: number;
    subtotal_labour: number;
  };
  packaging: {
    garment_bag: number;
    tags: number;
    hanger: number;
    subtotal_packaging: number;
  };
  wastage: {
    wastage_allowance_percentage: number;
    subtotal_wastage: number;
  };
  total_direct_costs: number;
}

export interface IndirectCosts {
  rent_portion: number;
  electricity_portion: number;
  internet_portion: number;
  phone_portion: number;
  machine_maintenance: number;
  staff_salaries_portion: number;
  insurance_portion: number;
  equipment_depreciation: number;
  transport_for_sourcing: number;
  total_indirect_costs: number;
}

export interface BusinessCosts {
  designer_fee: number;
  marketing_portion: number;
  software_subscriptions: number;
  website_social_tools: number;
  logistics_to_stockist: number;
  contingency_percentage: number;
  total_business_costs: number;
}

export interface PricingSummary {
  total_cost_price: number;
  complexity_multiplier: number; // e.g., 1.0 for Standard, 1.5 for Couture
  wholesale_markup: number;
  wholesale_price: number;
  retail_markup: number;
  recommended_retail_price: number;
  // New "Expert" fields
  tax_amount: number;
  net_profit: number;
  net_profit_margin_percentage: number;
}

export interface QuoteItem {
  id: string;
  garmentTypeId: string;
  garmentName: string;
  quantity: number;
  // New detailed structure
  pricing_details?: {
    direct_costs: DirectCosts;
    indirect_costs: IndirectCosts;
    business_costs: BusinessCosts;
    pricing_summary: PricingSummary;
  };
  // Legacy fields for backward compatibility
  unitPrice: number;
  fabricCost: number;
  trimCost: number;
  laborCost: number;
  complexityAdjustment: number;
  overheadAmount: number;
  profitAmount: number;
  clientPrice: number;
  notes?: string;
}

export interface Quote {
  id: string;
  quoteNumber?: string; // e.g., QUO-001
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

export type MpesaTransactionType =
  | 'received'
  | 'sent'
  | 'paybill'
  | 'buy_goods'
  | 'withdrawal'
  | 'deposit'
  | 'airtime'
  | 'pochi_biz';

export type TransactionSource = 'sms' | 'daraja' | 'manual';

export interface MpesaTransaction {
  id: string;
  brand_id: string;
  transaction_code: string;
  type: MpesaTransactionType;
  amount: number;
  phone?: string;
  recipient_name?: string;
  sender_name?: string;
  source: TransactionSource;
  category?: string;
  description?: string;
  is_categorized: boolean;
  linked_invoice_id?: number;
  linked_expense_id?: string;
  balance_after: number;
  transaction_date: string; // ISO String
  created_at?: string;
}

export interface InventoryItem {
  id: string;
  brandId: string;
  name: string;
  type: 'fabric' | 'trim' | 'packaging';
  unit: string;
  costPerUnit: number;
  quantityAvailable: number;
  reorderLevel: number;
  sourcingModel: 'bulk' | 'project';
  createdAt?: string;
  updatedAt?: string;
}

export interface SystemNotification {
  id: string;
  brandId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'action_required';
  department: 'admin' | 'sales' | 'production' | 'inventory' | 'all';
  targetRole: 'admin' | 'user' | 'all';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: number;
  action: string;
  details?: string;
  department: 'sales' | 'production' | 'inventory' | 'finance' | 'system';
  createdAt: string;
}

export interface AppData {
  settings: Settings;
  garmentTypes: GarmentType[];
  quotes: Quote[];
  invoices: Invoice[];
  expenses: Expense[];
  unmatchedPayments: any[];
  mpesaTransactions: MpesaTransaction[];
  productionOrders: ProductionOrder[];
  inventory: InventoryItem[];
  notifications: SystemNotification[];
}

export enum ProductionStatus {
  cutting = 'cutting',
  sewing = 'sewing',
  finishing = 'finishing',
  qc = 'qc',
  done = 'done'
}

export interface ProductionStage {
  status: ProductionStatus;
  timestamp: string; // ISO String
  notes?: string;
}

export interface ProductionOrder {
  id: string;
  orderId: string; // Link to Invoice or Quote
  brandId: string;
  clientName: string;
  assignedTailor: string;
  stages: ProductionStage[];
  currentStatus: ProductionStatus;
  progressPercentage: number;
  startDate: string; // ISO String
  dueDate: string; // ISO String
  completedDate?: string; // ISO String
}

export const DEFAULT_SETTINGS: Settings = {
  businessName: 'Couture Studio',
  currency: 'KES',
  overheadRate: 10,
  minProfitMargin: 20,
  wholesaleMarkup: 2.1,
  retailMarkup: 2.2,
  estimatedMonthlyVolume: 20,
  monthlyOverheads: {
    rent: 25000,
    electricity: 5000,
    internet: 3000,
    phone: 2000,
    maintenance: 1500,
    salaries: 60000,
    insurance: 2000,
    depreciation: 5000,
    transport: 4000
  }
};

export const DEFAULT_GARMENT_TYPES: GarmentType[] = [
  { id: '1', name: 'Simple Dress', defaultLaborCost: 3000 },
  { id: '2', name: 'Corset Outfit', defaultLaborCost: 4500 },
  { id: '3', name: 'Gown', defaultLaborCost: 14000 },
  { id: '4', name: 'Pants', defaultLaborCost: 2000 },
  { id: '5', name: 'Kimono', defaultLaborCost: 2000 },
];
