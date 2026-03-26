# Core Features

## 1 Order Creation

Orders can be created using three methods:

- manual entry
- voice input
- image upload

Each order contains:

Customer Name
Phone Number
Order Date
Items
Quantity
Price per item
Total
Discount
Advance Payment
Remaining Balance

The system automatically calculates totals.

---

## 2 Bill Generation

After an order is created the system generates a bill.

The bill contains:

Business Name
Customer Name
Date
Item List
Quantity
Rate
Subtotal
Discount
Advance
Remaining Balance

Bills should be printable or downloadable as PDF.

---

## 3 Order Storage

All orders must be stored in the database.

User should be able to:

- view order history
- search by customer
- filter by date
- view order details

---

## 4 Google Sheets Sync

Every time an order is created the data must automatically be sent to Google Sheets.

Columns:

Date  
Customer Name  
Order ID  
Total Amount  
Discount  
Advance  
Remaining Balance

---

## 5 Revenue Analytics

Dashboard should display:

Daily Revenue  
Monthly Revenue  
Yearly Revenue  
Average Order Value
Most selling item 
Profit margin 

---

## 6 Expense Tracking

User can add expenses such as:

Chicken Purchase  
Labor  
Other Expenses 

The system should calculate profit.

Profit = Revenue - Expenses

## 7 AI Insights 
Using the google sheets data, the AI should show:

- Sales predictions
- Best selling items
- Slow selling items

