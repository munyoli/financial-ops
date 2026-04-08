'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, DEFAULT_GARMENT_TYPES, DEFAULT_SETTINGS, GarmentType, Quote, Settings, Invoice, Expense, MpesaTransaction, ProductionOrder, ProductionStatus } from '@/lib/types';
import { apiClient } from '@/lib/apiClient';

interface StorageContextType {
    settings: Settings;
    garmentTypes: GarmentType[];
    quotes: Quote[];
    invoices: Invoice[];
    expenses: Expense[];
    mpesaTransactions: MpesaTransaction[]; // Added
    productionOrders: ProductionOrder[]; // Added
    inventory: any[]; // Institutional
    notifications: any[]; // Institutional
    unmatchedPayments: any[];
    updateSettings: (newSettings: Settings) => void;
    addGarmentType: (garment: GarmentType) => void;
    updateGarmentType: (garment: GarmentType) => void;
    deleteGarmentType: (id: string) => void;
    addQuote: (quote: Quote) => Promise<void>;
    updateQuote: (quote: Quote) => Promise<void>;
    deleteQuote: (id: string) => Promise<void>;
    addInvoice: (invoice: Invoice) => Promise<void>;
    updateInvoice: (invoice: Invoice) => Promise<void>;
    deleteInvoice: (id: string) => Promise<void>;
    addExpense: (expense: Expense) => Promise<void>;
    updateExpense: (expense: Expense) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    addMpesaTransaction: (tx: Partial<MpesaTransaction>) => Promise<void>; // Added
    updateMpesaTransaction: (tx: Partial<MpesaTransaction>) => Promise<void>; // Added
    markNotificationRead: (id: string) => Promise<void>; // Institutional
    isLoading: boolean;
    refreshData: () => Promise<void>;
    getMonthlyReport: (year?: string) => Promise<any>;
    addProductionOrder: (order: Partial<ProductionOrder>) => Promise<void>;
    updateProductionOrder: (order: Partial<ProductionOrder> & { notes?: string }) => Promise<void>;
    inspectorItem: any;
    setInspectorItem: (item: any) => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<AppData>({
        settings: DEFAULT_SETTINGS,
        garmentTypes: DEFAULT_GARMENT_TYPES,
        quotes: [],
        invoices: [],
        expenses: [],
        unmatchedPayments: [],
        mpesaTransactions: [], // Added
        productionOrders: [], // Added
        inventory: [], // Institutional
        notifications: [], // Institutional
    });
    const [isLoading, setIsLoading] = useState(true);
    const [inspectorItem, setInspectorItem] = useState<any>(null);

    const refreshData = async () => {
        try {
            const [rawQuotes, rawInvoices, rawExpenses, rawUnmatched, rawMpesa, rawProduction, rawInventory, rawNotifications, rawSettings] = await Promise.all([
                apiClient.get<any[]>('/quotes'),
                apiClient.get<any[]>('/invoices'),
                apiClient.get<any[]>('/expenses'),
                apiClient.get<any[]>('/payments/unmatched'),
                apiClient.get<any[]>('/mpesa/transactions'),
                apiClient.get<any[]>('/production'),
                apiClient.get<any[]>('/institutional/inventory'),
                apiClient.get<any[]>('/institutional/notifications'),
                apiClient.get<Settings>('/settings')
            ]);

            // Robust Mapping: DB Snake Case -> Frontend Camel Case
            const quotes: Quote[] = (rawQuotes || []).map((q: any) => ({
                id: String(q.id),
                quoteNumber: q.quote_number,
                clientName: q.client_name,
                clientEmail: q.client_email,
                clientPhone: q.client_phone,
                date: q.created_at || q.date,
                items: typeof q.items === 'string' ? JSON.parse(q.items) : (q.items || []),
                totalCost: Number(q.total_cost || q.subtotal || 0),
                totalClientPrice: Number(q.total_price || q.total_amount || 0),
                status: q.status || 'draft',
                notes: q.notes
            }));

            const invoices: Invoice[] = (rawInvoices || []).map((inv: any) => {
                const totalAmount = Number(inv.total_amount);
                const payments = Array.isArray(inv.payments) ? inv.payments : [];
                const totalPayments = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

                let status = 'pending';
                if (totalPayments >= totalAmount && totalAmount > 0) {
                    status = 'paid';
                } else if (totalPayments > 0 && totalPayments < totalAmount) {
                    status = 'partial';
                } else if (totalAmount === 0) { // Handle invoices with 0 total amount as paid
                    status = 'paid';
                }

                return {
                    id: String(inv.id),
                    quoteId: inv.quote_id,
                    clientName: inv.client_name,
                    clientPhone: inv.client_phone,
                    invoiceNumber: inv.invoice_number,
                    totalAmount: totalAmount,
                    status: status, // Dynamically set based on payments
                    issueDate: inv.issue_date,
                    dueDate: inv.due_date,
                    items: typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items || []),
                    payments: payments
                };
            });

            const expenses: Expense[] = (rawExpenses || []).map((e: any) => ({
                id: String(e.id),
                category: e.category,
                amount: Number(e.amount),
                date: e.date,
                description: e.description,
                notes: e.notes
            }));

            const productionOrders: ProductionOrder[] = (rawProduction || []).map((po: any) => ({
                id: String(po.id),
                orderId: po.order_id,
                brandId: po.brand_id,
                clientName: po.client_name,
                assignedTailor: po.assigned_tailor,
                currentStatus: po.current_status as ProductionStatus,
                progressPercentage: Number(po.progress_percentage || 0),
                startDate: po.start_date || po.created_at,
                dueDate: po.due_date,
                completedDate: po.completed_date,
                stages: typeof po.stages === 'string' ? JSON.parse(po.stages) : (po.stages || [])
            }));

            setData(prev => ({
                ...prev,
                quotes,
                invoices,
                expenses,
                unmatchedPayments: rawUnmatched || [],
                mpesaTransactions: rawMpesa || [], // Added
                productionOrders: productionOrders, // Added
                inventory: rawInventory || [],
                notifications: rawNotifications || [],
                settings: rawSettings || DEFAULT_SETTINGS
            }));
        } catch (error) {
            console.error('Failed to refresh data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const updateSettings = async (newSettings: Settings) => {
        await apiClient.put('/settings', newSettings);
        await refreshData();
    };

    // Garment types can stay static or be fetched. For now keeping static as requested by original code.
    const addGarmentType = (garment: GarmentType) => {
        setData((prev) => ({
            ...prev,
            garmentTypes: [...prev.garmentTypes, garment],
        }));
    };

    const updateGarmentType = (garment: GarmentType) => {
        setData((prev) => ({
            ...prev,
            garmentTypes: prev.garmentTypes.map((g) => (g.id === garment.id ? garment : g)),
        }));
    };

    const deleteGarmentType = (id: string) => {
        setData((prev) => ({
            ...prev,
            garmentTypes: prev.garmentTypes.filter((g) => g.id !== id),
        }));
    };

    // API-Driven CRUD
    const addQuote = async (quote: Quote) => {
        await apiClient.post('/quotes', quote);
        await refreshData();
    };

    const updateQuote = async (quote: Quote) => {
        await apiClient.put(`/quotes/${quote.id}`, quote);
        await refreshData();
    };

    const deleteQuote = async (id: string) => {
        await apiClient.delete(`/quotes/${id}`);
        await refreshData();
    };

    const addInvoice = async (invoice: Invoice) => {
        await apiClient.post('/invoices', invoice);
        await refreshData();
    };

    const updateInvoice = async (invoice: Invoice) => {
        await apiClient.put(`/invoices/${invoice.id}`, invoice);
        await refreshData();
    };

    const deleteInvoice = async (id: string) => {
        await apiClient.delete(`/invoices/${id}`);
        await refreshData();
    };

    const addExpense = async (expense: Expense) => {
        await apiClient.post('/expenses', expense);
        await refreshData();
    };

    const updateExpense = async (expense: Expense) => {
        await apiClient.put(`/expenses/${expense.id}`, expense);
        await refreshData();
    };

    const deleteExpense = async (id: string) => {
        await apiClient.delete(`/expenses/${id}`);
        await refreshData();
    };

    const addMpesaTransaction = async (tx: Partial<MpesaTransaction>) => {
        await apiClient.post('/mpesa/transactions', tx);
        await refreshData();
    };

    const updateMpesaTransaction = async (tx: Partial<MpesaTransaction>) => {
        await apiClient.put(`/mpesa/transactions/${tx.id}`, tx);
        await refreshData();
    };

    const markNotificationRead = async (id: string) => {
        await apiClient.put(`/institutional/notifications/${id}/read`, {});
        await refreshData();
    };

    const addProductionOrder = async (order: Partial<ProductionOrder>) => {
        const mappedOrder = {
            order_id: order.orderId,
            brand_id: order.brandId,
            client_name: order.clientName,
            assigned_tailor: order.assignedTailor,
            due_date: order.dueDate,
            start_date: order.startDate
        };

        await apiClient.post('/production', mappedOrder);
        await refreshData();
    };

    const updateProductionOrder = async (order: Partial<ProductionOrder> & { notes?: string }) => {
        const mappedUpdate: any = {};
        if (order.currentStatus !== undefined) mappedUpdate.current_status = order.currentStatus;
        if (order.progressPercentage !== undefined) mappedUpdate.progress_percentage = order.progressPercentage;
        if (order.assignedTailor !== undefined) mappedUpdate.assigned_tailor = order.assignedTailor;
        if (order.dueDate !== undefined) mappedUpdate.due_date = order.dueDate;
        if (order.completedDate !== undefined) mappedUpdate.completed_date = order.completedDate;
        if (order.notes !== undefined) mappedUpdate.notes = order.notes;

        await apiClient.put(`/production/${order.id}`, mappedUpdate);
        await refreshData();
    };

    const getMonthlyReport = async (year?: string) => {
        const query = year ? `?year=${year}` : '';
        return await apiClient.get(`/reports${query}`);
    };

    return (
        <StorageContext.Provider
            value={{
                settings: data.settings,
                garmentTypes: data.garmentTypes,
                quotes: data.quotes,
                invoices: data.invoices,
                expenses: data.expenses,
                mpesaTransactions: data.mpesaTransactions,
                unmatchedPayments: data.unmatchedPayments,
                updateSettings,
                addGarmentType,
                updateGarmentType,
                deleteGarmentType,
                addQuote,
                updateQuote,
                deleteQuote,
                addInvoice,
                updateInvoice,
                deleteInvoice,
                addExpense,
                updateExpense,
                deleteExpense,
                addMpesaTransaction, // Added
                updateMpesaTransaction, // Added
                addProductionOrder, // Added
                updateProductionOrder, // Added
                productionOrders: data.productionOrders,
                inventory: data.inventory,
                notifications: data.notifications,
                markNotificationRead,
                isLoading,
                refreshData,
                getMonthlyReport,
                inspectorItem,
                setInspectorItem
            }}
        >
            {children}
        </StorageContext.Provider>
    );
}

export function useStorage() {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
}

