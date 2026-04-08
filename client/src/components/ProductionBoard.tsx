'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import { ProductionOrder, ProductionStatus } from '@/lib/types';
import { useStorage } from '@/context/StorageContext';
import ProductionColumn from './ProductionColumn';
import ProductionCard from './ProductionCard';
import styles from './ProductionBoard.module.css';

const COLUMNS: ProductionStatus[] = [
  ProductionStatus.cutting,
  ProductionStatus.sewing,
  ProductionStatus.finishing,
  ProductionStatus.qc,
  ProductionStatus.done,
];

export default function ProductionBoard() {
  const { productionOrders, updateProductionOrder } = useStorage();
  const [items, setItems] = useState<{ [key in ProductionStatus]: ProductionOrder[] }>({
    [ProductionStatus.cutting]: [],
    [ProductionStatus.sewing]: [],
    [ProductionStatus.finishing]: [],
    [ProductionStatus.qc]: [],
    [ProductionStatus.done]: [],
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const newItems: any = {
      [ProductionStatus.cutting]: [],
      [ProductionStatus.sewing]: [],
      [ProductionStatus.finishing]: [],
      [ProductionStatus.qc]: [],
      [ProductionStatus.done]: [],
    };
    productionOrders.forEach((order) => {
      newItems[order.currentStatus || ProductionStatus.cutting].push(order);
    });
    setItems(newItems);
  }, [productionOrders]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function findContainer(id: string) {
    if (id in items) {
      return id as ProductionStatus;
    }
    return Object.keys(items).find((key) =>
      items[key as ProductionStatus].find((item) => item.id === id)
    ) as ProductionStatus;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;
    setActiveId(id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;

    if (!overId) return;

    const activeContainer = findContainer(id as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setItems((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex((item) => item.id === id);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      let newIndex;
      if (overId in prev) {
         newIndex = overItems.length + 1;
      } else {
         const isBelowLastItem = over && overIndex === overItems.length - 1;
         const modifier = isBelowLastItem ? 1 : 0;
         newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...activeItems.filter((item) => item.id !== active.id),
        ],
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex, overItems.length),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    const overId = over?.id;

    const activeContainer = findContainer(id as string);
    const overContainer = findContainer(overId as string);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
        // If it ended in a different container, persist the status change
        if (overContainer) {
            updateProductionOrder({
                id: id as string,
                currentStatus: overContainer
            });
        }
      setActiveId(null);
      return;
    }

    setItems((prev) => {
        const activeIndex = prev[activeContainer].findIndex((item) => item.id === id);
        const overIndex = prev[overContainer].findIndex((item) => item.id === overId);

        if (activeIndex !== overIndex) {
            return {
                ...prev,
                [overContainer]: arrayMove(prev[overContainer], activeIndex, overIndex),
            };
        }
        return prev;
    });

    setActiveId(null);
  }

  return (
    <div className={styles.boardContainer}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className={styles.columnsWrapper}>
          {COLUMNS.map((status) => (
            <ProductionColumn
              key={status}
              id={status}
              title={status.charAt(0).toUpperCase() + status.slice(1)}
              items={items[status]}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{
             sideEffects: defaultDropAnimationSideEffects({
                 styles: {
                     active: {
                         opacity: '0.5',
                     },
                 },
             }),
        }}>
          {activeId ? (
            <ProductionCard
                id={activeId}
                order={productionOrders.find(o => o.id === activeId)!}
                isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
