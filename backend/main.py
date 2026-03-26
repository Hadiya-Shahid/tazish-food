from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from orders import router as orders_router
from expenses import router as expenses_router
from ai_routes import router as ai_router

app = FastAPI(title="Tazish Food Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders_router)
app.include_router(expenses_router)
app.include_router(ai_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Tazish Food Backend API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
