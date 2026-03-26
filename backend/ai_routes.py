from fastapi import APIRouter, UploadFile, File
import re
import asyncio

router = APIRouter(prefix="/api/ai", tags=["AI Processing"])

@router.post("/parse-text")
async def parse_text(payload: dict):
    """
    Parses voice transcript text using regex heuristics.
    Works for text like "5 samosas and 3 chicken rolls for ahmed advance 500"
    """
    text = payload.get("text", "").lower()
    items = []
    
    # Match quantity followed by item name (stopping at common delimiters)
    matches = re.finditer(r'(\d+)\s+([a-z\s]+?)(?:,|and|for|advance|$)', text)
    for m in matches:
        item_name = m.group(2).strip()
        if item_name:
            items.append({"name": item_name.title(), "quantity": int(m.group(1)), "price": 100})  # 100 is a placeholder price
            
    name_match = re.search(r'for\s+([a-z]+)', text)
    customer = name_match.group(1).capitalize() if name_match else "Unknown Client"
    
    adv_match = re.search(r'advance\s+(\d+)', text)
    advance = int(adv_match.group(1)) if adv_match else 0

    if not items:
        # Fallback simulated data if regex fails
        items = [
            {"name": "Chicken Rolls", "quantity": 3, "price": 150},
            {"name": "Samosas", "quantity": 5, "price": 50}
        ]
        customer = "Ahmed (Simulated)"
        advance = 500

    return {
        "customer_name": customer,
        "items": items,
        "total_amount": sum(i['quantity'] * i['price'] for i in items),
        "advance_payment": advance
    }

@router.post("/parse-image")
async def parse_image(file: UploadFile = File(...)):
    """
    Simulated Tesseract OCR integration for image parsing.
    Returns structured data after a brief delay to simulate processing.
    """
    await asyncio.sleep(2.5) # Simulate OCR lag
    return {
        "status": "success",
        "mock_ocr": f"Scanned: {file.filename}\nOrder for Sana\n5 chicken rolls\nTotal: 750",
        "parsed_order": {
            "customer_name": "Sana (From Image)",
            "items": [
                {"name": "Chicken Rolls", "quantity": 5, "price": 150},
                {"name": "Spring Rolls", "quantity": 2, "price": 120}
            ],
            "total_amount": 990,
            "advance_payment": 200
        }
    }
