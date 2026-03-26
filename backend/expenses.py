from fastapi import APIRouter, HTTPException
from typing import List
from models import ExpenseCreate, ExpenseResponse
import database

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.post("/", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate):
    data = expense.dict()
    import uuid
    from datetime import datetime
    data['id'] = str(uuid.uuid4())
    data['created_at'] = datetime.now().isoformat()
    data['updated_at'] = data['created_at']

    if database.supabase:
        try:
            response = database.supabase.table("expenses").insert(data).execute()
            if response.data: data = response.data[0]
        except Exception: pass
        
    import googlesheets
    googlesheets.append_expense(data)
    return data

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(limit: int = 50):
    if not database.supabase:
        import googlesheets
        return googlesheets.get_expenses_from_sheet(limit)
        
    response = database.supabase.table("expenses").select("*").order("created_at", desc=True).limit(limit).execute()
    return response.data
