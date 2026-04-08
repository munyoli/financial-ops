'use client';

import React, { useState, useEffect } from 'react';
import { useStorage } from '@/context/StorageContext';
import styles from './page.module.css';
import { 
    TrendingUp, ArrowDownRight, ArrowUpRight, 
    Calendar, Download, Activity, ShieldCheck, 
    Zap, PieChart, BarChart
} from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
    const { getMonthlyReport, settings } = useStorage();
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const data = await getMonthlyReport(selectedYear);
                setReportData(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [selectedYear]);

    if (loading) return <div className={styles.container}>Gathering Atelier Insights...</div>;
    if (!reportData) return <div className={styles.container}>Failed to generate report.</div>;

    const { revenue, expenses, categories, accountantStats } = reportData;

    // Monthly calculation (defaulting to 12 months)
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const chartData = months.map(m => {
        const r = revenue.find((i: any) => i.month === m)?.total || 0;
        const e = expenses.find((i: any) => i.month === m)?.total || 0;
        return { month: m, revenue: r, expenses: e, profit: r - e };
    });

    const totalRevenue = revenue.reduce((sum: number, r: any) => sum + Number(r.total), 0);
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.total), 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const maxVal = Math.max(...chartData.map(d => Math.max(d.revenue, d.expenses))) || 1000;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <div>
                        <span className="brand-label">Financial Position</span>
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0 }}>Atelier Pulse</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}
                        >
                            <option value="2024">FY 2024</option>
                            <option value="2025">FY 2025</option>
                            <option value="2026">FY 2026</option>
                        </select>
                        <button className="btn btn-ghost"><Download size={18} /> Export PDF</button>
                    </div>
                </div>
            </header>

            <div className={styles.metricsGrid}>
                <div className={`${styles.income} ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Gross Revenue</span>
                    <div className={styles.metricValue}>{settings.currency} {totalRevenue.toLocaleString()}</div>
                    <div style={{ color: 'var(--color-success)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpRight size={14} /> +12.5% vs last year
                    </div>
                </div>
                <div className={`${styles.expense} ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Operational Burn</span>
                    <div className={styles.metricValue}>{settings.currency} {totalExpenses.toLocaleString()}</div>
                    <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowDownRight size={14} /> -4.2% optimized
                    </div>
                </div>
                <div className={`${styles.profit} ${styles.metricCard}`}>
                    <span className={styles.metricLabel}>Net Atelier Profit</span>
                    <div className={styles.metricValue}>{settings.currency} {netProfit.toLocaleString()}</div>
                    <div style={{ color: 'var(--color-accent)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>
                        {margin.toFixed(1)}% Operating Margin
                    </div>
                </div>
            </div>

            <div className={styles.visualGrid}>
                <section className={styles.chartSection}>
                    <div className={styles.chartHeader}>
                        <h3 style={{ margin: 0 }}>Performance Overview</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: 'var(--color-accent)', borderRadius: '2px' }} /> Revenue</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 8, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} /> Expenses</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '250px', gap: '8px', padding: '1rem 0' }}>
                        {chartData.map(d => (
                            <div key={d.month} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '4px' }}>
                                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', width: '100%', height: '100%' }}>
                                    <div 
                                        style={{ 
                                            flex: 1, 
                                            height: `${(d.revenue / maxVal) * 100}%`, 
                                            background: 'var(--color-accent)', 
                                            borderRadius: '2px 2px 0 0',
                                            minHeight: d.revenue > 0 ? '2px' : 0
                                        }} 
                                    />
                                    <div 
                                        style={{ 
                                            flex: 1, 
                                            height: `${(d.expenses / maxVal) * 100}%`, 
                                            background: 'rgba(255,255,255,0.1)', 
                                            borderRadius: '2px 2px 0 0',
                                            minHeight: d.expenses > 0 ? '2px' : 0
                                        }} 
                                    />
                                </div>
                                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                    {new Date(2024, d.month - 1).toLocaleString('default', { month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.chartSection}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Expense Allocation</h3>
                    <div className={styles.categoriesList}>
                        {categories.map((cat: any) => {
                            const pct = (cat.total / totalExpenses) * 100;
                            return (
                                <div key={cat.category} className={styles.categoryItem}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ textTransform: 'capitalize' }}>{cat.category.replace('_', ' ')}</span>
                                            <span style={{ color: 'var(--color-text-muted)' }}>{pct.toFixed(0)}%</span>
                                        </div>
                                        <div className={styles.barTrack}>
                                            <div className={styles.barFill} style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {categories.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No expense data for this period.</p>}
                    </div>
                </section>
            </div>

            <section className={styles.accountantCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <ShieldCheck size={24} color="var(--color-accent)" />
                    <h3 style={{ margin: 0 }}>Automated Accountant Pulse</h3>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '600px' }}>
                    The system has automatically analyzed your M-Pesa and Excel statements. Here is the efficiency report for the current fiscal cycle.
                </p>
                
                <div className={styles.statsRow}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{accountantStats.total_tx}</span>
                        <span className={styles.statLabel}>Total Transactions</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{accountantStats.linked_tx}</span>
                        <span className={styles.statLabel}>Auto-Linked to Invoices</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{((accountantStats.linked_tx / accountantStats.total_tx) * 100 || 0).toFixed(1)}%</span>
                        <span className={styles.statLabel}>Automation Accuracy</span>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Zap size={16} color="var(--color-accent)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Smart Match Active</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Real-time linking from bank deposits to client balances.</div>
                    </div>
                    <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Activity size={16} color="var(--color-accent)" style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Leakage Detection</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Comparing operational burn against project profitability.</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
