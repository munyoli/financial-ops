'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppData, DEFAULT_GARMENT_TYPES, DEFAULT_SETTINGS, GarmentType, Quote, Settings, Invoice, Expense } from '@/lib/types';

interface StorageContextType {
    settings: Settings;
    garmentTypes: GarmentType[];
    quotes: Quote[];
    invoices: Invoice[];
    expenses: Expense[];
    unmatchedPayments: any[]; // Added this line
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
    isLoading: boolean;
    refreshData: () => Promise<void>;
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
    });
    const [isLoading, setIsLoading] = useState(true);

    const refreshData = async () => {
        try {
            const [quotesRes, invoicesRes, expensesRes, unmatchedRes] = await Promise.all([
                fetch('/api/quotes'),
                fetch('/api/invoices'),
                fetch('/api/expenses'),
                fetch('/api/payments/unmatched')
            ]);

            const rawQuotes = await quotesRes.json();
            const rawInvoices = await invoicesRes.json();
            const rawExpenses = await expensesRes.json();
            const rawUnmatched = await unmatchedRes.json();

            // Robust Mapping: DB Snake Case -> Frontend Camel Case
            const quotes: Quote[] = (rawQuotes || []).map((q: any) => ({
                id: String(q.id),
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

            setData(prev => ({
                ...prev,
                quotes,
                invoices,
                expenses,
                unmatchedPayments: rawUnmatched || [],
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

    const updateSettings = (newSettings: Settings) => {
        setData((prev) => ({ ...prev, settings: newSettings }));
        // LocalSettings can stay in localStorage for user preference OR also in DB
        localStorage.setItem('couture_settings', JSON.stringify(newSettings));
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
        const res = await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quote)
        });
        if (res.ok) await refreshData();
    };

    const updateQuote = async (quote: Quote) => {
        const res = await fetch(`/api/quotes/${quote.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quote)
        });
        if (res.ok) await refreshData();
    };

    const deleteQuote = async (id: string) => {
        const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
        if (res.ok) await refreshData();
    };

    const addInvoice = async (invoice: Invoice) => {
        const res = await fetch('/api/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice)
        });
        if (res.ok) await refreshData();
    };

    const updateInvoice = async (invoice: Invoice) => {
        const res = await fetch(`/api/invoices/${invoice.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice)
        });
        if (res.ok) await refreshData();
    };

    const deleteInvoice = async (id: string) => {
        const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
        if (res.ok) await refreshData();
    };

    const addExpense = async (expense: Expense) => {
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        if (res.ok) await refreshData();
    };

    const updateExpense = async (expense: Expense) => {
        const res = await fetch(`/api/expenses/${expense.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });
        if (res.ok) await refreshData();
    };

    const deleteExpense = async (id: string) => {
        const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        if (res.ok) await refreshData();
    };

    return (
        <StorageContext.Provider
            value={{
                settings: data.settings,
                garmentTypes: data.garmentTypes,
                quotes: data.quotes,
                invoices: data.invoices,
                expenses: data.expenses,
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
                isLoading,
                refreshData
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

