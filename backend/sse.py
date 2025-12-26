from fastapi.responses import StreamingResponse
import asyncio
import json

from llm import llm_only_answer, llm_with_context
from pdf_utils import DOCUMENTS


def sse(event_type: str, content: dict):
    return f"data: {json.dumps({'type': event_type, 'content': content})}\n\n"


async def event_generator(query: str, doc_ids: list[str] | None):
    print("QUERY:", query)
    print("DOC IDS RECEIVED:", doc_ids)

    yield sse("typing", {"typing": True})
    yield sse("tool", {"message": "🔍 Processing request"})
    await asyncio.sleep(0.2)

    # =====================================================
    # CASE 1: FILES SELECTED → FORCE DOCUMENT CONTEXT
    # =====================================================
    if doc_ids:
        print("FILES SELECTED → USING DOCUMENT CONTEXT")

        context_lines: list[str] = []
        citations: list[dict] = []
        cid = 1

        for doc_id in doc_ids:
            doc = DOCUMENTS.get(doc_id)

            if not doc:
                print("⚠️ DOC NOT FOUND:", doc_id)
                continue

            for page_no, sentences in doc["pages"].items():
                for sentence in sentences[:4]:  # safe cap per page
                    context_lines.append(f"[{cid}] {sentence}")
                    citations.append({
                        "id": cid,
                        "doc_id": doc_id,
                        "page": page_no,
                        "quote": sentence,
                    })
                    cid += 1
                break  # only first page per doc

            break  # only first document (for now)

        print("CONTEXT SIZE:", len(context_lines))

        # ❗ SAFETY CHECK
        if not context_lines:
            print("⚠️ EMPTY CONTEXT — FALLING BACK TO LLM ONLY")
            answer = llm_only_answer(query)
            yield sse("text", {"content": answer})
            yield sse("typing", {"typing": False})
            return

        answer = llm_with_context(query, "\n".join(context_lines))

        yield sse("text", {"content": answer})

        for c in citations:
            yield sse("citation", c)

        yield sse("typing", {"typing": False})
        return

    # =====================================================
    # CASE 2: NO FILES → NORMAL CHAT
    # =====================================================
    print("NO FILES → NORMAL CHAT")

    answer = llm_only_answer(query)
    yield sse("text", {"content": answer})
    yield sse("typing", {"typing": False})


def sse_response(query: str, doc_ids: list[str] | None):
    return StreamingResponse(
        event_generator(query, doc_ids),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
