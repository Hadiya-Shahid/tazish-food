# Backend Architecture

Framework: FastAPI

Database: PostgreSQL

ORM: SQLAlchemy

API Structure

/api/orders
/api/customers
/api/expenses
/api/analytics
/api/ai

---

## Order API

POST /orders

Creates new order and saves order items.

After saving the order:

1 update database  
2 sync order to Google Sheets  
3 return generated bill

---

GET /orders
Fetch all orders

---

## Expense API

POST /expenses

Adds new expense entry.

---

## Analytics API

GET /analytics

Returns:

daily revenue  
monthly revenue  
yearly revenue  
profit

## AI API

POST /voice-order
Convert voice to order data

POST /image-order
Extract order details from image