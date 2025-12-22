// lib/sse.ts

export function connectSSE(
  jobId: string,
  query: string,
  onEvent: (e: any) => void
) {
  const es = new EventSource(
    `http://127.0.0.1:8000/stream/${jobId}?query=${encodeURIComponent(query)}`
  );

  es.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onEvent(data);
    } catch {
      // ignore malformed chunks
    }
  };

  es.onerror = () => {
    // ❗ DO NOT LOG AS ERROR
    // This fires when server closes the stream (NORMAL)
    es.close();
  };

  return es;
}
