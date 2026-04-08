'use client';

import React, { useState } from 'react';
import ProductionBoard from '@/components/ProductionBoard';
import styles from '../page.module.css'; // Reuse dashboard top-level styles
import { Activity, Plus, Filter, X } from 'lucide-react';
import { useStorage } from '@/context/StorageContext';
import { ProductionStatus } from '@/lib/types';

export default function ProductionPage() {
  const { addProductionOrder } = useStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    assignedTailor: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProductionOrder({
        ...formData,
        brandId: 'ATELIER-01', // Default for now
    });
    setIsModalOpen(false);
    setFormData({
        clientName: '',
        assignedTailor: '',
        dueDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={24} color="var(--color-accent)" />
          <h1 className={styles.mainTitle} style={{ margin: 0 }}>Production Board</h1>
        </div>
        <div className={styles.userProfile}>
          <button className={styles.actionBtn} style={{ marginRight: '1rem' }}>
            <Filter size={16} /> Filters
          </button>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> New Job
          </button>
        </div>
      </header>

      <section className={styles.heroSection} style={{ marginBottom: '1rem' }}>
        <span className="brand-label">Atelier Workflow</span>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Real-time tracking of garment construction stages. Drag cards to update status.
        </p>
      </section>

      <ProductionBoard />

      {/* New Job Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Initialize Production Job</h2>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
              <div className="form-group">
                <label>Job Reference</label>
                <div style={{ padding: '0.8rem', background: '#111', border: '1px solid #222', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                  System will auto-generate reference (Zoho-Style)
                </div>
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input 
                  type="text" 
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Enter client name" 
                  required
                />
              </div>

              <div className="row">
                <div className="col">
                    <label>Assigned Tailor</label>
                    <select 
                      value={formData.assignedTailor}
                      onChange={(e) => setFormData({...formData, assignedTailor: e.target.value})}
                      required
                    >
                      <option value="">Select Tailor</option>
                      <option value="Tailor Alice">Tailor Alice</option>
                      <option value="Tailor Bob">Tailor Bob</option>
                      <option value="Tailor Charlie">Tailor Charlie</option>
                    </select>
                </div>
                <div className="col">
                    <label>Due Date</label>
                    <input 
                      type="date" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      required
                    />
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '1rem', padding: 0 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start Production</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #0A0A0A;
          border: 1px solid rgba(212, 160, 23, 0.2);
          padding: 2rem;
          border-radius: 4px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 1rem;
        }
        .modal-title {
          font-family: 'Playfair Display', serif;
          color: var(--color-accent);
          font-size: 1.5rem;
          margin: 0;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--color-text-muted);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        input, select {
          width: 100%;
          background: #111;
          border: 1px solid #222;
          color: white;
          padding: 0.8rem;
          border-radius: 2px;
          outline: none;
        }
        input:focus, select:focus {
          border-color: var(--color-accent);
        }
        .row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
      `}</style>
    </div>
  );
}
