import re
from reportlab.graphics.shapes import Drawing, Rect, Circle, Line, String, Group, Path
from reportlab.lib import colors

class MiniCanvas:
    """
    A lightweight drawing abstraction that can export both HTML/SVG and ReportLab Drawing.
    Uses top-down SVG coordinates (y=0 at top) and automatically handles
    y-axis inversion for ReportLab (y=0 at bottom).
    """
    def __init__(self, width, height, theme="dark"):
        self.width = width
        self.height = height
        self.theme = theme
        self.shapes = []

        # Color palette depending on theme
        if theme == "dark":
            self.colors = {
                "background": "none",
                "wire": "#94a3b8",          # Slate 400
                "wire_label": "#38bdf8",    # Sky 400
                "text": "#f8fafc",          # Slate 50
                "gate_fill": "#1e293b",     # Slate 800
                "gate_stroke": "#38bdf8",   # Sky 400
                "port_circle": "#38bdf8"    # Sky 400
            }
        else:  # light theme for PDF
            self.colors = {
                "background": "none",
                "wire": "#475569",          # Slate 600
                "wire_label": "#0284c7",    # Sky 600
                "text": "#0f172a",          # Slate 900
                "gate_fill": "#f1f5f9",     # Slate 100
                "gate_stroke": "#0284c7",   # Sky 600
                "port_circle": "#0284c7"    # Sky 600
            }

    def draw_rect(self, x, y, w, h, fill=None, stroke=None, stroke_width=1, rx=0, ry=0):
        self.shapes.append({
            "type": "rect",
            "x": x, "y": y, "w": w, "h": h,
            "fill": fill or self.colors["gate_fill"],
            "stroke": stroke or self.colors["gate_stroke"],
            "stroke_width": stroke_width,
            "rx": rx, "ry": ry
        })

    def draw_circle(self, cx, cy, r, fill=None, stroke=None, stroke_width=0):
        self.shapes.append({
            "type": "circle",
            "cx": cx, "cy": cy, "r": r,
            "fill": fill or self.colors["port_circle"],
            "stroke": stroke or "none",
            "stroke_width": stroke_width
        })

    def draw_line(self, x1, y1, x2, y2, stroke=None, stroke_width=1.5):
        self.shapes.append({
            "type": "line",
            "x1": x1, "y1": y1, "x2": x2, "y2": y2,
            "stroke": stroke or self.colors["wire"],
            "stroke_width": stroke_width
        })

    def draw_text(self, x, y, text, font_size=10, text_anchor="middle", color=None, font_weight="normal"):
        self.shapes.append({
            "type": "text",
            "x": x, "y": y, "text": text,
            "font_size": font_size, "text_anchor": text_anchor,
            "color": color or self.colors["text"],
            "font_weight": font_weight
        })

    def draw_path(self, path_commands, fill=None, stroke=None, stroke_width=1.5):
        self.shapes.append({
            "type": "path",
            "commands": path_commands,
            "fill": fill or "none",
            "stroke": stroke or self.colors["wire"],
            "stroke_width": stroke_width
        })

    def to_svg(self):
        """Generates clean, responsive, and compact SVG string."""
        svg_parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.width} {self.height}" width="100%" height="100%" style="background-color: transparent; max-height: {self.height}px;">'
        ]

        for s in self.shapes:
            if s["type"] == "rect":
                svg_parts.append(
                    f'<rect x="{s["x"]}" y="{s["y"]}" width="{s["w"]}" height="{s["h"]}" fill="{s["fill"]}" stroke="{s["stroke"]}" stroke-width="{s["stroke_width"]}" rx="{s["rx"]}" ry="{s["ry"]}"/>'
                )
            elif s["type"] == "circle":
                svg_parts.append(
                    f'<circle cx="{s["cx"]}" cy="{s["cy"]}" r="{s["r"]}" fill="{s["fill"]}" stroke="{s["stroke"]}" stroke-width="{s["stroke_width"]}"/>'
                )
            elif s["type"] == "line":
                svg_parts.append(
                    f'<line x1="{s["x1"]}" y1="{s["y1"]}" x2="{s["x2"]}" y2="{s["y2"]}" stroke="{s["stroke"]}" stroke-width="{s["stroke_width"]}"/>'
                )
            elif s["type"] == "text":
                # Convert anchor to SVG text-anchor
                anchor = s["text_anchor"]
                if anchor == "left": anchor = "start"
                elif anchor == "right": anchor = "end"

                svg_parts.append(
                    f'<text x="{s["x"]}" y="{s["y"]}" font-size="{s["font_size"]}" fill="{s["color"]}" text-anchor="{anchor}" font-family="monospace, sans-serif" font-weight="{s["font_weight"]}">{s["text"]}</text>'
                )
            elif s["type"] == "path":
                d_parts = []
                for cmd in s["commands"]:
                    if cmd[0] == 'M':
                        d_parts.append(f"M {cmd[1]} {cmd[2]}")
                    elif cmd[0] == 'L':
                        d_parts.append(f"L {cmd[1]} {cmd[2]}")
                    elif cmd[0] == 'C':
                        d_parts.append(f"C {cmd[1]} {cmd[2]} {cmd[3]} {cmd[4]} {cmd[5]} {cmd[6]}")
                    elif cmd[0] == 'Z':
                        d_parts.append("Z")
                d_str = " ".join(d_parts)
                svg_parts.append(
                    f'<path d="{d_str}" fill="{s["fill"]}" stroke="{s["stroke"]}" stroke-width="{s["stroke_width"]}"/>'
                )

        svg_parts.append('</svg>')
        return "\n".join(svg_parts)

    def to_reportlab(self):
        """Generates ReportLab Drawing object with inverted coordinates."""
        d = Drawing(self.width, self.height)
        h_total = self.height

        def to_color(col_str):
            if col_str is None or col_str == "none" or col_str == "None":
                return None
            try:
                return colors.HexColor(col_str)
            except Exception:
                if hasattr(colors, col_str):
                    return getattr(colors, col_str)
                return colors.black

        for s in self.shapes:
            if s["type"] == "rect":
                y_rl = h_total - s["y"] - s["h"]
                r = Rect(
                    s["x"], y_rl, s["w"], s["h"],
                    fillColor=to_color(s["fill"]),
                    strokeColor=to_color(s["stroke"]),
                    strokeWidth=s["stroke_width"],
                    rx=s["rx"], ry=s["ry"]
                )
                d.add(r)
            elif s["type"] == "circle":
                y_rl = h_total - s["cy"]
                c = Circle(
                    s["cx"], y_rl, s["r"],
                    fillColor=to_color(s["fill"]),
                    strokeColor=to_color(s["stroke"]),
                    strokeWidth=s["stroke_width"]
                )
                d.add(c)
            elif s["type"] == "line":
                y1_rl = h_total - s["y1"]
                y2_rl = h_total - s["y2"]
                li = Line(
                    s["x1"], y1_rl, s["x2"], y2_rl,
                    strokeColor=to_color(s["stroke"]),
                    strokeWidth=s["stroke_width"]
                )
                d.add(li)
            elif s["type"] == "text":
                y_rl = h_total - s["y"]
                # ReportLab textAnchors: 'start', 'middle', 'end'
                anchor = s["text_anchor"]
                if anchor == "left": anchor = "start"
                elif anchor == "right": anchor = "end"

                font_name = "Helvetica-Bold" if s["font_weight"] == "bold" else "Helvetica"
                st = String(
                    s["x"], y_rl, s["text"],
                    fontSize=s["font_size"],
                    fontName=font_name,
                    textAnchor=anchor,
                    fillColor=to_color(s["color"])
                )
                d.add(st)
            elif s["type"] == "path":
                p = Path(
                    fillColor=to_color(s["fill"]),
                    strokeColor=to_color(s["stroke"]),
                    strokeWidth=s["stroke_width"]
                )
                for cmd in s["commands"]:
                    if cmd[0] == 'M':
                        p.moveTo(cmd[1], h_total - cmd[2])
                    elif cmd[0] == 'L':
                        p.lineTo(cmd[1], h_total - cmd[2])
                    elif cmd[0] == 'C':
                        p.curveTo(cmd[1], h_total - cmd[2], cmd[3], h_total - cmd[4], cmd[5], h_total - cmd[6])
                    elif cmd[0] == 'Z':
                        p.closePath()
                d.add(p)

        return d

class RTLGraph:
    """
    Parses inputs, outputs, and assignments into a shared graph structure,
    computes deterministic left-to-right topological positions, and draws
    clean, compact Block and Schematic Diagrams.
    """
    def __init__(self, parsed_data):
        self.module_name = parsed_data.get("module_name") or "RTL_Module"
        self.inputs = list(parsed_data.get("inputs") or [])
        self.outputs = list(parsed_data.get("outputs") or [])
        self.raw_assignments = list(parsed_data.get("assignments") or [])
        self.parsed_data = parsed_data

        # Build the graph representation
        self.nodes = {}
        self._build_graph()
        self.rank = {}
        self._compute_layout()

    def _add_fallback_gate(self, lhs, rhs, assigned_targets):
        gate_type = "BUF"
        label = "="
        if "?" in rhs and ":" in rhs:
            gate_type = "MUX"
            label = "MUX"
        elif "~&" in rhs:
            gate_type = "NAND"
            label = "~&"
        elif "~|" in rhs:
            gate_type = "NOR"
            label = "~|"
        elif "~^" in rhs or "^~" in rhs:
            gate_type = "XNOR"
            label = "~^"
        elif "&" in rhs:
            gate_type = "AND"
            label = "&"
        elif "|" in rhs:
            gate_type = "OR"
            label = "|"
        elif "^" in rhs:
            gate_type = "XOR"
            label = "^"
        elif "~" in rhs:
            gate_type = "NOT"
            label = "~"

        node_id = f"gate_{lhs}"
        tokens = re.findall(r"\b[a-zA-Z_]\w*\b", rhs)
        KEYWORDS = {"assign", "wire", "reg", "input", "output", "module", "endmodule", "always", "begin", "end", "case", "endcase", "if", "else", "parameter", "localparam"}

        node_inputs = []
        for t in tokens:
            if t not in KEYWORDS and t != lhs:
                if t in self.inputs:
                    node_inputs.append(f"in_{t}")
                elif t in assigned_targets or f"gate_{t}" in self.nodes:
                    node_inputs.append(f"gate_{t}")
                else:
                    node_inputs.append(f"in_{t}")

        self.nodes[node_id] = {
            "id": node_id,
            "type": "gate",
            "gate_type": gate_type,
            "label": label,
            "inputs": list(set(node_inputs)),
            "outputs": [lhs]
        }
        assigned_targets.add(lhs)
        if lhs in self.outputs:
            self.nodes[f"out_{lhs}"]["inputs"] = [node_id]

    def _build_graph(self):
        # Store a unique counter for generating node IDs
        self.node_id_counter = 1

        # 1. Add input ports
        for inp in self.inputs:
            node_id = f"in_{inp}"
            self.nodes[node_id] = {
                "id": node_id,
                "type": "input",
                "label": inp,
                "inputs": [],
                "outputs": [inp]
            }

        # 2. Add output ports
        for out in self.outputs:
            node_id = f"out_{out}"
            self.nodes[node_id] = {
                "id": node_id,
                "type": "output",
                "label": out,
                "inputs": [],
                "outputs": []
            }

        # Helper function to recursively parse AST expression into gate nodes & edges
        def build_ast_nodes(ast, target_signal=None):
            if not ast:
                return None

            node_type = ast.get("type")

            if node_type == "SIGNAL":
                sig_name = ast.get("name")
                # Check if it's a primary input
                if sig_name in self.inputs:
                    return f"in_{sig_name}"
                # Check if it's already driven by a gate or sequential block
                possible_gate = f"gate_{sig_name}"
                if possible_gate in self.nodes:
                    return possible_gate
                # Check if it's a wire/signal that will be driven later, fallback to f"gate_{sig_name}"
                return possible_gate

            # Create gate ID
            if target_signal and target_signal in self.outputs:
                gate_id = f"gate_{target_signal}"
            else:
                gate_id = f"gate_{node_type}_{self.node_id_counter}"
                self.node_id_counter += 1

            if node_type in ("AND", "OR", "XOR", "NAND", "NOR", "XNOR"):
                left_src = build_ast_nodes(ast.get("left"))
                right_src = build_ast_nodes(ast.get("right"))

                label = ast.get("op", node_type)
                self.nodes[gate_id] = {
                    "id": gate_id,
                    "type": "gate",
                    "gate_type": node_type,
                    "label": label,
                    "inputs": [x for x in [left_src, right_src] if x],
                    "outputs": [target_signal] if target_signal else [gate_id]
                }
                return gate_id

            elif node_type == "NOT":
                child_src = build_ast_nodes(ast.get("operand"))

                self.nodes[gate_id] = {
                    "id": gate_id,
                    "type": "gate",
                    "gate_type": "NOT",
                    "label": "~",
                    "inputs": [child_src] if child_src else [],
                    "outputs": [target_signal] if target_signal else [gate_id]
                }
                return gate_id

            elif node_type == "MUX":
                sel_src = build_ast_nodes(ast.get("sel"))
                in1_src = build_ast_nodes(ast.get("in1"))
                in0_src = build_ast_nodes(ast.get("in0"))

                self.nodes[gate_id] = {
                    "id": gate_id,
                    "type": "gate",
                    "gate_type": "MUX",
                    "label": "MUX",
                    "inputs": [x for x in [sel_src, in1_src, in0_src] if x],
                    "outputs": [target_signal] if target_signal else [gate_id]
                }
                return gate_id

            return None

        # 3. Process AST / Continuous Assignments
        assigned_targets = set()
        parsed_assigns = self.parsed_data.get("parsed_assigns", [])

        # If we have parsed_assigns with AST, use recursive AST parser
        for item in parsed_assigns:
            target = item["target"]
            ast = item.get("ast")
            if ast:
                top_gate_id = build_ast_nodes(ast, target_signal=target)
                assigned_targets.add(target)
                # Link output port to top gate if target is output
                if target in self.outputs:
                    self.nodes[f"out_{target}"]["inputs"] = [top_gate_id]
            else:
                # Fallback simple continuous assign parser
                expr = item.get("raw_expression", "")
                self._add_fallback_gate(target, expr, assigned_targets)

        # If no parsed_assigns, fall back to raw assignments
        if not parsed_assigns and self.raw_assignments:
            for assign_str in self.raw_assignments:
                cleaned = assign_str.replace("assign", "").strip()
                if "=" not in cleaned:
                    continue
                parts = cleaned.split("=", 1)
                lhs = parts[0].strip()
                rhs = parts[1].strip()
                self._add_fallback_gate(lhs, rhs, assigned_targets)

        # 4. Process Always / Sequential Blocks (FSM & DFFs)
        always_blocks = self.parsed_data.get("always_blocks", [])
        for blk in always_blocks:
            clk = blk.get("clk", "clk")
            rst = blk.get("rst", "rst")
            targets = blk.get("targets", [])
            is_fsm = blk.get("is_fsm", False)
            body = blk.get("body", "")

            # Ensure clk and rst are declared as input ports if they aren't
            for sig in (clk, rst):
                if sig and sig not in self.inputs:
                    self.inputs.append(sig)
                    inp_id = f"in_{sig}"
                    if inp_id not in self.nodes:
                        self.nodes[inp_id] = {
                            "id": inp_id,
                            "type": "input",
                            "label": sig,
                            "inputs": [],
                            "outputs": [sig]
                        }

            clk_id = f"in_{clk}"
            rst_id = f"in_{rst}"

            if is_fsm:
                next_state_id = f"gate_Next_State_Logic_{self.node_id_counter}"
                state_reg_id = f"gate_State_Register_{self.node_id_counter}"
                output_logic_id = f"gate_Output_Logic_{self.node_id_counter}"
                self.node_id_counter += 1

                # Gather module input signals feeding Next State logic
                next_state_inputs = []
                for inp in self.inputs:
                    if inp not in (clk, rst):
                        next_state_inputs.append(f"in_{inp}")
                # Feedback from state register
                next_state_inputs.append(state_reg_id)

                self.nodes[next_state_id] = {
                    "id": next_state_id,
                    "type": "gate",
                    "gate_type": "next_state",
                    "label": "Next State Logic",
                    "inputs": next_state_inputs,
                    "outputs": ["next_state"]
                }

                self.nodes[state_reg_id] = {
                    "id": state_reg_id,
                    "type": "gate",
                    "gate_type": "DFF",
                    "label": "State Register",
                    "inputs": [clk_id, rst_id, next_state_id],
                    "outputs": ["state"]
                }

                self.nodes[output_logic_id] = {
                    "id": output_logic_id,
                    "type": "gate",
                    "gate_type": "output_logic",
                    "label": "Output Logic",
                    "inputs": [state_reg_id],
                    "outputs": targets
                }

                # Link always FSM targets to output ports
                for tgt in targets:
                    if tgt in self.outputs:
                        self.nodes[f"out_{tgt}"]["inputs"] = [output_logic_id]
            else:
                for tgt in targets:
                    dff_id = f"gate_{tgt}"

                    body_signals = re.findall(r"\b[a-zA-Z_]\w*\b", body)
                    inp_signals = []
                    for s in body_signals:
                        if s not in ("if", "else", "case", "endcase", "begin", "end", tgt, clk, rst):
                            if s in self.inputs:
                                inp_signals.append(f"in_{s}")
                            elif f"gate_{s}" in self.nodes:
                                inp_signals.append(f"gate_{s}")

                    self.nodes[dff_id] = {
                        "id": dff_id,
                        "type": "gate",
                        "gate_type": "DFF",
                        "label": f"DFF ({tgt})",
                        "inputs": [clk_id, rst_id] + list(set(inp_signals)),
                        "outputs": [tgt]
                    }

                    if tgt in self.outputs:
                        self.nodes[f"out_{tgt}"]["inputs"] = [dff_id]

        # 5. Fallback sequential logic representation if no gates or dffs are built
        has_logic = any(n["type"] == "gate" for n in self.nodes.values())
        if not has_logic and (self.inputs or self.outputs):
            core_id = "gate_core"
            self.nodes[core_id] = {
                "id": core_id,
                "type": "gate",
                "gate_type": "CORE",
                "label": "Sequential Logic Core",
                "inputs": [f"in_{inp}" for inp in self.inputs],
                "outputs": self.outputs
            }
            for out in self.outputs:
                self.nodes[f"out_{out}"]["inputs"] = [core_id]

    def _compute_layout(self):
        """Computes deterministic left-to-right topological rank and positions."""
        rank = {}

        # 1. Inputs get Rank 0
        input_ids = [nid for nid, n in self.nodes.items() if n["type"] == "input"]
        for iid in input_ids:
            rank[iid] = 0

        # 2. Gate nodes topological ranking
        gate_ids = [nid for nid, n in self.nodes.items() if n["type"] == "gate"]
        resolved = set(input_ids)

        for _ in range(len(gate_ids) + 1):
            progress = False
            for gid in gate_ids:
                if gid not in rank:
                    g_inputs = self.nodes[gid]["inputs"]
                    # If all inputs of this gate are resolved, compute its rank
                    if all(inp in resolved for inp in g_inputs):
                        if g_inputs:
                            rank[gid] = 1 + max(rank[inp] for inp in g_inputs)
                        else:
                            rank[gid] = 1
                        resolved.add(gid)
                        progress = True
            if not progress:
                # Handle unresolvable cycles or missing signals safely to guarantee complete output
                fallback_progress = False
                for gid in gate_ids:
                    if gid not in rank:
                        valid_ranks = [rank[inp] for inp in self.nodes[gid]["inputs"] if inp in rank]
                        rank[gid] = 1 + (max(valid_ranks) if valid_ranks else (max(rank.values()) if rank else 0))
                        resolved.add(gid)
                        fallback_progress = True
                if not fallback_progress:
                    break

        # 3. Outputs get Max Rank + 1
        max_gate_rank = max(rank.values()) if rank else 0
        output_ids = [nid for nid, n in self.nodes.items() if n["type"] == "output"]
        for oid in output_ids:
            rank[oid] = max_gate_rank + 1

        self.rank = rank

        # 4. Group by rank
        columns = {}
        for nid, r in rank.items():
            columns.setdefault(r, []).append(nid)

        # Sort columns and nodes alphabetically for perfect determinism
        sorted_ranks = sorted(columns.keys())
        max_nodes_any_col = max(len(columns[r]) for r in sorted_ranks) if sorted_ranks else 1

        # Dynamic canvas size calculations
        col_width = 160
        row_height = 80
        padding_x = 60
        padding_y = 50

        num_cols = len(sorted_ranks)
        canvas_width = max(280, 2 * padding_x + (num_cols - 1) * col_width)
        canvas_height = max(160, 2 * padding_y + (max_nodes_any_col - 1) * row_height)

        # Centered left-to-right alignment positions
        for r in sorted_ranks:
            col_nodes = sorted(columns[r])
            num_nodes = len(col_nodes)
            x = padding_x + r * col_width
            for i, nid in enumerate(col_nodes):
                node = self.nodes[nid]
                node["x"] = x
                node["y"] = canvas_height / 2 + (i - (num_nodes - 1) / 2) * row_height

        return canvas_width, canvas_height

    def generate_block_diagram(self, theme="dark"):
        """Draws a clean high-level module Block Diagram."""
        num_inputs = len(self.inputs)
        num_outputs = len(self.outputs)
        max_ports = max(num_inputs, num_outputs, 1)

        row_height = 30
        block_height = max(100, max_ports * row_height + 40)
        block_width = 180

        canvas_width = 420
        canvas_height = block_height + 60

        block_x = (canvas_width - block_width) / 2
        block_y = (canvas_height - block_height) / 2

        canvas = MiniCanvas(canvas_width, canvas_height, theme=theme)

        # 1. Central Module Block
        canvas.draw_rect(block_x, block_y, block_width, block_height, rx=8, ry=8)

        # Draw central module name text
        canvas.draw_text(
            canvas_width / 2, block_y + block_height / 2 + 4,
            self.module_name, font_size=12, font_weight="bold"
        )

        # 2. Draw Inputs (Left Ports)
        for i, inp_name in enumerate(self.inputs):
            y_port = block_y + block_height / 2 + (i - (num_inputs - 1) / 2) * row_height
            # Line from outside left to module block
            canvas.draw_line(20, y_port, block_x, y_port)
            # Input port label
            canvas.draw_text(25, y_port - 4, inp_name, font_size=10, text_anchor="left")
            # Port pin circle
            canvas.draw_circle(block_x, y_port, 3.5)

        # 3. Draw Outputs (Right Ports)
        for j, out_name in enumerate(self.outputs):
            y_port = block_y + block_height / 2 + (j - (num_outputs - 1) / 2) * row_height
            # Line from module block to outside right
            canvas.draw_line(block_x + block_width, y_port, canvas_width - 20, y_port)
            # Output port label
            canvas.draw_text(canvas_width - 25, y_port - 4, out_name, font_size=10, text_anchor="right")
            # Port pin circle
            canvas.draw_circle(block_x + block_width, y_port, 3.5)

        return canvas

    def generate_schematic_diagram(self, theme="dark"):
        """Draws a complete gate-level Schematic Diagram."""
        canvas_width, canvas_height = self._compute_layout()
        canvas = MiniCanvas(canvas_width, canvas_height, theme=theme)

        # Gather all wires in the schematic
        wires = []
        for nid, node in self.nodes.items():
            if node["type"] == "input":
                continue
            for idx, inp_id in enumerate(node["inputs"]):
                if inp_id not in self.nodes:
                    continue
                src_node = self.nodes[inp_id]

                # Source coordinates
                if src_node["type"] == "input":
                    xs = src_node["x"] + 10
                    ys = src_node["y"]
                else:  # Gate node
                    gt = src_node.get("gate_type", "")
                    bubble_offset = 24 if gt in ["NAND", "NOR", "XNOR", "NOT"] else 20
                    xs = src_node["x"] + bubble_offset
                    ys = src_node["y"]

                # Destination coordinates
                if node["type"] == "output":
                    xd = node["x"] - 10
                    yd = node["y"]
                else:  # Gate node inputs
                    xd = node["x"] - 20
                    num_gate_inputs = len(node["inputs"])
                    if num_gate_inputs > 1:
                        yd = node["y"] - 10 + idx * (20 / (num_gate_inputs - 1))
                    else:
                        yd = node["y"]

                r_src = self.rank.get(src_node["id"], 0)
                wires.append({
                    "src_id": src_node["id"],
                    "dst_id": node["id"],
                    "idx": idx,
                    "xs": xs,
                    "ys": ys,
                    "xd": xd,
                    "yd": yd,
                    "r_src": r_src,
                    "src_node": src_node
                })

        # Group wires by transition band r_src and sort to assign non-overlapping lanes
        transition_groups = {}
        for w in wires:
            transition_groups.setdefault(w["r_src"], []).append(w)

        # Draw wires using Manhattan orthogonal routing
        for r_src, group in transition_groups.items():
            sorted_group = sorted(group, key=lambda item: (item["ys"], item["yd"]))
            for lane_idx, w in enumerate(sorted_group):
                xs, ys = w["xs"], w["ys"]
                xd, yd = w["xd"], w["yd"]
                src_node = w["src_node"]

                # Assign dynamic lane offset
                lane_x = xs + 30 + lane_idx * 8
                if lane_x >= xd - 15:
                    lane_x = xd - 15

                # Manhattan Orthogonal Routing Path
                wire_commands = [
                    ('M', xs, ys),
                    ('L', lane_x, ys),
                    ('L', lane_x, yd),
                    ('L', xd, yd)
                ]
                canvas.draw_path(wire_commands, stroke_width=1.5)

                # Draw actual RTL signal name label
                if src_node["type"] == "gate":
                    if src_node.get("gate_type") != "CORE":
                        sig_label = src_node["outputs"][0]
                        canvas.draw_text(
                            xs + 8, ys - 5, sig_label,
                            font_size=8, text_anchor="left",
                            color=canvas.colors["wire_label"]
                        )

        # 2. Draw actual components/nodes
        for nid, node in self.nodes.items():
            cx = node["x"]
            cy = node["y"]

            if node["type"] == "input":
                canvas.draw_circle(cx, cy, 4)
                canvas.draw_text(cx - 10, cy + 3, node["label"], font_size=10, text_anchor="right", font_weight="bold")

            elif node["type"] == "output":
                canvas.draw_circle(cx, cy, 4)
                canvas.draw_text(cx + 10, cy + 3, node["label"], font_size=10, text_anchor="left", font_weight="bold")

            elif node["type"] == "gate":
                gt = node["gate_type"]

                # Render gate symbols with real engineering geometry
                if gt == "AND":
                    commands = [
                        ('M', cx - 20, cy - 15),
                        ('L', cx, cy - 15),
                        ('C', cx + 15, cy - 15, cx + 15, cy + 15, cx, cy + 15),
                        ('L', cx - 20, cy + 15),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])

                elif gt == "OR":
                    commands = [
                        ('M', cx - 20, cy - 15),
                        ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                        ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                        ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])

                elif gt == "XOR":
                    # Extra back curve
                    back_commands = [
                        ('M', cx - 24, cy - 15),
                        ('C', cx - 16, cy - 7, cx - 16, cy + 7, cx - 24, cy + 15)
                    ]
                    canvas.draw_path(back_commands, stroke=canvas.colors["gate_stroke"])

                    # Main OR shape
                    commands = [
                        ('M', cx - 20, cy - 15),
                        ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                        ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                        ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])

                elif gt == "NOT":
                    commands = [
                        ('M', cx - 15, cy - 12),
                        ('L', cx + 10, cy),
                        ('L', cx - 15, cy + 12),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                    canvas.draw_circle(cx + 14, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                elif gt == "NAND":
                    commands = [
                        ('M', cx - 20, cy - 15),
                        ('L', cx, cy - 15),
                        ('C', cx + 15, cy - 15, cx + 15, cy + 15, cx, cy + 15),
                        ('L', cx - 20, cy + 15),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                    canvas.draw_circle(cx + 19, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                elif gt == "NOR":
                    commands = [
                        ('M', cx - 20, cy - 15),
                        ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                        ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                        ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                    canvas.draw_circle(cx + 24, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                elif gt == "XNOR":
                    back_commands = [
                        ('M', cx - 24, cy - 15),
                        ('C', cx - 16, cy - 7, cx - 16, cy + 7, cx - 24, cy + 15)
                    ]
                    canvas.draw_path(back_commands, stroke=canvas.colors["gate_stroke"])

                    commands = [
                        ('M', cx - 20, cy - 15),
                        ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                        ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                        ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                    canvas.draw_circle(cx + 24, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                elif gt == "MUX":
                    commands = [
                        ('M', cx - 15, cy - 15),
                        ('L', cx - 15, cy + 15),
                        ('L', cx + 15, cy + 8),
                        ('L', cx + 15, cy - 8),
                        ('Z',)
                    ]
                    canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                    canvas.draw_text(cx - 3, cy + 3, "MUX", font_size=8, font_weight="bold")

                elif gt == "CORE":
                    # Dynamic box for sequential core block
                    canvas.draw_rect(cx - 50, cy - 30, 100, 60, rx=4, ry=4)
                    canvas.draw_text(cx, cy + 3, "Sequential Core", font_size=9, font_weight="bold")

                else:  # Fallback: GATE / BUF / wire buffer box
                    canvas.draw_rect(cx - 20, cy - 15, 40, 30, rx=2, ry=2)
                    canvas.draw_text(cx, cy + 3, node["label"], font_size=10, font_weight="bold")

                # Label node output target (actual RTL signal name) above the gate
                if gt != "CORE":
                    out_sig = node["outputs"][0]
                    canvas.draw_text(cx, cy - 20, out_sig, font_size=9, font_weight="bold")

        return canvas

    def generate_schematic_diagram_parts(self, theme="dark"):
        """Draws column-partitioned gate-level Schematic Diagrams for readability in reports."""
        canvas_width, canvas_height = self._compute_layout()

        # Group by rank
        columns = {}
        for nid, r in self.rank.items():
            columns.setdefault(r, []).append(nid)
        sorted_ranks = sorted(columns.keys())
        num_cols = len(sorted_ranks)

        # Split into readable sections
        MAX_COLS_PER_PAGE = 3
        chunks = []
        if num_cols <= 4:
            chunks.append(sorted_ranks)
        else:
            current_chunk = []
            for r in sorted_ranks:
                current_chunk.append(r)
                if len(current_chunk) == MAX_COLS_PER_PAGE:
                    chunks.append(current_chunk)
                    current_chunk = []
            if current_chunk:
                chunks.append(current_chunk)

        col_width = 160
        padding_x = 60

        canvases = []
        for chunk_ranks in chunks:
            min_r = min(chunk_ranks)
            max_r = max(chunk_ranks)
            num_chunk_cols = len(chunk_ranks)

            chunk_width = max(280, 2 * padding_x + (num_chunk_cols - 1) * col_width)
            chunk_height = canvas_height

            canvas = MiniCanvas(chunk_width, chunk_height, theme=theme)

            # Filter and shift wires for this chunk
            chunk_wires = []
            for nid, node in self.nodes.items():
                if node["type"] == "input":
                    continue
                for idx, inp_id in enumerate(node["inputs"]):
                    if inp_id not in self.nodes:
                        continue
                    src_node = self.nodes[inp_id]
                    r_src = self.rank.get(src_node["id"], 0)
                    r_dst = self.rank.get(node["id"], 0)

                    # Wire is present if either source or destination rank is in chunk
                    if r_src not in chunk_ranks and r_dst not in chunk_ranks:
                        continue

                    # Original coordinates
                    if src_node["type"] == "input":
                        xs = src_node["x"] + 10
                        ys = src_node["y"]
                    else:
                        gt = src_node.get("gate_type", "")
                        bubble_offset = 24 if gt in ["NAND", "NOR", "XNOR", "NOT"] else 20
                        xs = src_node["x"] + bubble_offset
                        ys = src_node["y"]

                    if node["type"] == "output":
                        xd = node["x"] - 10
                        yd = node["y"]
                    else:
                        xd = node["x"] - 20
                        num_gate_inputs = len(node["inputs"])
                        if num_gate_inputs > 1:
                            yd = node["y"] - 10 + idx * (20 / (num_gate_inputs - 1))
                        else:
                            yd = node["y"]

                    # Shifted coordinates
                    if r_src in chunk_ranks:
                        xs_shifted = xs - min_r * col_width
                        ys_shifted = ys
                    else:
                        xs_shifted = 15
                        ys_shifted = ys

                    if r_dst in chunk_ranks:
                        xd_shifted = xd - min_r * col_width
                        yd_shifted = yd
                    else:
                        xd_shifted = chunk_width - 15
                        yd_shifted = yd

                    chunk_wires.append({
                        "src_id": src_node["id"],
                        "dst_id": node["id"],
                        "idx": idx,
                        "xs": xs_shifted,
                        "ys": ys_shifted,
                        "xd": xd_shifted,
                        "yd": yd_shifted,
                        "r_src": r_src,
                        "src_node": src_node
                    })

            # Group wires by r_src and draw them
            transition_groups = {}
            for w in chunk_wires:
                transition_groups.setdefault(w["r_src"], []).append(w)

            for r_s, group in transition_groups.items():
                sorted_group = sorted(group, key=lambda item: (item["ys"], item["yd"]))
                for lane_idx, w in enumerate(sorted_group):
                    xs, ys = w["xs"], w["ys"]
                    xd, yd = w["xd"], w["yd"]
                    src_node = w["src_node"]

                    # Assign dynamic lane offset
                    if r_s in chunk_ranks:
                        lane_x = xs + 30 + lane_idx * 8
                        if lane_x >= xd - 15:
                            lane_x = xd - 15
                    else:
                        lane_x = xs + 10

                    wire_commands = [
                        ('M', xs, ys),
                        ('L', lane_x, ys),
                        ('L', lane_x, yd),
                        ('L', xd, yd)
                    ]
                    canvas.draw_path(wire_commands, stroke_width=1.5)

                    # Draw actual RTL signal name label
                    if r_s in chunk_ranks and src_node["type"] == "gate":
                        if src_node.get("gate_type") != "CORE":
                            sig_label = src_node["outputs"][0]
                            canvas.draw_text(
                                xs + 8, ys - 5, sig_label,
                                font_size=8, text_anchor="left",
                                color=canvas.colors["wire_label"]
                            )

            # Draw actual components/nodes
            for nid, node in self.nodes.items():
                r = self.rank.get(nid, 0)
                if r not in chunk_ranks:
                    continue

                cx = node["x"] - min_r * col_width
                cy = node["y"]

                if node["type"] == "input":
                    canvas.draw_circle(cx, cy, 4)
                    canvas.draw_text(cx - 10, cy + 3, node["label"], font_size=10, text_anchor="right", font_weight="bold")

                elif node["type"] == "output":
                    canvas.draw_circle(cx, cy, 4)
                    canvas.draw_text(cx + 10, cy + 3, node["label"], font_size=10, text_anchor="left", font_weight="bold")

                elif node["type"] == "gate":
                    gt = node["gate_type"]

                    if gt == "AND":
                        commands = [
                            ('M', cx - 20, cy - 15),
                            ('L', cx, cy - 15),
                            ('C', cx + 15, cy - 15, cx + 15, cy + 15, cx, cy + 15),
                            ('L', cx - 20, cy + 15),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])

                    elif gt == "OR":
                        commands = [
                            ('M', cx - 20, cy - 15),
                            ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                            ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                            ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])

                    elif gt == "XOR":
                        back_commands = [
                            ('M', cx - 24, cy - 15),
                            ('C', cx - 16, cy - 7, cx - 16, cy + 7, cx - 24, cy + 15)
                        ]
                        canvas.draw_path(back_commands, stroke=canvas.colors["gate_stroke"])

                        commands = [
                            ('M', cx - 20, cy - 15),
                            ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                            ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                            ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])

                    elif gt == "NOT":
                        commands = [
                            ('M', cx - 15, cy - 12),
                            ('L', cx + 10, cy),
                            ('L', cx - 15, cy + 12),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                        canvas.draw_circle(cx + 14, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                    elif gt == "NAND":
                        commands = [
                            ('M', cx - 20, cy - 15),
                            ('L', cx, cy - 15),
                            ('C', cx + 15, cy - 15, cx + 15, cy + 15, cx, cy + 15),
                            ('L', cx - 20, cy + 15),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                        canvas.draw_circle(cx + 19, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                    elif gt == "NOR":
                        commands = [
                            ('M', cx - 20, cy - 15),
                            ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                            ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                            ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                        canvas.draw_circle(cx + 24, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                    elif gt == "XNOR":
                        back_commands = [
                            ('M', cx - 24, cy - 15),
                            ('C', cx - 16, cy - 7, cx - 16, cy + 7, cx - 24, cy + 15)
                        ]
                        canvas.draw_path(back_commands, stroke=canvas.colors["gate_stroke"])

                        commands = [
                            ('M', cx - 20, cy - 15),
                            ('C', cx - 12, cy - 7, cx - 12, cy + 7, cx - 20, cy + 15),
                            ('C', cx, cy + 15, cx + 10, cy + 8, cx + 20, cy),
                            ('C', cx + 10, cy - 8, cx, cy - 15, cx - 20, cy - 15),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                        canvas.draw_circle(cx + 24, cy, 4, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"], stroke_width=1.5)

                    elif gt == "MUX":
                        commands = [
                            ('M', cx - 15, cy - 15),
                            ('L', cx - 15, cy + 15),
                            ('L', cx + 15, cy + 8),
                            ('L', cx + 15, cy - 8),
                            ('Z',)
                        ]
                        canvas.draw_path(commands, fill=canvas.colors["gate_fill"], stroke=canvas.colors["gate_stroke"])
                        canvas.draw_text(cx - 3, cy + 3, "MUX", font_size=8, font_weight="bold")

                    elif gt == "CORE":
                        canvas.draw_rect(cx - 50, cy - 30, 100, 60, rx=4, ry=4)
                        canvas.draw_text(cx, cy + 3, "Sequential Core", font_size=9, font_weight="bold")

                    else:
                        canvas.draw_rect(cx - 20, cy - 15, 40, 30, rx=2, ry=2)
                        canvas.draw_text(cx, cy + 3, node["label"], font_size=10, font_weight="bold")

                    if gt != "CORE":
                        out_sig = node["outputs"][0]
                        canvas.draw_text(cx, cy - 20, out_sig, font_size=9, font_weight="bold")

            canvases.append(canvas)

        return canvases
