import googlesheets
try:
    gc = googlesheets.get_client()
    sheet = gc.open(googlesheets.SPREADSHEET_NAME).sheet1
    headers = ['Date', 'Customer Name', 'Order ID', 'Total Amount', 'Discount', 'Advance Payment', 'Balance']
    sheet.insert_row(headers, 1)
    print("Headers Inserted Successfully")
except Exception as e:
    print(f"Error: {e}")
