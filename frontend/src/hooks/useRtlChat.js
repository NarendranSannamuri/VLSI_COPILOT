import { useCallback, useEffect, useRef, useState } from "react";
import { chatRtl, normalizeError } from "../services/api";

export function useRtlChat(rtl, initialMessages = [], initialHistory = []) {
  const [messages, setMessages] = useState(initialMessages);
  const [history, setHistory] = useState(initialHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const historyRef = useRef(initialHistory);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const ask = useCallback(
    async (question) => {
      const trimmed = question?.trim();
      if (!trimmed || !rtl) return;

      setError("");
      const userMessage = { sender: "user", text: trimmed };
      const nextHistory = [...historyRef.current, { role: "user", content: trimmed }];
      historyRef.current = nextHistory;
      setHistory(nextHistory);
      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const data = await chatRtl(rtl, trimmed, nextHistory);
        const answerText = data.answer || data.response || data.message || "No response.";
        const aiMessage = { sender: "ai", text: answerText };
        setMessages((prev) => [...prev, aiMessage]);
        setHistory((prev) => [...prev, { role: "assistant", content: answerText }]);
      } catch (err) {
        const normalized = normalizeError(err);
        setError(normalized.message);
        const failureText = "Sorry — I couldn't answer that right now. Please try again.";
        setMessages((prev) => [...prev, { sender: "ai", text: failureText }]);
        setHistory((prev) => [...prev, { role: "assistant", content: failureText }]);
      } finally {
        setLoading(false);
      }
    },
    [rtl]
  );

  const clear = useCallback(() => {
    setMessages([]);
    setHistory([]);
    setError("");
  }, []);

  return { messages, history, loading, error, ask, clear };
}

export default useRtlChat;
