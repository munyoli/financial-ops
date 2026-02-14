'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useStorage } from '@/context/StorageContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  FileText,
  DollarSign,
  Clock,
  LogOut,
  User,
  Scissors,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { invoices, expenses, quotes, settings, unmatchedPayments } = useStorage();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = useMemo(() => {
    const totalCollected = invoices.reduce((sum, inv) => {
      const paid = inv.payments?.reduce((pSum, p) => pSum + p.amount, 0) || 0;
      return sum + paid;
    }, 0);

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalCollected - totalExpenses;

    const recentActivity = [
      ...invoices.flatMap(i => (i.payments || []).map(p => ({
        type: 'income',
        id: p.id,
        date: p.date,
        amount: p.amount,
        desc: `Payment from ${i.clientName}`
      }))),
      ...expenses.map(e => ({
        type: 'expense',
        id: e.id,
        date: e.date,
        amount: e.amount,
        desc: `${e.category} - ${e.description || ''}`
      }))
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const recentQuotes = [...(quotes || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);

    const maxVal = Math.max(totalCollected, totalExpenses, 100);
    const incomeHeight = (totalCollected / maxVal) * 100;
    const expenseHeight = (totalExpenses / maxVal) * 100;

    return { totalCollected, totalExpenses, netProfit, recentActivity, incomeHeight, expenseHeight, recentQuotes };
  }, [invoices, expenses, quotes]);

  const formatDate = (dateStr: string) => {
    if (!mounted) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatQuoteDate = (dateStr: string) => {
    if (!mounted) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const headerDate = mounted
    ? new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.headerContent}>
          <div>
            <span className={styles.brandLabel}>Bespoke Couture Studio</span>
            <h1 className={styles.title}>Atelier Overview</h1>
            <p className={styles.date}>{headerDate}</p>
          </div>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                <User size={18} />
                <span>{user.name}</span>
              </div>
              <button
                onClick={logout}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'white', opacity: 0.8, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', padding: '0.25rem 0' }}
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className={styles.summaryGrid}>
        <div className={`${styles.card} ${styles.incomeCard}`}>
          <span className={styles.cardLabel}>Portfolio Revenue</span>
          <div className={styles.cardValue}>
            {settings.currency} {metrics.totalCollected.toLocaleString()}
          </div>
          <ArrowUpRight className={styles.cardIcon} size={24} />
        </div>

        <div className={`${styles.card} ${styles.expenseCard}`}>
          <span className={styles.cardLabel}>Studio Costs</span>
          <div className={styles.cardValue}>
            {settings.currency} {metrics.totalExpenses.toLocaleString()}
          </div>
          <ArrowDownRight className={styles.cardIcon} size={24} />
        </div>

        <div className={`${styles.card} ${styles.profitCard}`}>
          <span className={styles.cardLabel}>Operational Profit</span>
          <div className={styles.cardValue}>
            {settings.currency} {metrics.netProfit.toLocaleString()}
          </div>
          <TrendingUp className={styles.cardIcon} size={24} />
        </div>
      </div>

      <div className={styles.mainGrid}>
        {unmatchedPayments.length > 0 && (
          <section className={styles.luxuryCard} style={{ gridColumn: '1 / -1', background: 'rgba(212, 160, 23, 0.05)', border: '1px solid var(--color-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className={styles.cardTitle} style={{ marginBottom: 0, color: 'var(--color-accent)' }}>
                <AlertCircle size={20} />
                Payment Review Required
              </h3>
              <span className={styles.brandLabel} style={{ fontSize: '0.6rem' }}>{unmatchedPayments.length} Pending Actions</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
              Some M-Pesa payments couldn't be automatically matched to an invoice.
            </p>
            <Link href="/payments/unmatched" className={styles.secondaryButton} style={{ width: 'fit-content' }}>
              Reconcile Payments
            </Link>
          </section>
        )}

        <section className={styles.luxuryCard}>
          <h3 className={styles.cardTitle}>
            <TrendingUp size={20} color="var(--color-accent)" />
            Performance
          </h3>
          <div className={styles.barChart}>
            <div className={styles.barGroup}>
              <div
                className={styles.bar}
                style={{ height: `${metrics.incomeHeight}%`, backgroundColor: 'var(--color-success)' }}
              ></div>
              <span className={styles.barLabel}>收入</span>
            </div>
            <div className={styles.barGroup}>
              <div
                className={styles.bar}
                style={{ height: `${metrics.expenseHeight}%`, backgroundColor: 'var(--color-accent)' }}
              ></div>
              <span className={styles.barLabel}>支出</span>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-success)' }}></div>
              <span>Total Revenue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--color-accent)' }}></div>
              <span>Total Expenses</span>
            </div>
          </div>
        </section>

        <section className={styles.luxuryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
              <Scissors size={20} color="var(--color-accent)" />
              Bespoke Proposals
            </h3>
            <Link href="/quotes" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Review All
            </Link>
          </div>

          <div className={styles.activityList}>
            {metrics.recentQuotes.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '2rem 0' }}>No proposals drafted yet.</p>
            ) : (
              metrics.recentQuotes.map((quote) => (
                <Link href={`/quotes/${quote.id}`} key={quote.id} className={styles.activityItem} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src="/images/luxury/avatar.png" className={styles.avatar} alt="Client" />
                    <div className={styles.activityInfo}>
                      <h4 style={{ color: 'var(--color-primary)' }}>{quote.clientName}</h4>
                      <p>{formatQuoteDate(quote.date)} — {quote.status.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className={styles.amount} style={{ color: 'var(--color-accent)' }}>
                    {settings.currency} {quote.totalClientPrice.toLocaleString()}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className={styles.luxuryCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
              <Clock size={20} color="var(--color-accent)" />
              Recent Ledger
            </h3>
            <Link href="/invoices" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Review All
            </Link>
          </div>

          <div className={styles.activityList}>
            {metrics.recentActivity.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '2rem 0' }}>No recent entries found.</p>
            ) : (
              metrics.recentActivity.map((item) => (
                <div key={item.id} className={styles.activityItem}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className={styles.activityInfo}>
                      <h4>{item.desc}</h4>
                      <p>{formatDate(item.date)}</p>
                    </div>
                  </div>
                  <div className={`${styles.amount} ${item.type === 'income' ? styles.plus : styles.minus}`}>
                    {item.type === 'income' ? '+' : '-'} {settings.currency} {Math.abs(item.amount).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className={styles.fabContainer}>
        <Link href="/expenses" className={styles.fab}>
          <DollarSign size={24} />
          <span className={styles.fabLabel}>Record Expense</span>
        </Link>
        <Link href="/pricing" className={styles.fab} style={{ background: 'var(--color-accent)' }}>
          <FileText size={24} />
          <span className={styles.fabLabel}>Draft Quote</span>
        </Link>
        <Link href="/invoices/create" className={styles.fab} style={{ background: 'var(--color-success)' }}>
          <Plus size={24} />
          <span className={styles.fabLabel}>New Statement</span>
        </Link>
      </div>
    </div>
  );
}
