from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class OrderItem(BaseModel):
    name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    customer_name: str
    items: List[OrderItem]
    total_amount: float
    advance_payment: float = 0.0

class OrderResponse(OrderCreate):
    id: str
    balance: float
    status: str
    created_at: datetime
    updated_at: datetime

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None

class ExpenseResponse(ExpenseCreate):
    id: str
    created_at: datetime
    updated_at: datetime
