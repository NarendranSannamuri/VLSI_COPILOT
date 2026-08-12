from pydantic import BaseModel, Field


class RtlRequest(BaseModel):
    rtl: str = Field(min_length=1)


class ChatRequest(RtlRequest):
    question: str = Field(min_length=1)
