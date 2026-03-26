from fastapi import APIRouter, UploadFile, File

router = APIRouter(prefix="/api/ai", tags=["AI Processing"])

@router.post("/parse-voice")
async def parse_voice(file: UploadFile = File(...)):
    """
    Simulated Whisper integration for voice parsing.
    Requires local whisper setup: model = whisper.load_model("base")
    """
    return {
        "status": "success",
        "mock_transcription": "3 chicken rolls, 5 samosas, advance 500 for Ahmed.",
        "parsed_order": {
            "customer_name": "Ahmed",
            "items": [
                {"name": "chicken rolls", "quantity": 3, "price": 150},
                {"name": "samosas", "quantity": 5, "price": 50}
            ],
            "total_amount": 700,
            "advance_payment": 500
        }
    }

@router.post("/parse-image")
async def parse_image(file: UploadFile = File(...)):
    """
    Simulated Tesseract OCR integration for image parsing.
    Requires local pytesseract setup.
    """
    return {
        "status": "success",
        "mock_ocr": "Order for Sana\n5 chicken rolls\nTotal: 750",
        "parsed_order": {
            "customer_name": "Sana",
            "items": [
                {"name": "chicken rolls", "quantity": 5, "price": 150}
            ],
            "total_amount": 750,
            "advance_payment": 0
        }
    }
