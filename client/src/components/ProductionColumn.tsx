'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ProductionOrder } from '@/lib/types';
import ProductionCard from './ProductionCard';
import styles from './ProductionBoard.module.css';

interface ProductionColumnProps {
  id: string;
  title: string;
  items: ProductionOrder[];
}

export default function ProductionColumn({ id, title, items }: ProductionColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3 className={styles.columnTitle}>{title}</h3>
        <span className={styles.itemCount}>{items.length}</span>
      </div>
      <SortableContext
        id={id}
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className={styles.columnContent}>
          {items.map((item) => (
            <ProductionCard key={item.id} id={item.id} order={item} />
          ))}
          {items.length === 0 && (
            <div className={styles.emptyState}>No orders</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
