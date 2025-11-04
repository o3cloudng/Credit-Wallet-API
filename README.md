# 💸 Demo Credit Wallet App

A simple **Loan Application App** built with **Node.js**, **Express**, and **Knex.js** using **MySQL** as the database.  
It allows users to registerand login to create wallets, manage balances, and transfer funds between users safely and atomically.  
Future versions can include full loan management, repayment tracking, and credit scoring.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Database Schema](#database-schema)
6. [E-R Diagram](#e-r-diagram)
7. [Setup Instructions](#setup-instructions)
8. [API Endpoints](#api-endpoints)
9. [Folder Structure](#folder-structure)
10. [Future Improvements](#future-improvements)
11. [License](#license)

---

## 📘 Project Overview

This backend API provides:
- Secure wallet creation for each user
- Atomic fund transfers between wallets
- Transaction tracking (fund, debits, credits, transfers)
- Clear separation between database layers and services

This project serves as an **MVP** for a full loan management system, where users can borrow, repay, and transfer funds seamlessly.

---

## Features

- User registration and automatic wallet creation  
- Fund transfer between users (atomic transaction)  
- Transaction logging and wallet balance updates  
- Modular, clean Knex.js query builder structure  
- MySQL-backed relational database  (Knex migration)
- Uses JWT authentication and loan logic extension  

---

## Tech Stack

| Component | Technology |
|------------|-------------|
| Runtime | Node.js (v23.11.0) |
| Framework | Express.js |
| Database | MySQL |
| ORM / Query Builder | Knex.js |
| UUIDs | Node `crypto` module |
| Environment Config | dotenv |
| API Testing | Postman |

---

---

## 🗄️ Database Schema

### **Tables**

#### `users`
| Field | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique ID |
| full_name | VARCHAR | User’s full name |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed password |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

#### `wallets`
| Field | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Wallet ID |
| user_id | INT (FK → users.id) | Wallet owner |
| balance | DECIMAL(15,2) | Wallet balance |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

#### `transactions`
| Field | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Transaction ID |
| sender_id | INT (FK → users.id) | Sender user |
| receiver_id | INT (FK → users.id) | Receiver user |
| amount | DECIMAL(15,2) | Amount transferred |
| type | ENUM | credit, debit, or transfer |
| reference | VARCHAR | Unique reference UUID |
| status | VARCHAR | success, failed, pending |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

---


---

##  Database Schema

### **Tables**

#### `users`
| Field | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Unique ID |
| full_name | VARCHAR | User’s full name |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed password |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

#### `wallets`
| Field | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Wallet ID |
| user_id | INT (FK → users.id) | Wallet owner |
| balance | DECIMAL(15,2) | Wallet balance |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |

#### `transactions`
| Field | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Transaction ID |
| sender_id | INT (FK → users.id) | Sender user |
| receiver_id | INT (FK → users.id) | Receiver user |
| amount | DECIMAL(15,2) | Amount transferred |
| type | ENUM | credit, debit, or transfer |
| reference | VARCHAR | Unique reference UUID |
| status | VARCHAR | success, failed, pending |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |


**Relationship summary:**
- A user **has one wallet**.
- A wallet **belongs to a user**.
- A wallet **has many transactions**.
- Each transaction may link **two users (sender & receiver)**.

---


## E-R Diagram

Design link: [View on DBDesigner](https://app.dbdesigner.net/)  
Or you can recreate it easily following this structure:




---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/o3cloudng/demo-credit-wallet-app.git
cd demo-credit-wallet-app

npm install

npm run migrate

npm run dev

```
Create .env file from .env.sample file

## 📁 Project Structure

```bash
demo-credit-wallet-app/
│
├── migrations/
│   ├── 20251103_create_users_wallets_transactions.ts
│
├── src/
|   ├── controllers/
|   |   ├── authController
|   |   ├── userController
|   |   ├── walletController
|   ├── middlewares/
|   |   ├── fauxAuth
|   ├── services/
|   |   ├── lendsqrService.ts
|   ├── utils/
|   |   ├── jwt.ts
|   |   ├── money.ts
|   ├── validator/
|   |   ├── authSchema.ts
|   |   ├── userSchema.ts
|   ├── app.ts
|   ├── db.ts
|   ├── routes.ts
|   ├── server.ts
|   ├── types.d.ts
├── test/
│   ├── UserModel.js
│   ├── WalletModel.js
│   ├── TransactionModel.js
│
├── .env
├── .gitignore
├── jest.config.js
├── knexfile.ts
├── package.json
├── README.md
└── tsconfig.json
```

## API Endpoints
| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| `POST` | `/api/users`                 | Create user and auto wallet  |
| `POST` | `/api/login`                 | login and generate access jwt  |
| `POST` | `/api/users`                 | Create user and auto wallet  |
| `GET` | `/api/users`                 | Get all users, wallet and transactions  |
| `POST` | `/api/transfer`              | Transfer funds between users |
| `GET`  | `/api/wallet`       | Get wallet balance           |
| `GET`  | `/api/transactions` | Get transaction history      |
| `POST`  | `/api/withdraw` | Get transaction history      |



---
## Future Improvements
- Add loan creation and repayment modules
- Add wallet funding via payment gateway
- Add pagination and filters to transaction history
- Integrate Redis caching for wallet lookups
- Add unit & integration tests 

---
## Author

### Olumide Oderinde

Senior Backend Engineer | Django & Node.js Developer

📧 olumideooderinde@gmail.com

