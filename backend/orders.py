from fastapi import APIRouter, HTTPException
from typing import List
from models import OrderCreate, OrderResponse
import database
import googlesheets
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate):
    data = order.dict()
    data['items'] = [item.dict() for item in order.items]
    data['balance'] = order.total_amount - order.advance_payment
    
    mock_id = str(uuid.uuid4())
    data['id'] = mock_id
    data['created_at'] = datetime.now().isoformat()
    data['updated_at'] = data['created_at']
    data['status'] = 'pending'

    if database.supabase:
        try:
            response = database.supabase.table("orders").insert(data).execute()
            if response.data:
                data = response.data[0]
        except Exception as e:
            print(f"Supabase insert failed: {e}")
            
    success, error_msg = googlesheets.append_order_to_sheet(data)
    if not success:
        raise HTTPException(status_code=500, detail=f"Google Sheets Sync Failed: {error_msg}")
        
    return data

@router.get("/", response_model=List[OrderResponse])
def get_orders(limit: int = 50):
    if not database.supabase:
        return googlesheets.get_orders_from_sheet(limit)
    response = database.supabase.table("orders").select("*").order("created_at", desc=True).limit(limit).execute()
    return response.data

@router.get("/test-google-sheets")
def test_google_sheets():
    test_data = {"customer_name": "Test Customer", "id": "Test-ID-001", "total_amount": 1000, "discount": 100, "advance_payment": 500}
    success, error_msg = googlesheets.append_order_to_sheet(test_data)
    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=500, detail=f"Test Failed: {error_msg}")
