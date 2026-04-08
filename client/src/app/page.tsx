'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStorage } from '@/context/StorageContext';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import {
  ArrowUpRight,
  TrendingUp,
  Plus,
  FileText,
  Search,
  Command,
  MoreVertical,
  Activity,
  Scissors
} from 'lucide-react';

export default function DashboardPage() {
  const { invoices, quotes, settings, mpesaTransactions, productionOrders, inventory, setInspectorItem } = useStorage();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!mounted) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!mounted) return null;

  const isAdmin = user?.role === 'admin' || user?.role === 'founder';

  const AdminDashboard = () => (
    <>
      <section className={styles.heroSection}>
        <span className="brand-label">The Atelier</span>
        <h1 className={styles.mainTitle}>Executive Overview</h1>
        <div className={styles.quickMetrics}>
          <div className={styles.metricItem}>
             <TrendingUp size={16} color="var(--color-accent)" />
             <span>Revenue: {settings.currency} {invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}</span>
          </div>
          <div className={styles.metricItem}>
             <Activity size={16} color="var(--color-accent-cobalt)" />
             <span>Active Quotes: {quotes.filter(q => q.status !== 'accepted').length}</span>
          </div>
        </div>
      </section>

      <div className="masonry-grid">
        <section className={styles.sectionHeader} style={{ gridColumn: '1 / -1' }}>
          <h3>Financial Pulse</h3>
        </section>

        <div className={styles.ledgerCard} style={{ gridColumn: '1 / -1' }}>
           <div className={styles.ledgerList}>
              {mpesaTransactions.slice(0, 5).map(tx => (
                <div key={tx.id} className={styles.ledgerItem}>
                   <div className={styles.ledgerLeft}>
                      <div className={styles.ledgerIcon}>
                        <ArrowUpRight size={14} />
                      </div>
                      <div className={styles.ledgerInfo}>
                        <span className={styles.ledgerTitle}>{tx.description || 'Incoming Bank Transfer'}</span>
                        <span className={styles.ledgerMeta}>{formatDate(tx.transaction_date)} • {tx.transaction_code}</span>
                      </div>
                   </div>
                   <span className={styles.ledgerAmount}>+ {settings.currency} {Number(tx.amount).toLocaleString()}</span>
                </div>
              ))}
           </div>
        </div>

        <section className={styles.sectionHeader} style={{ gridColumn: '1 / -1', marginTop: 'var(--spacing-md)' }}>
          <h3>Low Inventory Alerts</h3>
          <Link href="/expenses" className={styles.actionBtn}>Manage Stock</Link>
        </section>

        <div className={styles.fullWidthCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.fabricGrid}>
            {inventory.filter(i => i.quantity_available < i.reorder_level).map(fabric => (
              <div key={fabric.id} className={styles.fabricItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className={styles.colorSwatch} style={{ backgroundColor: 'var(--color-danger)' }}></div>
                  <div className={styles.fabricInfo}>
                    <span className={styles.fabricName}>{fabric.name}</span>
                    <div className={styles.inventoryTrack}>
                      <div 
                        className={styles.inventoryFill} 
                        style={{ width: \`\${Math.max(10, (fabric.quantity_available / 50) * 100)}%\`, backgroundColor: 'var(--color-danger)' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <span className={styles.stockLabel} style={{color: 'var(--color-danger)'}}>{fabric.quantity_available}{fabric.unit} Remaining</span>
              </div>
            ))}
            {inventory.filter(i => i.quantity_available < i.reorder_level).length === 0 && (
                <p className="text-neutral-500 text-sm py-4">All stock levels are optimal.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const StaffDashboard = () => {
    // Staff sees their specific active tasks based on their department
    const myTasks = productionOrders.filter(po => po.currentStatus !== 'done' && (user?.department === 'production' || po.assignedTailor === user?.name));

    return (
    <>
      <section className={styles.heroSection}>
        <span className="brand-label">{user?.department || 'Staff'} Department</span>
        <h1 className={styles.mainTitle}>Welcome back, {user?.name || 'Artisan'}</h1>
        <div className={styles.quickMetrics}>
          <div className={styles.metricItem}>
             <Scissors size={16} color="var(--color-accent)" />
             <span>Active Tasks: {myTasks.length}</span>
          </div>
        </div>
      </section>

      <div className="masonry-grid">
        <section className={styles.sectionHeader} style={{ gridColumn: '1 / -1' }}>
          <h3>My Production Queue</h3>
          <Link href="/production" className={styles.actionBtn}>Go to Board</Link>
        </section>

        {myTasks.length === 0 ? (
            <div className={styles.fullWidthCard} style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
                <p className="text-neutral-500">You have no active orders in your queue.</p>
            </div>
        ) : (
            myTasks.map(item => (
            <div key={item.id} className={styles.collectionCard} onClick={() => setInspectorItem(item)}>
                <div className={styles.cardInfo} style={{ borderTop: '4px solid var(--color-accent)' }}>
                <h4>{item.clientName}</h4>
                <p className="text-sm font-bold text-white mb-2">{item.currentStatus.toUpperCase()}</p>
                <p className="text-sm text-neutral-400">Order #{item.orderId}</p>
                </div>
            </div>
            ))
        )}
      </div>
    </>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.searchContainer} onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
            window.dispatchEvent(event);
        }}>
          <Command size={16} className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Search Orders... (⌘K)" readOnly />
        </div>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>{user?.name?.[0] || 'A'}</div>
          <button onClick={logout} className={styles.logoutBtn}>Logout</button>
        </div>
      </header>
      
      {isAdmin ? <AdminDashboard /> : <StaffDashboard />}
      
    </div>
  );
}
