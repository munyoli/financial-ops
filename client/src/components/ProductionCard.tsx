'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, ChevronRight, Clock } from 'lucide-react';
import { ProductionOrder } from '@/lib/types';
import styles from './ProductionBoard.module.css';
import { useStorage } from '@/context/StorageContext';

interface ProductionCardProps {
  id: string;
  order: ProductionOrder;
  isOverlay?: boolean;
}

export default function ProductionCard({ id, order, isOverlay }: ProductionCardProps) {
  const { setInspectorItem } = useStorage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'TBD';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isOverlay ? styles.overlayCard : ''}`}
      onClick={() => setInspectorItem(order)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="19" r="1" />
          </svg>
        </div>
        <span className={styles.orderId}>#{order.orderId || 'ORD-001'}</span>
      </div>
      
      <h4 className={styles.clientName}>{order.clientName}</h4>
      
      <div className={styles.cardMeta}>
        <div className={styles.metaItem}>
          <User size={12} />
          <span>{order.assignedTailor || 'Unassigned'}</span>
        </div>
        <div className={styles.metaItem}>
          <Clock size={12} />
          <span>Due {formatDate(order.dueDate)}</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${order.progressPercentage || 0}%` }}
        />
      </div>
    </div>
  );
}
