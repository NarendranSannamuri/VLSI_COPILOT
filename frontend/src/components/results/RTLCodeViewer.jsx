import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Card from "../ui/Card";
import CopyButton from "../ui/CopyButton";
import Button from "../ui/Button";

function RTLCodeViewer({ code }) {
  const source = code || "// No RTL source available";
  const [fullscreen, setFullscreen] = useState(false);

  const viewer = (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-slate-950 p-6" : ""}>
      <div className={fullscreen ? "mx-auto flex h-full max-w-6xl flex-col" : ""}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">RTL Source Code</h2>
          <div className="flex items-center gap-2">
            <CopyButton text={source} />
            <Button
              variant="secondary"
              className="!px-3 !py-1.5 !text-xs"
              onClick={() => setFullscreen((v) => !v)}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {fullscreen ? "Exit" : "Fullscreen"}
            </Button>
          </div>
        </div>

        <div className={fullscreen ? "min-h-0 flex-1 overflow-auto" : ""}>
          <SyntaxHighlighter
            language="verilog"
            style={oneDark}
            showLineNumbers
            customStyle={{
              borderRadius: 12,
              fontSize: 14,
              maxHeight: fullscreen ? "100%" : 500,
              height: fullscreen ? "100%" : undefined,
              margin: 0,
            }}
          >
            {source}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );

  if (fullscreen) return viewer;

  return <Card>{viewer}</Card>;
}

export default RTLCodeViewer;
