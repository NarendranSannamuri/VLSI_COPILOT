import re
import html
from backend.services.rtl_graph import RTLGraph

def _safe_id(text):
    plain = re.sub(r"[^A-Za-z0-9_]", "_", str(text))
    return plain if plain and not plain[0].isdigit() else f"n_{plain}"

def build_rtl_graph(parsed):
    """
    Builds the RTL graph using the unified RTLGraph class
    and outputs the React Flow compatible structure.
    """
    g = RTLGraph(parsed)
    nodes_payload = []
    edges_payload = []

    # Map nodes
    for nid, node in g.nodes.items():
        # Map node type to match React Flow component expectations
        ntype = node.get("type")
        gate_type = (node.get("gate_type") or "gate").lower()

        if ntype == "input":
            react_flow_type = "input"
        elif ntype == "output":
            react_flow_type = "output"
        else:
            react_flow_type = gate_type

        nodes_payload.append({
            "id": nid,
            "type": react_flow_type,
            "label": node.get("label") or nid,
            "description": f"{gate_type.upper()} gate" if ntype == "gate" else f"{ntype.capitalize()} signal",
            "position": {
                "x": node.get("x", 50),
                "y": node.get("y", 50)
            },
            "output": node.get("outputs")[0] if node.get("outputs") else nid
        })

    # Map edges
    edge_seen = set()
    for nid, node in g.nodes.items():
        for idx, inp_id in enumerate(node.get("inputs", [])):
            if inp_id not in g.nodes:
                continue
            edge_id = f"e_{inp_id}_{nid}"
            if edge_id not in edge_seen:
                edge_seen.add(edge_id)
                edges_payload.append({
                    "id": edge_id,
                    "source": inp_id,
                    "target": nid
                })

    return {
        "nodes": nodes_payload,
        "edges": edges_payload
    }

def build_mermaid_diagram(parsed, graph=None):
    """Generates Mermaid flowchart string from the unified graph."""
    if not graph:
        graph = build_rtl_graph(parsed)

    module_name = (parsed.get("module_name") or "rtl").replace(" ", "_")
    lines = ["flowchart LR", f"  subgraph {module_name}[{module_name}]"]
    node_ids = {}

    for index, node in enumerate(graph.get("nodes", [])):
        node_id = _safe_id(node.get("id") or f"node_{index}")
        node_ids[node.get("id") or f"node_{index}"] = node_id
        label = node.get("label") or node.get("id") or f"node_{index}"
        ntype = node.get("type")
        if ntype == "input":
            lines.append(f"    {node_id}([{label}])")
        elif ntype == "output":
            lines.append(f"    {node_id}(({label}))")
        elif ntype == "dff":
            lines.append(f"    {node_id}[/{label}\\]")
        else:
            lines.append(f"    {node_id}[{label}]")

    for edge in graph.get("edges", []):
        source = node_ids.get(edge.get("source")) or _safe_id(edge.get("source"))
        target = node_ids.get(edge.get("target")) or _safe_id(edge.get("target"))
        label = edge.get("label")
        if label:
            lines.append(f"    {source} -- {label} --> {target}")
        else:
            lines.append(f"    {source} --> {target}")

    lines.append("  end")
    return "\n".join(lines)

def build_svg_diagram(parsed, graph=None):
    """Generates a high-quality dark themed vector SVG using the unified RTLGraph."""
    g = RTLGraph(parsed)
    return g.generate_schematic_diagram(theme="dark").to_svg()

def build_diagram_payload(parsed):
    """Constructs the unified payload for diagram and schematic views."""
    graph = build_rtl_graph(parsed)
    return {
        "rtl_graph": graph,
        "parsed_data": parsed,
        "mermaid": build_mermaid_diagram(parsed, graph),
        "svg": build_svg_diagram(parsed, graph)
    }
