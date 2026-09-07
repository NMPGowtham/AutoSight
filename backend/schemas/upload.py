from pydantic import BaseModel

class UploadCreate(BaseModel):
    img_id: int