import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Send, Loader2 } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import CopyButton from "../ui/CopyButton";
import ErrorBanner from "../ui/ErrorBanner";
import useRtlChat from "../../hooks/useRtlChat";

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-800 px-4 py-3">
      <span className="typing-dot h-2 w-2 rounded-full bg-cyan-300" />
      <span className="typing-dot h-2 w-2 rounded-full bg-cyan-300" />
      <span className="typing-dot h-2 w-2 rounded-full bg-cyan-300" />
    </div>
  );
}

function RTLChat({ rtl, initialMessages = [], initialHistory = [], onConversationChange }) {
  const [question, setQuestion] = useState("");
  const bottomRef = useRef(null);
  const { messages, history, loading, error, ask } = useRtlChat(rtl, initialMessages, initialHistory);
  const prevCountRef = useRef(messages.length);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (typeof onConversationChange === "function" && messages.length !== prevCountRef.current) {
      prevCountRef.current = messages.length;
      onConversationChange({ messages, history });
    }
  }, [messages, history, onConversationChange]);

  const handleAsk = async () => {
    const value = question;
    setQuestion("");
    await ask(value);
  };

  return (
    <Card>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">RTL Chat Assistant</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ask questions about the active RTL design.
          </p>
        </div>
      </div>

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <div className="mb-5 max-h-[28rem] space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        {messages.length === 0 && !loading && (
          <p className="py-10 text-center text-sm text-slate-500">
            Try: “Is this design synthesizable?” or “Explain the assign statements.”
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === "user"
                  ? "bg-cyan-500 text-slate-950"
                  : "border border-slate-700 bg-slate-900 text-slate-200"
              }`}
            >
              {msg.sender === "ai" ? (
                <>
                  <div className="mb-2 flex justify-end">
                    <CopyButton text={msg.text} />
                  </div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        if (!inline && match) {
                          return (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ borderRadius: 12, marginTop: 8 }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          );
                        }
                        return (
                          <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-cyan-200" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <textarea
        rows={3}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
          }
        }}
        placeholder="Ask anything about your RTL..."
        className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm outline-none transition focus:border-cyan-400/50"
      />

      <Button className="mt-4" onClick={handleAsk} disabled={loading || !question.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
        {loading ? "Thinking..." : "Ask AI"}
      </Button>
    </Card>
  );
}

export default RTLChat;
