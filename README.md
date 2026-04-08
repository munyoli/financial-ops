# Couture Studio - Enterprise Management System

A high-performance management system for fashion studios, featuring a Next.js admin dashboard, a Node.js/Express financial backend, and a Flutter mobile app for production and tailoring departments.

## Project Structure
- `client/`: Next.js frontend (Admin & Management)
- `server/`: Express.js backend (Financial & Production API)
- `fashion_pro_mobile/`: Flutter mobile application (Department-specific)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL
- Flutter (for mobile)

### 2. Setup
Clone the repository and install dependencies:
```bash
npm run install:all
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure your database and admin credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=couture_studio

ADMIN_EMAIL=manukato.twostones@gmail.com
ADMIN_PASSWORD=your_admin_password
```

### 4. Database Setup & Seeding
Run the following scripts to initialize the database schema and seed the initial users:
```bash
# Update schema (roles and notifications)
node scripts/migrate-db.js

# Seed Admin & Department accounts
node scripts/seed-users.js
```

### 5. Running the System
Start both the client and server concurrently:
```bash
npm run dev
```

## 🔑 Default Accounts (Seeded)
| Department | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `manukato.twostones@gmail.com` | (From .env) |
| **Sales** | `sales@couture.com` | `password123` |
| **Production** | `production@couture.com` | `password123` |
| **Inventory** | `inventory@couture.com` | `password123` |
| **Finance** | `finance@couture.com` | `password123` |

## 🛠 Features
- **Integrated Auth**: Role-based access control (RBAC) across Web and Mobile.
- **M-Pesa Automation**: Automated payment tracking from bank statements.
- **Production Tracking**: Real-time updates on garment construction stages.
- **Notification Engine**: cross-department alerts for streamlined workflows.

## 📄 License
Private Property of Manukato & Two Stones.
