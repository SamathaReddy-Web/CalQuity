from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Query

import uuid, os

from models import ChatRequest
from sse import sse_response
from pdf_utils import extract_pdf_text, register_pdf, list_documents, delete_document

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF allowed")

    doc_id = str(uuid.uuid4())
    path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")

    with open(path, "wb") as f:
        f.write(await file.read())

    pages = extract_pdf_text(path)
    register_pdf(doc_id, file.filename, pages)

    return {"doc_id": doc_id, "filename": file.filename, "pages": len(pages)}

@app.get("/documents")
def documents():
    return list_documents()

@app.delete("/documents/{doc_id}")
def delete(doc_id: str):
    os.remove(os.path.join(UPLOAD_DIR, f"{doc_id}.pdf"))
    delete_document(doc_id)
    return {"status": "deleted"}

@app.post("/chat")
async def chat(req: ChatRequest):
    return {
        "job_id": str(uuid.uuid4()),
        "query": req.query,
        "doc_ids": req.doc_ids or [],
    }

@app.get("/stream/{job_id}")
async def stream(job_id: str, query: str, doc_ids: str = ""):
    ids = doc_ids.split(",") if doc_ids else []
    return sse_response(query, ids)
