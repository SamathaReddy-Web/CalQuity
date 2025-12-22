from fastapi.responses import StreamingResponse
import asyncio
import json
from pdf_utils import search_documents
from llm import llm_only_answer, llm_with_context


def sse(event_type: str, content: dict):
    return f"data: {json.dumps({'type': event_type, 'content': content})}\n\n"


async def event_generator(query: str, doc_ids: list[str] | None):
    print("🟢 SSE STARTED | QUERY:", query)
    print("📎 DOC IDS:", doc_ids)

    yield sse("typing", {"typing": True})

    yield sse("tool", {"message": "🔍 Searching documents..."})
    await asyncio.sleep(0.3)

    try:
        matches = search_documents(query, doc_ids)
        print("🟡 SEARCH RESULT:", matches)
    except Exception as e:
        print("❌ SEARCH FAILED:", e)
        yield sse("text", {"content": "Search failed."})
        yield sse("typing", {"typing": False})
        return

    # ---------- NO DOCUMENTS ----------
    if not matches:
        yield sse("tool", {"message": "🧠 Thinking..."})
        await asyncio.sleep(0.3)

        answer = llm_only_answer(query)
        print("🟢 LLM ANSWER:", answer)

        yield sse("text", {"content": answer})
        yield sse("typing", {"typing": False})
        return

    # ---------- DOCUMENTS (RAG) ----------
    yield sse("tool", {"message": "📄 Reading PDFs..."})
    await asyncio.sleep(0.3)

    context_lines = []
    citations = []

    for i, m in enumerate(matches[:5], start=1):
        context_lines.append(f"[{i}] {m['sentence']}")
        citations.append({
            "id": i,
            "doc_id": m["doc_id"],
            "page": m["page"],
            "quote": m["sentence"],
        })

    context = "\n".join(context_lines)

    yield sse("tool", {"message": "🧠 Generating answer..."})
    await asyncio.sleep(0.3)

    answer = llm_with_context(query, context)
    print("🟢 RAG ANSWER:", answer)

    yield sse("text", {"content": answer})

    for c in citations:
        yield sse("citation", c)

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
