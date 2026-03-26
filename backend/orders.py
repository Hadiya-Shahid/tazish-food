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
    
    # Generate mock ID and timestamps for when Supabase is down/unconfigured
    mock_id = str(uuid.uuid4())
    data['id'] = mock_id
    data['created_at'] = datetime.now().isoformat()
    data['updated_at'] = data['created_at']
    data['status'] = 'pending'
    # Try inserting into Supabase
    if database.supabase:
        try:
            response = database.supabase.table("orders").insert(data).execute()
            if response.data:
                data = response.data[0]
        except Exception as e:
            print(f"Supabase insert failed: {e}")
    else:
        print("Note: Supabase not configured. Order will only be saved to Google Sheets.")

    # Sync to Google Sheets
    sheet_success = googlesheets.append_order_to_sheet(data)
    if not sheet_success:
        print("Failed to sync order to Google Sheets.")
        
    return data

@router.get("/", response_model=List[OrderResponse])
def get_orders(limit: int = 50):
    if not database.supabase:
        # Fetch from Google Sheets instead
        return googlesheets.get_orders_from_sheet(limit)
        
    response = database.supabase.table("orders").select("*").order("created_at", desc=True).limit(limit).execute()
    return response.data

@router.get("/test-google-sheets")
def test_google_sheets():
    """
    Test endpoint for verifying Google Sheets connection and appending a test row.
    """
    test_data = {
        "customer_name": "Test Customer",
        "id": "Test-ID-001",
        "total_amount": 1000,
        "discount": 100,
        "advance_payment": 500,
    }
    
    success = googlesheets.append_order_to_sheet(test_data)
    
    if success:
        return {"status": "success", "message": "Successfully appended test row to Google Sheets"}
    else:
        raise HTTPException(status_code=500, detail="Failed to connect to or append to Google Sheets. Check server logs.")
