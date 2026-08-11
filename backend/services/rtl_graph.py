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
        self.inputs = parsed_data.get("inputs") or []
        self.outputs = parsed_data.get("outputs") or []
        self.raw_assignments = parsed_data.get("assignments") or []

        # Build the graph representation
        self.nodes = {}
        self._build_graph()

    def _build_graph(self):
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

        # 2. Parse and add assignments (gates)
        assigned_targets = set()
        for assign_str in self.raw_assignments:
            cleaned = assign_str.replace("assign", "").strip()
            if "=" not in cleaned:
                continue
            parts = cleaned.split("=", 1)
            lhs = parts[0].strip()
            rhs = parts[1].strip()

            # Identify inputs/operands from RHS (words matching variable names)
            tokens = re.findall(r"\b[a-zA-Z_]\w*\b", rhs)
            KEYWORDS = {"assign", "wire", "reg", "input", "output", "module", "endmodule", "always", "begin", "end", "case", "endcase", "if", "else", "parameter", "localparam"}

            # Filter tokens to find valid input signals
            inp_signals = []
            for t in tokens:
                if t not in KEYWORDS and (t in self.inputs or t in assigned_targets or any(lh in t for lh in [lhs] if t != lhs)):
                    if t not in inp_signals:
                        inp_signals.append(t)

            # If no inputs matched (maybe constants or complex operators), let's keep all non-keyword tokens
            if not inp_signals:
                inp_signals = [t for t in tokens if t not in KEYWORDS and t != lhs]

            # Categorize gate type
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

            # Map input signal names to node IDs
            node_inputs = []
            for sig in inp_signals:
                # If sig is in inputs, it feeds from the input port node
                if sig in self.inputs:
                    node_inputs.append(f"in_{sig}")
                else:
                    # Otherwise it feeds from another gate node
                    node_inputs.append(f"gate_{sig}")

            self.nodes[node_id] = {
                "id": node_id,
                "type": "gate",
                "gate_type": gate_type,
                "label": label,
                "inputs": node_inputs,
                "outputs": [lhs]
            }
            assigned_targets.add(lhs)

        # 3. Add output ports
        for out in self.outputs:
            node_id = f"out_{out}"

            # Map its inputs
            node_inputs = []
            if out in assigned_targets:
                node_inputs.append(f"gate_{out}")
            elif out in self.inputs:
                node_inputs.append(f"in_{out}")
            else:
                # Fallback to general gate if not found
                possible_gate = f"gate_{out}"
                if possible_gate in self.nodes:
                    node_inputs.append(possible_gate)
                else:
                    node_inputs.append(f"in_{out}") # default feedthrough

            self.nodes[node_id] = {
                "id": node_id,
                "type": "output",
                "label": out,
                "inputs": node_inputs,
                "outputs": []
            }

        # 4. If sequential/FSM with no assignments (e.g. sequence detector):
        # Let's create a beautiful fallback CORE node to represent the sequential core logic
        has_gates = any(n["type"] == "gate" for n in self.nodes.values())
        if not has_gates and (self.inputs or self.outputs):
            core_id = "gate_core"
            self.nodes[core_id] = {
                "id": core_id,
                "type": "gate",
                "gate_type": "CORE",
                "label": "Sequential Logic Core",
                "inputs": [f"in_{inp}" for inp in self.inputs],
                "outputs": self.outputs
            }
            # Rewire output ports to feed from the central core node
            for out in self.outputs:
                out_id = f"out_{out}"
                if out_id in self.nodes:
                    self.nodes[out_id]["inputs"] = [core_id]

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
                break

            # Handle unresolvable cycles or missing signals safely to guarantee complete output
            for gid in gate_ids:
                if gid not in rank:
                    # Look at any resolved inputs
                    valid_ranks = [rank[inp] for inp in self.nodes[gid]["inputs"] if inp in rank]
                    rank[gid] = 1 + (max(valid_ranks) if valid_ranks else (max(rank.values()) if rank else 0))
                    resolved.add(gid)

        # 3. Outputs get Max Rank + 1
        max_gate_rank = max(rank.values()) if rank else 0
        output_ids = [nid for nid, n in self.nodes.items() if n["type"] == "output"]
        for oid in output_ids:
            rank[oid] = max_gate_rank + 1

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

        # 1. Draw solid wires (lines) with nice layout and actual RTL signal names
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
                    # Adjust for bubble if gate has a bubble
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

                # Cubic Bezier wire path
                wire_commands = [
                    ('M', xs, ys),
                    ('C', xs + 35, ys, xd - 35, yd, xd, yd)
                ]
                canvas.draw_path(wire_commands, stroke_width=1.5)

                # Draw actual RTL signal name label
                # If the wire originates from a gate, label it with the assignment target
                if src_node["type"] == "gate":
                    sig_label = src_node["outputs"][0]
                    # Draw signal name label just above the source wire pin
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
