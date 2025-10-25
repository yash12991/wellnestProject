// Helper to call the streaming chat endpoint and process chunks.
// Usage:
// import { streamChatMessage } from '../utils/streamingChat';
// const controller = new AbortController();
// streamChatMessage({ sessionId, message, systemPrompt, signal: controller.signal,
//   onChunk: (chunk) => { /* append to UI */ },
//   onDone: (meta) => { /* final metadata */ },
//   onError: (err) => { /* handle error */ }
// });

export async function streamChatMessage({ sessionId, message, systemPrompt, signal, onChunk, onDone, onError }) {
  try {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/v1/api/chat/message/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify({ sessionId, message, systemPrompt }),
      signal
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Stream request failed: ${res.status} ${text}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let buffer = '';

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (value) {
        buffer += decoder.decode(value, { stream: true });
        // Process lines (each line is a JSON object)
        let lines = buffer.split('\n');
        // keep last incomplete line in buffer
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            if (obj.chunk) {
              onChunk && onChunk(obj.chunk);
            } else if (obj.done) {
              onDone && onDone(obj);
            } else if (obj.error) {
              onError && onError(new Error(obj.error));
            }
          } catch (e) {
            // ignore parse errors for partial content
            console.warn('Failed to parse stream line', e, line);
          }
        }
      }
      done = streamDone;
    }

    // Process any remaining buffered line
    if (buffer && buffer.trim()) {
      try {
        const obj = JSON.parse(buffer);
        if (obj.chunk) onChunk && onChunk(obj.chunk);
        if (obj.done) onDone && onDone(obj);
      } catch (e) {
        console.warn('Failed to parse final buffer', e, buffer);
      }
    }

  } catch (error) {
    console.error('Streaming chat error:', error);
    onError && onError(error);
  }
}
