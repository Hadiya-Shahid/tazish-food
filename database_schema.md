# Database Schema

## customers

id
name
phone
created_at

---

## orders

id
customer_id
order_date
total_amount
discount
advance
balance
created_at

---

## order_items

id
order_id
item_name
quantity
price
total_price

---

## products

id
name
price


---

## expenses

id
name
amount
date
notes