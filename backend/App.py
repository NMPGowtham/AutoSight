from fastapi import FastAPI

from db.base import Base
from db.session import engine
# import models

from api.v1.auth import router as auth_router
from api.v1.images import router as image_router
from api.v1.validation import router as validation_router

app = FastAPI(
    title="Legal Metrology Compliance API",
    version="1.0.0"
)


Base.metadata.create_all(bind=engine)


app.include_router(auth_router)
app.include_router(image_router)
app.include_router(validation_router)

@app.get("/")
def root():
    return {
        "message": "Legal Metrology Compliance API is running"
    }