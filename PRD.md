# PRD: Couture Studio Inter-Departmental System

## 1. Overview
Couture Studio is a comprehensive management system designed to bridge the gap between sales, production, inventory, and finance. The primary goal is to ensure seamless communication and data flow across all departments of the business.

## 2. Target Departments & Roles
- **Admin**: Full system access, management of users and global settings.
- **Sales & Marketing**: Responsible for client quotes, invoices, and closing deals.
- **Production**: Responsible for cutting, sewing, finishing, and quality control of orders.
- **Inventory**: Responsible for managing fabric, materials, and stock levels.
- **Finance**: Responsible for tracking payments, expenses, and overall financial health.

## 3. Core Workflows & Cross-Department Communication

### 3.1 Sale to Production
- **Trigger**: When Sales marks an Invoice as "Confirmed" or "Paid".
- **Action**: A notification is automatically sent to the **Production** department.
- **Action**: A new `ProductionOrder` is initialized in the "Cutting" stage.

### 3.2 Production to Inventory
- **Trigger**: When a Production Order starts.
- **Action**: A notification is sent to **Inventory** to reserve or deduct the necessary materials from the stock.

### 3.3 Payment to Finance
- **Trigger**: When a payment is received (e.g., M-Pesa automated tracking or manual cash entry).
- **Action**: The **Finance** dashboard updates to reflect the new revenue.
- **Action**: If a partial payment is made, the invoice status updates to "Partial", notifying Sales for follow-up.

### 3.4 Production to Sales (QC & Done)
- **Trigger**: When Production marks an order as "QC" or "Done".
- **Action**: A notification is sent to **Sales** so they can inform the client that their garment is ready for pickup or delivery.

## 4. Feature Requirements
- **Centralized API**: A single Express.js backend serving all client sides (Web and Mobile).
- **Notification System**: A real-time (or polling-based) notification system to alert specific department roles of incoming tasks.
- **Role-Based Dashboards**: Each department sees a dashboard tailored to their specific needs.
- **Automated M-Pesa Tracking**: Integration with M-Pesa statements to automate payment verification.

## 5. Success Metrics
- Reduction in order processing time.
- Fewer "missing" materials due to early inventory alerts.
- Faster payment-to-production turnaround.
