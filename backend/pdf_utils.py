import pdfplumber
import re
import difflib
from typing import Dict, List

import pytesseract
from pdf2image import convert_from_path
from PIL import Image

DOCUMENTS: Dict[str, Dict] = {}

# -------------------------------
# PDF processing
# -------------------------------

def extract_pdf_text(path: str) -> Dict[int, List[str]]:
    pages: Dict[int, List[str]] = {}

    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            print(f"PAGE {i+1} TEXT LENGTH:", len(text))

            if text.strip():
                pages[i + 1] = split_sentences(text)
            else:
                # 🔥 OCR FALLBACK
                print(f"OCR FALLBACK FOR PAGE {i+1}")
                ocr_text = ocr_page(path, i + 1)
                pages[i + 1] = split_sentences(ocr_text)

    return pages


def ocr_page(pdf_path: str, page_number: int) -> str:
    images = convert_from_path(
        pdf_path,
        first_page=page_number,
        last_page=page_number
    )
    if not images:
        return ""

    return pytesseract.image_to_string(images[0])


def split_sentences(text: str) -> List[str]:
    return [
        s.strip()
        for s in re.split(r'(?<=[.!?])\s+', text)
        if len(s.strip()) > 8
    ]

# -------------------------------
# Registry
# -------------------------------

def register_pdf(doc_id: str, filename: str, pages: Dict[int, List[str]]):
    DOCUMENTS[doc_id] = {
        "filename": filename,
        "pages": pages,
    }

    total_sentences = sum(len(p) for p in pages.values())
    print(f"PDF REGISTERED → {filename} | Sentences:", total_sentences)


def list_documents():
    return [
        {
            "doc_id": doc_id,
            "filename": doc["filename"],
            "pages": len(doc["pages"]),
        }
        for doc_id, doc in DOCUMENTS.items()
    ]


def delete_document(doc_id: str | None = None):
    if doc_id is None:
        DOCUMENTS.clear()
        print("ALL DOCUMENTS CLEARED")
    else:
        DOCUMENTS.pop(doc_id, None)
        print("DOCUMENT REMOVED:", doc_id)

# -------------------------------
# Search (RAG core)
# -------------------------------

def preprocess(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def score(query: str, sentence: str) -> float:
    return difflib.SequenceMatcher(None, preprocess(query), preprocess(sentence)).ratio()


def search_documents(query: str, doc_ids: list[str] | None = None):
    results = []

    for doc_id, doc in DOCUMENTS.items():
        if doc_ids and doc_id not in doc_ids:
            continue

        for page_no, sentences in doc["pages"].items():
            for sentence in sentences:
                s = score(query, sentence)
                if s > 0.25:
                    results.append({
                        "doc_id": doc_id,
                        "page": page_no,
                        "sentence": sentence,
                        "score": s,
                    })

    print("MATCHES FOUND:", len(results))
    return sorted(results, key=lambda x: x["score"], reverse=True)
