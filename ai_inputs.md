# AI Order Input System

The application should support creating orders using voice and images.

---

## Voice Order

User presses microphone button and speaks order.

Example:

"3 chicken rolls, 5 samosas, advance 500 for Ahmed."

System converts speech to text then extracts order data.

Pipeline:

Voice → Speech To Text → AI Parser → Structured Order

Technologies:

Whisper for speech recognition  
LLM for order extraction

---

## Image Order

User uploads photo of handwritten or WhatsApp order.

Pipeline:

Image → OCR → AI Parser → Structured Order

Technologies:

Tesseract OCR or Google Vision API