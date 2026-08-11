import { useCallback } from "react";
import { motion } from "framer-motion";
import RTLChat from "../results/RTLChat";
import { useRtlWorkspace } from "../../context/RtlWorkspaceContext";
import Card from "../ui/Card";

export default function ChatPanel() {
  const { rtl, cache, setToolCache } = useRtlWorkspace();
  const conversation = cache.chat || { messages: [], history: [] };

  const handleConversationChange = useCallback(
    (state) => {
      setToolCache("chat", state);
    },
    [setToolCache]
  );

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">AI Chat</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">RTL Assistant</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Ask questions about the active RTL design and get fast, markdown-rich answers.
            </p>
          </div>
        </div>
      </Card>

      {!rtl ? (
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No active RTL design loaded.</p>
          <p className="mt-3 text-sm text-slate-400">
            Upload RTL to continue with your project.
          </p>
        </Card>
      ) : (
        <RTLChat
          rtl={rtl}
          initialMessages={conversation.messages}
          initialHistory={conversation.history}
          onConversationChange={handleConversationChange}
        />
      )}
    </motion.div>
  );
}
