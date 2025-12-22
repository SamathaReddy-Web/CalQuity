# backend/pdf_utils.py

import pdfplumber
import re
import difflib
from typing import Dict, List

DOCUMENTS: Dict[str, Dict] = {}

# -------------------------------
# PDF processing
# -------------------------------

def extract_pdf_text(path: str) -> Dict[int, List[str]]:
    pages: Dict[int, List[str]] = {}
    with pdfplumber.open(path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            pages[i + 1] = split_sentences(text)
    return pages

def split_sentences(text: str) -> List[str]:
    return [
        s.strip()
        for s in re.split(r'(?<=[.!?])\s+', text)
        if len(s.strip()) > 25
    ]

# -------------------------------
# Registry
# -------------------------------

def register_pdf(doc_id: str, filename: str, pages: Dict[int, List[str]]):
    DOCUMENTS[doc_id] = {
        "filename": filename,
        "pages": pages,
    }

def list_documents():
    return [
        {
            "doc_id": doc_id,
            "filename": doc["filename"],
            "pages": len(doc["pages"]),
        }
        for doc_id, doc in DOCUMENTS.items()
    ]

def delete_document(doc_id: str):
    """🆕 Remove document from in-memory registry"""
    if doc_id in DOCUMENTS:
        del DOCUMENTS[doc_id]

# -------------------------------
# Search logic
# -------------------------------

def preprocess_text(text: str) -> str:
    """Normalize text for better matching."""
    # Convert to lowercase and remove extra whitespace
    text = text.lower().strip()
    # Remove punctuation except for word boundaries
    text = re.sub(r'[^\w\s]', ' ', text)
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    return text

def score_sentence(query: str, sentence: str) -> float:
    """Improved scoring that considers partial matches and fuzzy matching."""
    query_processed = preprocess_text(query)
    sentence_processed = preprocess_text(sentence)

    query_words = set(query_processed.split())
    sentence_words = set(sentence_processed.split())

    # Exact word matches (highest weight)
    exact_matches = len(query_words & sentence_words)

    # Partial word matches (substring matching)
    partial_score = 0
    for q_word in query_words:
        for s_word in sentence_words:
            if q_word in s_word or s_word in q_word:
                partial_score += 0.5

    # Fuzzy matching for similar words
    fuzzy_score = 0
    for q_word in query_words:
        for s_word in sentence_words:
            similarity = difflib.SequenceMatcher(None, q_word, s_word).ratio()
            if similarity > 0.8:  # High similarity threshold
                fuzzy_score += similarity * 0.3

    # Substring matching in the full text
    substring_score = 0
    query_parts = query_processed.split()
    for part in query_parts:
        if len(part) > 2 and part in sentence_processed:
            substring_score += 0.2

    total_score = exact_matches + partial_score + fuzzy_score + substring_score

    return total_score

def search_documents(query: str, doc_ids: list[str] | None = None):
    """
    Search sentences across indexed PDFs.
    If doc_ids is provided, only search those documents.
    """

    results = []

    for doc in DOCUMENTS: 
        if doc_ids and doc["doc_id"] not in doc_ids:
            continue

        for page_no, text in enumerate(doc["pages"], start=1):
            if query.lower() in text.lower():
                results.append({
                    "doc_id": doc["doc_id"],
                    "page": page_no,
                    "sentence": text.strip()[:300],
                })

    return results

