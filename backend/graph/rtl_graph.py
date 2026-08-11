import html
import re


def _safe_id(text):
    plain = re.sub(r"[^A-Za-z0-9_]", "_", str(text))
    return plain if plain and not plain[0].isdigit() else f"n_{plain}"


def calculate_node_positions(nodes, edges):
    """
    Computes topological depths for a DAG of logic gates and ports.
    Inputs -> Depth 0
    Gate Depth = 1 + max(input driver depths)
    Outputs -> Depth = 1 + max(gate depths)
    """
    node_map = {n["id"]: n for n in nodes}
    in_edges = {n["id"]: [] for n in nodes}

    for e in edges:
        src = e.get("source")
        tgt = e.get("target")
        if tgt in in_edges:
            in_edges[tgt].append(src)

    depths = {}
    for n in nodes:
        if n.get("type") == "input":
            depths[n["id"]] = 0

    changed = True
    passes = 0
    max_passes = len(nodes) + 5

    while changed and passes < max_passes:
        changed = False
        passes += 1
        for n in nodes:
            nid = n["id"]
            if n.get("type") == "input":
                continue
            preds = [p for p in in_edges[nid] if p in depths]
            if preds:
                new_d = 1 + max(depths[p] for p in preds)
                if depths.get(nid) != new_d:
                    depths[nid] = new_d
                    changed = True
            elif nid not in depths:
                depths[nid] = 1

    max_gate_depth = max([depths[nid] for nid, n in node_map.items() if n.get("type") != "output"] or [0])
    for n in nodes:
        nid = n["id"]
        if n.get("type") == "output":
            depths[nid] = max_gate_depth + 1

    # Group nodes by depth column
    depth_groups = {}
    for n in nodes:
        nid = n["id"]
        d = depths.get(nid, 1)
        n["rank_x"] = d
        depth_groups.setdefault(d, []).append(n)

    # Calculate coordinates
    h_spacing = 220
    v_spacing = 110

    for d, col_nodes in depth_groups.items():
        for idx, node in enumerate(col_nodes):
            node["position"] = {
                "x": 50 + d * h_spacing,
                "y": 40 + idx * v_spacing,
            }


def build_rtl_graph(parsed):
    nodes = []
    edges = []
    node_id_counter = 1

    inputs = list(parsed.get("inputs", []))
    outputs = list(parsed.get("outputs", []))
    parsed_assigns = parsed.get("parsed_assigns", [])
    always_blocks = parsed.get("always_blocks", [])

    # 1. Primary Input Nodes
    for inp in inputs:
        nodes.append({
            "id": inp,
            "type": "input",
            "label": inp,
            "description": f"Input signal {inp}",
        })

    # 2. Primary Output Nodes
    for out in outputs:
        nodes.append({
            "id": out,
            "type": "output",
            "label": out,
            "description": f"Output signal {out}",
        })

    # Helper function to parse AST expression into gate nodes & edges
    def build_ast_nodes(ast, target_signal=None):
        nonlocal node_id_counter
        if not ast:
            return None

        node_type = ast.get("type")

        if node_type == "SIGNAL":
            sig_name = ast.get("name")
            return sig_name

        gate_id = f"{node_type}_{node_id_counter}"
        node_id_counter += 1

        if node_type in ("AND", "OR", "XOR", "NAND", "NOR", "XNOR"):
            left_src = build_ast_nodes(ast.get("left"))
            right_src = build_ast_nodes(ast.get("right"))

            label = node_type
            description = f"{label} gate" + (f" for {target_signal}" if target_signal else "")

            nodes.append({
                "id": gate_id,
                "type": node_type.lower(),
                "label": label,
                "description": description,
                "output": target_signal or gate_id,
            })

            if left_src:
                edges.append({"id": f"e_{left_src}_{gate_id}", "source": left_src, "target": gate_id})
            if right_src:
                edges.append({"id": f"e_{right_src}_{gate_id}", "source": right_src, "target": gate_id})

            return gate_id

        elif node_type == "NOT":
            child_src = build_ast_nodes(ast.get("operand"))
            description = "Inverter" + (f" for {target_signal}" if target_signal else "")

            nodes.append({
                "id": gate_id,
                "type": "not",
                "label": "NOT",
                "description": description,
                "output": target_signal or gate_id,
            })

            if child_src:
                edges.append({"id": f"e_{child_src}_{gate_id}", "source": child_src, "target": gate_id})

            return gate_id

        elif node_type == "MUX":
            sel_src = build_ast_nodes(ast.get("sel"))
            in1_src = build_ast_nodes(ast.get("in1"))
            in0_src = build_ast_nodes(ast.get("in0"))

            nodes.append({
                "id": gate_id,
                "type": "mux",
                "label": "2:1 MUX",
                "description": f"Multiplexer driving {target_signal or gate_id}",
                "output": target_signal or gate_id,
            })

            if sel_src:
                edges.append({"id": f"e_{sel_src}_{gate_id}", "source": sel_src, "target": gate_id, "label": "sel"})
            if in1_src:
                edges.append({"id": f"e_{in1_src}_{gate_id}", "source": in1_src, "target": gate_id, "label": "in1"})
            if in0_src:
                edges.append({"id": f"e_{in0_src}_{gate_id}", "source": in0_src, "target": gate_id, "label": "in0"})

            return gate_id

        return None

    # Process AST Assigns
    for item in parsed_assigns:
        target = item["target"]
        ast = item.get("ast")

        if ast:
            top_gate_id = build_ast_nodes(ast, target_signal=target)
            if top_gate_id and target in outputs:
                edges.append({"id": f"e_{top_gate_id}_{target}", "source": top_gate_id, "target": target})
        else:
            expr = item.get("raw_expression", "")
            gate_type = "AND" if "&" in expr else "OR" if "|" in expr else "XOR" if "^" in expr else "NOT" if "~" in expr else "LOGIC"
            gate_id = f"{gate_type}_{node_id_counter}"
            node_id_counter += 1

            nodes.append({
                "id": gate_id,
                "type": gate_type.lower(),
                "label": gate_type,
                "description": f"Logic driving {target}",
                "output": target,
            })

            signals = re.findall(r"[A-Za-z_]\w*", expr)
            for sig in set(signals):
                if sig != target and (sig in inputs or sig in outputs or sig in parsed.get("wires", [])):
                    edges.append({"id": f"e_{sig}_{gate_id}", "source": sig, "target": gate_id})
            if target in outputs:
                edges.append({"id": f"e_{gate_id}_{target}", "source": gate_id, "target": target})

    # Process Always / Sequential Blocks (FSM & DFFs)
    for blk in always_blocks:
        clk = blk.get("clk", "clk")
        rst = blk.get("rst", "rst")
        targets = blk.get("targets", [])
        is_fsm = blk.get("is_fsm", False)

        if is_fsm:
            next_state_id = f"Next_State_Logic_{node_id_counter}"
            state_reg_id = f"State_Register_{node_id_counter}"
            output_logic_id = f"Output_Logic_{node_id_counter}"
            node_id_counter += 1

            nodes.append({
                "id": next_state_id,
                "type": "next_state",
                "label": "Next State Logic",
                "description": "Combinational Next-State Decoder",
            })

            nodes.append({
                "id": state_reg_id,
                "type": "dff",
                "label": "State Register (DFF)",
                "description": f"Sequential State Register ({clk}, {rst})",
            })

            nodes.append({
                "id": output_logic_id,
                "type": "output_logic",
                "label": "Output Logic",
                "description": "FSM Output Decoder",
            })

            for inp in inputs:
                if inp not in (clk, rst):
                    edges.append({"id": f"e_{inp}_{next_state_id}", "source": inp, "target": next_state_id})

            if clk in inputs or clk in nodes:
                edges.append({"id": f"e_{clk}_{state_reg_id}", "source": clk, "target": state_reg_id, "label": "CLK"})
            if rst in inputs or rst in nodes:
                edges.append({"id": f"e_{rst}_{state_reg_id}", "source": rst, "target": state_reg_id, "label": "RST"})

            edges.append({"id": f"e_{next_state_id}_{state_reg_id}", "source": next_state_id, "target": state_reg_id, "label": "next_state"})
            edges.append({"id": f"e_{state_reg_id}_{output_logic_id}", "source": state_reg_id, "target": output_logic_id, "label": "state"})
            edges.append({"id": f"e_{state_reg_id}_{next_state_id}", "source": state_reg_id, "target": next_state_id, "label": "state_fb"})

            for out in outputs:
                edges.append({"id": f"e_{output_logic_id}_{out}", "source": output_logic_id, "target": out})

        else:
            for tgt in targets:
                dff_id = f"DFF_{tgt}_{node_id_counter}"
                node_id_counter += 1

                nodes.append({
                    "id": dff_id,
                    "type": "dff",
                    "label": f"DFF ({tgt})",
                    "description": f"DFF driving {tgt}",
                })

                if clk in inputs or clk in nodes:
                    edges.append({"id": f"e_{clk}_{dff_id}", "source": clk, "target": dff_id, "label": "CLK"})
                if rst in inputs or rst in nodes:
                    edges.append({"id": f"e_{rst}_{dff_id}", "source": rst, "target": dff_id, "label": "RST"})

                for inp in inputs:
                    if inp not in (clk, rst):
                        edges.append({"id": f"e_{inp}_{dff_id}", "source": inp, "target": dff_id})

                if tgt in outputs:
                    edges.append({"id": f"e_{dff_id}_{tgt}", "source": dff_id, "target": tgt})

    # Calculate exact DAG coordinates
    calculate_node_positions(nodes, edges)

    return {
        "nodes": nodes,
        "edges": edges,
    }


def build_mermaid_diagram(parsed, graph=None):
    graph = graph or build_rtl_graph(parsed)
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
    """
    Renders vector SVG schematic with dynamic bounding box calculation.
    Uses solid 2px cyan wires with arrowheads and distinct gate silhouettes.
    """
    graph = graph or build_rtl_graph(parsed)
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])

    if not nodes:
        return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><text x="20" y="30" fill="#fff">Empty graph</text></svg>'

    positions = {}
    xs = []
    ys = []

    for node in nodes:
        pos = node.get("position", {"x": 50, "y": 50})
        x, y = pos["x"], pos["y"]
        positions[node["id"]] = (x, y)
        xs.append(x)
        ys.append(y)

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    padding = 60
    view_min_x = max(0, min_x - padding)
    view_min_y = max(0, min_y - padding)
    view_width = max(450, (max_x - min_x) + padding * 3)
    view_height = max(260, (max_y - min_y) + padding * 2)

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{view_width}" height="{view_height}" viewBox="{view_min_x} {view_min_y} {view_width} {view_height}" style="background-color: #020617; font-family: ui-monospace, monospace;">',
        '<defs>',
        '  <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">',
        '    <path d="M0,0 L0,8 L8,4 z" fill="#22d3ee" />',
        '  </marker>',
        '  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">',
        '    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" stroke-width="0.5"/>',
        '  </pattern>',
        '</defs>',
        '<rect width="100%" height="100%" fill="url(#grid)" />',
        f'<text x="{view_min_x + 20}" y="{view_min_y + 24}" fill="#38bdf8" font-size="13" font-weight="bold">RTL SCHEMATIC — {html.escape(parsed.get("module_name", "MODULE"))}</text>',
        '<g>',
    ]

    # Draw Solid Wires
    for edge in edges:
        src_pos = positions.get(edge.get("source"))
        tgt_pos = positions.get(edge.get("target"))
        if src_pos and tgt_pos:
            x1, y1 = src_pos
            x2, y2 = tgt_pos
            mid_x = (x1 + x2) / 2
            edge_label = html.escape(str(edge.get("label") or ""))

            parts.append(
                f'<path d="M {x1+40} {y1+18} C {mid_x} {y1+18}, {mid_x} {y2+18}, {x2-30} {y2+18}" '
                f'fill="none" stroke="#22d3ee" stroke-width="2" marker-end="url(#arrow)" />'
            )
            if edge_label:
                parts.append(
                    f'<text x="{mid_x}" y="{(y1+y2)/2 + 12}" text-anchor="middle" fill="#94a3b8" font-size="9">{edge_label}</text>'
                )

    # Draw Gate Nodes with distinct shapes
    for node in nodes:
        pos = positions[node["id"]]
        x, y = pos[0], pos[1]
        ntype = node.get("type", "logic")
        label = html.escape(str(node.get("label") or node["id"]))

        if ntype == "input":
            parts.append(f'<polygon points="{x-25},{y} {x+25},{y} {x+35},{y+16} {x+25},{y+32} {x-25},{y+32}" fill="#0f2b3c" stroke="#38bdf8" stroke-width="2"/>')
            parts.append(f'<text x="{x+2}" y="{y+20}" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="bold">{label}</text>')
        elif ntype == "output":
            parts.append(f'<polygon points="{x-25},{y} {x+25},{y} {x+35},{y+16} {x+25},{y+32} {x-25},{y+32}" fill="#064e3b" stroke="#34d399" stroke-width="2"/>')
            parts.append(f'<text x="{x+2}" y="{y+20}" text-anchor="middle" fill="#e2e8f0" font-size="10" font-weight="bold">{label}</text>')
        elif ntype in ("and", "nand"):
            parts.append(f'<rect x="{x-25}" y="{y}" width="50" height="34" rx="4" fill="#1e1b4b" stroke="#818cf8" stroke-width="2"/>')
            parts.append(f'<text x="{x}" y="{y+21}" text-anchor="middle" fill="#e0e7ff" font-size="11" font-weight="bold">{label}</text>')
        elif ntype in ("or", "nor", "xor", "xnor"):
            parts.append(f'<rect x="{x-25}" y="{y}" width="50" height="34" rx="12" fill="#311042" stroke="#c084fc" stroke-width="2"/>')
            parts.append(f'<text x="{x}" y="{y+21}" text-anchor="middle" fill="#f3e8ff" font-size="11" font-weight="bold">{label}</text>')
        elif ntype == "dff":
            parts.append(f'<rect x="{x-35}" y="{y-6}" width="70" height="48" rx="6" fill="#172554" stroke="#60a5fa" stroke-width="2"/>')
            parts.append(f'<path d="M {x-35} {y+28} L {x-26} {y+33} L {x-35} {y+38}" fill="none" stroke="#60a5fa" stroke-width="1.5"/>')
            parts.append(f'<text x="{x}" y="{y+16}" text-anchor="middle" fill="#dbeafe" font-size="10" font-weight="bold">{label}</text>')
        elif ntype == "mux":
            parts.append(f'<polygon points="{x-25},{y-4} {x+25},{y+4} {x+18},{y+34} {x-18},{y+34}" fill="#422006" stroke="#fb923c" stroke-width="2"/>')
            parts.append(f'<text x="{x}" y="{y+19}" text-anchor="middle" fill="#fef3c7" font-size="10" font-weight="bold">MUX</text>')
        else:
            parts.append(f'<rect x="{x-35}" y="{y}" width="70" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>')
            parts.append(f'<text x="{x}" y="{y+22}" text-anchor="middle" fill="#e2e8f0" font-size="10">{label}</text>')

    parts.append('</g></svg>')
    return "".join(parts)


def build_diagram_payload(parsed):
    graph = build_rtl_graph(parsed)
    return {
        "rtl_graph": graph,
        "parsed_data": parsed,
        "mermaid": build_mermaid_diagram(parsed, graph),
        "svg": build_svg_diagram(parsed, graph),
    }
