from fastapi.responses import StreamingResponse
import asyncio
import json

from llm import llm_only_answer, llm_with_context, llm_follow_up_questions
from pdf_utils import DOCUMENTS


def sse(event_type: str, content=None):
    payload = {"type": event_type}
    if content is not None:
        payload["content"] = content
    return f"data: {json.dumps(payload)}\n\n"


async def stream_text(text: str, delay: float = 0.015):
    """
    Streams text word-by-word for typing effect
    """
    for token in text.split(" "):
        yield sse("text_delta", token + " ")
        await asyncio.sleep(delay)


async def event_generator(query: str, doc_ids: list[str] | None):
    # ---------- START ----------
    yield sse("start")
    await asyncio.sleep(0.1)

    # =====================================================
    # CASE 1: DOCUMENT CONTEXT (FORCED CITATIONS)
    # =====================================================
    if doc_ids:
        context_lines: list[str] = []
        citations: list[dict] = []
        cid = 1

        for doc_id in doc_ids:
            doc = DOCUMENTS.get(doc_id)
            if not doc:
                continue

            for page_no, sentences in doc["pages"].items():
                for sentence in sentences[:3]:
                    context_lines.append(f"[{cid}] {sentence}")
                    citations.append({
                        "id": cid,
                        "doc_id": doc_id,
                        "page": page_no,
                        "quote": sentence,
                    })
                    cid += 1
                break  # first page only
            break  # first document only (for now)

        # ---------- SAFETY: EMPTY CONTEXT ----------
        if not context_lines:
            answer = llm_only_answer(query)
            async for chunk in stream_text(answer):
                yield chunk
            yield sse("done")
            return

        # ---------- 🔴 CRITICAL CHANGE: CITATION ENFORCEMENT ----------
        prompt = f"""
You are answering using the numbered sources below.

RULES:
- Use ONLY the information from the sources.
- Whenever you use a fact, MUST include its citation number inline.
- Citation format must be exactly like [1], [2], etc.
- Do NOT invent citations.
- Do NOT put citations only at the end; they must appear in the sentence.

Sources:
{chr(10).join(context_lines)}

Question:
{query}
"""

        answer = llm_with_context(query, prompt)

        # ---------- STREAM ANSWER ----------
        async for chunk in stream_text(answer):
            yield chunk

        # ---------- SEND CITATION METADATA ----------
        for c in citations:
            yield sse("citation", c)

        # ---------- FOLLOW-UP QUESTIONS ----------
        follow_ups = llm_follow_up_questions(query, answer)
        if follow_ups:
            yield sse("follow_up", follow_ups)

        yield sse("done")
        return

    # =====================================================
    # CASE 2: NO DOCUMENTS → NORMAL CHAT
    # =====================================================
    answer = llm_only_answer(query)

    async for chunk in stream_text(answer):
        yield chunk

    # ---------- FOLLOW-UP QUESTIONS ----------
    follow_ups = llm_follow_up_questions(query, answer)
    if follow_ups:
        yield sse("follow_up", follow_ups)

    yield sse("done")


def sse_response(query: str, doc_ids: list[str] | None):
    return StreamingResponse(
        event_generator(query, doc_ids),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
