import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# Initialize the Supabase client
# The user will need to configure the .env file with real credentials
try:
    if SUPABASE_URL and SUPABASE_KEY:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    else:
        supabase = None
        print("Warning: Supabase credentials not found in environment variables.")
except Exception as e:
    supabase = None
    print(f"Error initializing Supabase client: {e}")
