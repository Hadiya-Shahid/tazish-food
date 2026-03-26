import os
import gspread
from google.oauth2.service_account import Credentials

# Scopes needed for Google Sheets API
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

CREDENTIALS_FILE = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "google_credentials.json")

# The name or ID of the spreadsheet
# In a real app, this should be in an environment variable, but for now we'll set a default
SPREADSHEET_NAME = os.environ.get("SPREADSHEET_NAME", "Orders") 

client = None

def get_client():
    global client
    if client is not None:
        return client
        
    try:
        # Check if the credentials file exists
        if not os.path.exists(CREDENTIALS_FILE):
            print(f"Warning: Google credentials file '{CREDENTIALS_FILE}' not found.")
            return None
            
        credentials = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
        client = gspread.authorize(credentials)
        return client
    except Exception as e:
        print(f"Error initializing Google Sheets client: {e}")
        return None

def append_order_to_sheet(order_data: dict) -> bool:
    """
    Appends an order to the Google Sheet.
    Returns True if successful, False otherwise.
    """
    gc = get_client()
    if not gc:
        print("Cannot append order: Google Sheets client not initialized.")
        return False
        
    try:
        # Try to open the sheet by name (or we could change this to open_by_key if the user provides the ID)
        try:
             sheet = gc.open(SPREADSHEET_NAME).sheet1
        except gspread.exceptions.SpreadsheetNotFound:
             print(f"Error: Spreadsheet '{SPREADSHEET_NAME}' not found. Make sure you shared it with the service account email.")
             return False

        # Format the row according to: Date, Customer, Order ID, Total, Discount, Advance, Balance
        # Assuming order_data has these keys (or we derive them)
        import datetime
        date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # In the future we could extract this directly from the backend models
        row = [
            date_str,
            order_data.get("customer_name", "Unknown"),
            f"TZ#{order_data.get('id', 'N/A')}",
            order_data.get("total_amount", 0),
            order_data.get("discount", 0),
            order_data.get("advance_payment", 0),
            order_data.get("total_amount", 0) - order_data.get("advance_payment", 0)
        ]
        
        sheet.append_row(row)
        print(f"Successfully appended order {row[2]} to Google Sheet.")
        return True
    except Exception as e:
        print(f"Error appending order to Google Sheet: {e}")
        return False

def get_orders_from_sheet(limit: int = 50) -> list:
    """
    Fetches recent orders directly from the Google Sheet.
    Returns a list of dictionaries matching the OrderResponse schema.
    """
    gc = get_client()
    if not gc:
        print("Cannot fetch orders: Google Sheets client not initialized.")
        return []
        
    try:
        try:
             sheet = gc.open(SPREADSHEET_NAME).sheet1
        except gspread.exceptions.SpreadsheetNotFound:
             return []
             
        # get_all_records returns a list of dictionaries with keys matching row 1
        records = sheet.get_all_records()
        orders = []
        # Process from newest to oldest
        for r in reversed(records):
            order_id = str(r.get("Order ID", ""))
            if not order_id: 
                continue
                
            # Remove "TZ#" prefix if it exists to match our standard ID format
            if order_id.startswith("TZ#"):
                order_id = order_id[3:]
                
            # Safely handle numeric conversions from strings using float()
            def safe_float(val):
                try: 
                    return float(str(val).replace(',', '')) if val else 0.0
                except (ValueError, TypeError): 
                    return 0.0
            
            orders.append({
                "id": order_id,
                "customer_name": str(r.get("Customer Name", r.get("Customer", "Unknown"))),
                "items": [], # Google sheets doesn't store items array currently
                "total_amount": safe_float(r.get("Total Amount", r.get("Total", 0))),
                "advance_payment": safe_float(r.get("Advance Payment", r.get("Advance", 0))),
                "balance": safe_float(r.get("Balance", 0)),
                "discount": safe_float(r.get("Discount", 0)),
                "status": "completed",
                "created_at": str(r.get("Date", "")),
                "updated_at": str(r.get("Date", ""))
            })
            if len(orders) >= limit:
                break
                
        return orders
    except Exception as e:
        print(f"Error fetching orders from Google Sheet: {e}")
        return []

def get_expenses_sheet():
    gc = get_client()
    if not gc: return None
    try:
        ss = gc.open(SPREADSHEET_NAME)
        try:
            return ss.worksheet("Expenses")
        except gspread.exceptions.WorksheetNotFound:
            # Create it!
            sheet = ss.add_worksheet(title="Expenses", rows="1000", cols="5")
            sheet.insert_row(["Date", "Category", "Amount", "Description"], 1)
            return sheet
    except Exception as e:
        print(f"Error getting Expenses sheet: {e}")
        return None

def append_expense(expense_data: dict) -> bool:
    sheet = get_expenses_sheet()
    if not sheet: return False
    try:
        import datetime
        date_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        row = [
            date_str,
            expense_data.get("category", "Uncategorized"),
            expense_data.get("amount", 0),
            expense_data.get("description", "")
        ]
        sheet.append_row(row)
        return True
    except Exception as e:
        print(f"Error appending expense to Google Sheet: {e}")
        return False

def get_expenses_from_sheet(limit: int = 50) -> list:
    sheet = get_expenses_sheet()
    if not sheet: return []
    try:
        records = sheet.get_all_records()
        expenses = []
        import uuid
        for r in reversed(records):
            
            def safe_float(val):
                try: 
                    return float(str(val).replace(',', '')) if val else 0.0
                except (ValueError, TypeError): 
                    return 0.0
                    
            expenses.append({
                "id": str(uuid.uuid4()),
                "category": str(r.get("Category", "Uncategorized")),
                "amount": safe_float(r.get("Amount", 0)),
                "description": str(r.get("Description", "")),
                "created_at": str(r.get("Date", "")),
                "updated_at": str(r.get("Date", ""))
            })
            if len(expenses) >= limit: break
        return expenses
    except Exception as e:
        print(f"Error fetching expenses from Google Sheet: {e}")
        return []
