import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { MpesaTransactionType, TransactionSource } from './types';

export interface ParsedTransaction {
    transaction_code: string;
    transaction_date: string;
    description: string;
    amount: number;
    type: MpesaTransactionType;
    sender_name?: string;
    recipient_name?: string;
    phone?: string;
    balance_after?: number;
    source: TransactionSource;
}

export function parseMpesaStatement(buffer: Buffer, filename: string): ParsedTransaction[] {
    const isCsv = filename.toLowerCase().endsWith('.csv');
    
    if (isCsv) {
        return parseCsv(buffer.toString());
    } else {
        return parseExcel(buffer);
    }
}

function parseCsv(content: string): ParsedTransaction[] {
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    return records.map((row: any) => {
        const receiptNo = row['Receipt No.'] || row['Transaction Code'] || row['Code'];
        const details = row['Details'] || row['Description'] || '';
        const paidIn = parseFloat(row['Paid In'] || row['Amount In'] || '0');
        const withdrawn = parseFloat(row['Withdrawn'] || row['Amount Out'] || '0');
        const amount = paidIn > 0 ? paidIn : withdrawn;
        const type: MpesaTransactionType = paidIn > 0 ? 'received' : 'sent';
        
        // Basic name extraction from "Details" (e.g. "Payment Received from John Doe 2547...")
        let senderName = '';
        if (type === 'received') {
            senderName = details.replace(/Payment Received from /i, '').replace(/\d{9,12}/g, '').trim();
        }

        return {
            transaction_code: receiptNo,
            transaction_date: new Date(row['Completion Time'] || row['Date'] || Date.now()).toISOString(),
            description: details,
            amount: amount,
            type: type,
            sender_name: senderName || undefined,
            recipient_name: type === 'sent' ? details : undefined,
            source: 'manual',
            balance_after: parseFloat(row['Balance'] || '0')
        };
    }).filter((tx: any) => tx.transaction_code);
}

function parseExcel(buffer: Buffer): ParsedTransaction[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(worksheet);

    return data.map((row: any) => {
        // Handle variations in Excel headers
        const amount = parseFloat(row.Amount || row.PaidIn || row.PaidOut || row.Total || '0');
        const isIncome = row.Type?.toLowerCase().includes('income') || !!row.PaidIn || amount > 0;
        
        return {
            transaction_code: row.Code || row.Reference || row.ID || `EXL-${Date.now()}-${Math.random()}`,
            transaction_date: new Date(row.Date || Date.now()).toISOString(),
            description: row.Description || row.Details || 'Excel Import',
            amount: Math.abs(amount),
            type: isIncome ? 'received' : 'sent',
            source: 'manual',
            sender_name: isIncome ? (row.Sender || row.Client) : undefined,
            recipient_name: !isIncome ? (row.Recipient || row.Vendor) : undefined
        };
    });
}
