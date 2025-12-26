export function connectSSE(
  jobId: string,
  query: string,
  docIds: string[],
  onEvent: (e: any) => void
) {
  const params = new URLSearchParams({
    query,
    doc_ids: docIds.join(","),
  });

  console.log("Query:", query, "Doc IDs:", docIds);

  const es = new EventSource(
    `http://127.0.0.1:8000/stream/${jobId}?${params.toString()}`
  );

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch {}
  };

  es.onerror = () => {
    es.close();
  };

  return es;
}
