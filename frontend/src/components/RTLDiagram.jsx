import { useMemo, useState, memo, useEffect } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import "reactflow/dist/style.css";
import Card from "./ui/Card";
import Button from "./ui/Button";

// Custom SVG Digital Logic Gate Node Components

const InputPortNode = memo(({ data, selected }) => (
  <div className={`flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-mono font-bold text-slate-100 shadow-md ${selected ? "border-cyan-400 bg-cyan-950/90" : "border-cyan-500/50 bg-slate-950/90"}`}>
    <span className="h-2 w-2 rounded-full bg-cyan-400" />
    <span>{data.label}</span>
    <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2 !h-2" />
  </div>
));
InputPortNode.displayName = "InputPortNode";

const OutputPortNode = memo(({ data, selected }) => (
  <div className={`flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-mono font-bold text-slate-100 shadow-md ${selected ? "border-emerald-400 bg-emerald-950/90" : "border-emerald-500/50 bg-slate-950/90"}`}>
    <Handle type="target" position={Position.Left} className="!bg-emerald-400 !w-2 !h-2" />
    <span className="h-2 w-2 rounded-full bg-emerald-400" />
    <span>{data.label}</span>
  </div>
));
OutputPortNode.displayName = "OutputPortNode";

const AndGateNode = memo(({ data, selected }) => (
  <div className={`relative flex h-14 w-20 items-center justify-center rounded-r-2xl border-2 bg-indigo-950/90 p-2 shadow-lg ${selected ? "border-indigo-400 text-indigo-200 ring-2 ring-indigo-400/40" : "border-indigo-500/70 text-indigo-300"}`}>
    <Handle type="target" position={Position.Left} className="!bg-indigo-400 !w-2 !h-2" />
    <div className="font-mono text-xs font-extrabold tracking-wider">{data.label || "AND"}</div>
    <Handle type="source" position={Position.Right} className="!bg-indigo-400 !w-2 !h-2" />
  </div>
));
AndGateNode.displayName = "AndGateNode";

const OrGateNode = memo(({ data, selected }) => (
  <div className={`relative flex h-14 w-20 items-center justify-center rounded-2xl border-2 bg-purple-950/90 p-2 shadow-lg ${selected ? "border-purple-400 text-purple-200 ring-2 ring-purple-400/40" : "border-purple-500/70 text-purple-300"}`}>
    <Handle type="target" position={Position.Left} className="!bg-purple-400 !w-2 !h-2" />
    <div className="font-mono text-xs font-extrabold tracking-wider">{data.label || "OR"}</div>
    <Handle type="source" position={Position.Right} className="!bg-purple-400 !w-2 !h-2" />
  </div>
));
OrGateNode.displayName = "OrGateNode";

const XorGateNode = memo(({ data, selected }) => (
  <div className={`relative flex h-14 w-20 items-center justify-center rounded-2xl border-2 border-double bg-fuchsia-950/90 p-2 shadow-lg ${selected ? "border-fuchsia-400 text-fuchsia-200 ring-2 ring-fuchsia-400/40" : "border-fuchsia-500/70 text-fuchsia-300"}`}>
    <Handle type="target" position={Position.Left} className="!bg-fuchsia-400 !w-2 !h-2" />
    <div className="font-mono text-xs font-extrabold tracking-wider">{data.label || "XOR"}</div>
    <Handle type="source" position={Position.Right} className="!bg-fuchsia-400 !w-2 !h-2" />
  </div>
));
XorGateNode.displayName = "XorGateNode";

const NotGateNode = memo(({ data, selected }) => (
  <div className={`relative flex h-12 w-16 items-center justify-center rounded-full border-2 bg-rose-950/90 p-2 shadow-lg ${selected ? "border-rose-400 text-rose-200 ring-2 ring-rose-400/40" : "border-rose-500/70 text-rose-300"}`}>
    <Handle type="target" position={Position.Left} className="!bg-rose-400 !w-2 !h-2" />
    <div className="font-mono text-xs font-extrabold">NOT</div>
    <Handle type="source" position={Position.Right} className="!bg-rose-400 !w-2 !h-2" />
  </div>
));
NotGateNode.displayName = "NotGateNode";

const MuxNode = memo(({ data, selected }) => (
  <div className={`relative flex h-18 w-20 flex-col items-center justify-center rounded-xl border-2 bg-amber-950/90 p-2 shadow-lg ${selected ? "border-amber-400 text-amber-200 ring-2 ring-amber-400/40" : "border-amber-500/70 text-amber-300"}`}>
    <Handle type="target" position={Position.Left} id="in" className="!bg-amber-400 !w-2 !h-2" />
    <Handle type="target" position={Position.Top} id="sel" className="!bg-amber-400 !w-2 !h-2" />
    <div className="font-mono text-xs font-extrabold">MUX</div>
    <Handle type="source" position={Position.Right} className="!bg-amber-400 !w-2 !h-2" />
  </div>
));
MuxNode.displayName = "MuxNode";

const DffNode = memo(({ data, selected }) => (
  <div className={`relative flex h-20 w-28 flex-col justify-between rounded-xl border-2 bg-blue-950/95 p-2.5 shadow-xl ${selected ? "border-blue-400 text-blue-200 ring-2 ring-blue-400/40" : "border-blue-500/70 text-blue-300"}`}>
    <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-2 !h-2" />
    <div className="flex items-center justify-between text-[10px] font-mono font-bold">
      <span>D</span>
      <span>Q</span>
    </div>
    <div className="text-center font-mono text-xs font-extrabold text-blue-200">
      {data.label || "DFF"}
    </div>
    <div className="text-[9px] text-slate-400 font-mono">CLK / RST</div>
    <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-2 !h-2" />
  </div>
));
DffNode.displayName = "DffNode";

const LogicBlockNode = memo(({ data, selected }) => (
  <div className={`relative flex min-h-[4.5rem] min-w-[8.5rem] flex-col justify-center rounded-xl border-2 p-3 shadow-xl ${selected ? "border-cyan-400 bg-slate-900 text-white ring-2 ring-cyan-400/40" : "border-slate-700 bg-slate-950 text-slate-200"}`}>
    <Handle type="target" position={Position.Left} className="!bg-cyan-400 !w-2 !h-2" />
    <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-400">{data.typeLabel || "LOGIC"}</div>
    <div className="mt-1 font-mono text-xs font-bold text-white">{data.label}</div>
    {data.detail && <div className="mt-1 text-[10px] text-slate-400">{data.detail}</div>}
    <Handle type="source" position={Position.Right} className="!bg-cyan-400 !w-2 !h-2" />
  </div>
));
LogicBlockNode.displayName = "LogicBlockNode";

function normalizeGraph(graph) {
  const maybeGraph = graph?.rtl_graph || graph?.graph || graph?.diagram || graph?.schematic || graph;
  const nodes = Array.isArray(maybeGraph?.nodes) ? maybeGraph.nodes : [];
  const edges = Array.isArray(maybeGraph?.edges) ? maybeGraph.edges : [];
  return { nodes, edges };
}

function RTLDiagramContent({ graph, fullscreen, setFullscreen }) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const { nodes, edges } = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = normalizeGraph(graph);
    if (!rawNodes.length) return { nodes: [], edges: [] };

    const normalizedNodes = rawNodes.map((node, index) => {
      const ntype = (node.type || "").toLowerCase();
      let reactFlowType = "logic";

      if (ntype === "input") reactFlowType = "inputPort";
      else if (ntype === "output") reactFlowType = "outputPort";
      else if (ntype === "and" || ntype === "nand") reactFlowType = "andGate";
      else if (ntype === "or" || ntype === "nor") reactFlowType = "orGate";
      else if (ntype === "xor" || ntype === "xnor") reactFlowType = "xorGate";
      else if (ntype === "not") reactFlowType = "notGate";
      else if (ntype === "mux") reactFlowType = "muxGate";
      else if (ntype === "dff") reactFlowType = "dffGate";

      return {
        id: String(node.id ?? index),
        data: {
          label: node.label || node.id || `Block ${index + 1}`,
          detail: node.description || node.type || "RTL node",
          typeLabel: String(node.type || "LOGIC").toUpperCase(),
        },
        position: node.position || {
          x: (index % 4) * 240,
          y: Math.floor(index / 4) * 140,
        },
        type: reactFlowType,
      };
    });

    const normalizedEdges = rawEdges.map((edge, index) => ({
      id: `e-${index}`,
      source: String(edge.source),
      target: String(edge.target),
      type: "smoothstep",
      animated: false,
      label: edge.label || "",
      style: { stroke: "#22d3ee", strokeWidth: 2 },
      markerEnd: {
        type: "arrowclosed",
        color: "#22d3ee",
      },
    }));

    return { nodes: normalizedNodes, edges: normalizedEdges };
  }, [graph]);

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 300 });
      }, 50);
    }
  }, [nodes, fitView]);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  );

  const nodeTypes = useMemo(
    () => ({
      inputPort: InputPortNode,
      outputPort: OutputPortNode,
      andGate: AndGateNode,
      orGate: OrGateNode,
      xorGate: XorGateNode,
      notGate: NotGateNode,
      muxGate: MuxNode,
      dffGate: DffNode,
      logic: LogicBlockNode,
    }),
    []
  );

  if (!nodes.length) {
    return (
      <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-8 text-center">
        <p className="text-sm text-slate-400">No diagram nodes found yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">RTL Digital Logic Block Diagram</h2>
            <p className="mt-1 text-sm text-slate-400">
              Interactive DAG logic graph extracted deterministically from your RTL.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="!px-3 !py-1.5 !text-xs" onClick={() => zoomIn()}>
              <ZoomIn size={14} />
            </Button>
            <Button variant="secondary" className="!px-3 !py-1.5 !text-xs" onClick={() => zoomOut()}>
              <ZoomOut size={14} />
            </Button>
            <Button variant="secondary" className="!px-3 !py-1.5 !text-xs" onClick={() => fitView({ padding: 0.25, duration: 300 })}>
              <RefreshCw size={14} />
              Fit View
            </Button>
            <Button
              variant="secondary"
              className="!px-3 !py-1.5 !text-xs"
              onClick={() => setFullscreen((value) => !value)}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {fullscreen ? "Exit" : "Fullscreen"}
            </Button>
          </div>
        </div>

        <div className="h-[600px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            minZoom={0.3}
            maxZoom={2.0}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            attributionPosition="bottom-left"
          >
            <Background variant="dots" gap={18} size={1} color="#334155" />
            <MiniMap
              nodeColor={(n) => (n.selected ? "#22d3ee" : "#64748b")}
              pannable
              zoomable
              style={{ background: "#020617" }}
              maskColor="rgba(2, 6, 23, 0.7)"
            />
            <Controls showInteractive={true} />
          </ReactFlow>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Graph Summary</p>
          <h3 className="mt-3 text-xl font-semibold text-white">RTL Logic Topology</h3>
          <div className="mt-5 grid gap-3">
            <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
              Gate & Port Nodes: <span className="font-semibold text-cyan-300">{nodes.length}</span>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
              Wire Connections: <span className="font-semibold text-cyan-300">{edges.length}</span>
            </div>
            <div className="rounded-2xl bg-slate-900/80 p-3 text-sm text-slate-300">
              Wire Style: <span className="font-semibold text-cyan-300">Solid 2px cyan with directional arrows</span>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Selected Gate / Block</p>
          <h4 className="mt-3 text-lg font-semibold text-white">
            {selectedNode?.data?.label || "No element selected"}
          </h4>
          <p className="mt-2 text-sm text-slate-400">
            {selectedNode?.data?.detail || "Click any logic gate or port node to inspect details."}
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function RTLDiagram({ graph }) {
  const [fullscreen, setFullscreen] = useState(false);

  const canvas = (
    <ReactFlowProvider>
      <RTLDiagramContent graph={graph} fullscreen={fullscreen} setFullscreen={setFullscreen} />
    </ReactFlowProvider>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 p-6">
        {canvas}
      </div>
    );
  }

  return <Card className="!p-6">{canvas}</Card>;
}
