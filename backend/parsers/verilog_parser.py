import re


def tokenize_expression(expr_str: str):
    """Tokenize a Verilog assign right-hand side expression."""
    # Replace comments
    expr_str = re.sub(r"//.*", "", expr_str)
    expr_str = re.sub(r"/\*.*?\*/", "", expr_str, flags=re.DOTALL)
    expr_str = expr_str.strip()

    # Pattern for operators, identifiers, numbers, parens
    pattern = r"(~&\||~\||~\^|\^~|\&\&|\|\||==|!=|<=|>=|\?|:|\&|\||\^|~|\+|-|\*|/|\(|\)|[A-Za-z_]\w*(?:\[\d+(?::\d+)?\])?|\d+'[bdho][0-9a-fA-F_]+|\d+)"
    tokens = re.findall(pattern, expr_str)
    return [t for t in tokens if t.strip()]


class ExpressionParser:
    """Simple Pratt / Recursive Descent parser for Verilog expressions into AST nodes."""

    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def peek(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def consume(self):
        token = self.peek()
        if token is not None:
            self.pos += 1
        return token

    def parse(self):
        if not self.tokens:
            return None
        ast = self.parse_ternary()
        return ast

    def parse_ternary(self):
        condition = self.parse_binary_or()
        if self.peek() == "?":
            self.consume()  # ?
            true_expr = self.parse_ternary()
            if self.peek() == ":":
                self.consume()  # :
            false_expr = self.parse_ternary()
            return {
                "type": "MUX",
                "op": "?:",
                "sel": condition,
                "in1": true_expr,
                "in0": false_expr,
            }
        return condition

    def parse_binary_or(self):
        left = self.parse_binary_xor()
        while self.peek() in ("|", "||", "~|"):
            op = self.consume()
            right = self.parse_binary_xor()
            gate_type = "NOR" if op == "~|" else "OR"
            left = {"type": gate_type, "op": op, "left": left, "right": right}
        return left

    def parse_binary_xor(self):
        left = self.parse_binary_and()
        while self.peek() in ("^", "~^", "^~"):
            op = self.consume()
            right = self.parse_binary_and()
            gate_type = "XNOR" if op in ("~^", "^~") else "XOR"
            left = {"type": gate_type, "op": op, "left": left, "right": right}
        return left

    def parse_binary_and(self):
        left = self.parse_unary()
        while self.peek() in ("&", "&&", "~&"):
            op = self.consume()
            right = self.parse_unary()
            gate_type = "NAND" if op == "~&" else "AND"
            left = {"type": gate_type, "op": op, "left": left, "right": right}
        return left

    def parse_unary(self):
        token = self.peek()
        if token == "~":
            self.consume()
            child = self.parse_unary()
            return {"type": "NOT", "op": "~", "operand": child}
        if token == "(":
            self.consume()
            expr = self.parse_ternary()
            if self.peek() == ")":
                self.consume()
            return expr
        # Identifier or constant
        val = self.consume()
        if val:
            return {"type": "SIGNAL", "name": val}
        return None


def parse_assign_expression(expr_str: str):
    tokens = tokenize_expression(expr_str)
    if not tokens:
        return None
    try:
        parser = ExpressionParser(tokens)
        return parser.parse()
    except Exception:
        return None


def parse_verilog(verilog_code: str):
    """
    Comprehensive Verilog / SystemVerilog parser.
    Extracts ports, wires, registers, assignments (with AST), sequential blocks (FSM/DFFs),
    and submodule instantiations.
    """
    clean_code = re.sub(r"//.*", "", verilog_code)
    clean_code = re.sub(r"/\*.*?\*/", "", clean_code, flags=re.DOTALL)

    result = {
        "module_name": "unknown_module",
        "inputs": [],
        "outputs": [],
        "wires": [],
        "regs": [],
        "assignments": [],
        "parsed_assigns": [],
        "always_blocks": [],
        "instantiations": [],
    }

    # Extract module name
    mod_match = re.search(r"\bmodule\s+([A-Za-z_]\w*)", clean_code)
    if mod_match:
        result["module_name"] = mod_match.group(1)

    # Helper to extract signal names from a declaration string blob
    def extract_names(blob):
        cleaned = re.sub(r"\[.*?\]", "", blob)
        names = []
        for part in cleaned.split(","):
            token = part.strip().split()[-1] if part.strip() else ""
            token = re.sub(r"[^A-Za-z0-9_]", "", token)
            if token and token not in ("wire", "reg", "logic", "input", "output", "inout"):
                names.append(token)
        return names

    # 1. Non-ANSI / Standard declarations
    input_matches = re.finditer(
        r"\binput\s+(?:wire\s+|reg\s+|logic\s+)?(?:\[[^\]]+\]\s*)?([^;]+);",
        clean_code,
        re.IGNORECASE,
    )
    for m in input_matches:
        for name in extract_names(m.group(1)):
            if name not in result["inputs"]:
                result["inputs"].append(name)

    output_matches = re.finditer(
        r"\boutput\s+(?:wire\s+|reg\s+|logic\s+)?(?:\[[^\]]+\]\s*)?([^;]+);",
        clean_code,
        re.IGNORECASE,
    )
    for m in output_matches:
        for name in extract_names(m.group(1)):
            if name not in result["outputs"]:
                result["outputs"].append(name)

    wire_matches = re.finditer(
        r"\bwire\s+(?:\[[^\]]+\]\s*)?([^;]+);",
        clean_code,
        re.IGNORECASE,
    )
    for m in wire_matches:
        for name in extract_names(m.group(1)):
            if name not in result["inputs"] and name not in result["outputs"] and name not in result["wires"]:
                result["wires"].append(name)

    reg_matches = re.finditer(
        r"\b(?:reg|logic)\s+(?:\[[^\]]+\]\s*)?([^;]+);",
        clean_code,
        re.IGNORECASE,
    )
    for m in reg_matches:
        for name in extract_names(m.group(1)):
            if name not in result["inputs"] and name not in result["outputs"] and name not in result["regs"]:
                result["regs"].append(name)

    # 2. ANSI-style port declarations in module(...)
    port_header = re.search(
        r"\bmodule\s+[A-Za-z_]\w*\s*\((.*?)\)\s*;",
        clean_code,
        re.DOTALL,
    )
    if port_header:
        blob = port_header.group(1)
        for m in re.finditer(
            r"\b(input|output)\s+(?:wire\s+|reg\s+|logic\s+)?(?:\[[^\]]+\]\s*)?([A-Za-z_]\w*)",
            blob,
            re.IGNORECASE,
        ):
            p_type, p_name = m.group(1).lower(), m.group(2)
            if p_type == "input" and p_name not in result["inputs"]:
                result["inputs"].append(p_name)
            elif p_type == "output" and p_name not in result["outputs"]:
                result["outputs"].append(p_name)

    # 3. Assign statements
    assign_matches = re.finditer(r"\bassign\s+([^;]+);", clean_code, re.IGNORECASE)
    for m in assign_matches:
        raw_assign = m.group(1).strip()
        result["assignments"].append(raw_assign)
        if "=" in raw_assign:
            lhs, rhs = raw_assign.split("=", 1)
            target = lhs.strip()
            rhs_clean = rhs.strip()
            ast = parse_assign_expression(rhs_clean)
            result["parsed_assigns"].append({
                "target": target,
                "raw_expression": rhs_clean,
                "ast": ast,
            })

    # 4. Always blocks (Sequential / FSM / Registers)
    always_matches = re.finditer(
        r"\balways(?:_ff)?\s*@\s*\((.*?)\)\s*(begin\b.*?\bend|\b[^;]+;)",
        clean_code,
        re.DOTALL | re.IGNORECASE,
    )
    for m in always_matches:
        sensitivity = m.group(1).strip()
        body = m.group(2).strip()

        clk_name = "clk"
        rst_name = "rst"

        clk_match = re.search(r"posedge\s+([A-Za-z_]\w*)", sensitivity, re.IGNORECASE)
        if clk_match:
            clk_name = clk_match.group(1)

        rst_match = re.search(r"(?:posedge|negedge)\s+([A-Za-z_]\w*)", sensitivity, re.IGNORECASE)
        if rst_match and rst_match.group(1) != clk_name:
            rst_name = rst_match.group(1)

        assigned_targets = list(set(re.findall(r"([A-Za-z_]\w*)\s*<=|\b([A-Za-z_]\w*)\s*=", body)))
        targets = []
        for t in assigned_targets:
            name = t[0] or t[1]
            if name and name not in ("if", "else", "case", "endcase", "begin", "end"):
                targets.append(name)

        is_fsm = False
        if any(term in body.lower() for term in ("case", "state", "next", "s0", "s1", "s2", "s3")):
            is_fsm = True

        result["always_blocks"].append({
            "sensitivity": sensitivity,
            "clk": clk_name,
            "rst": rst_name,
            "targets": targets,
            "is_fsm": is_fsm,
            "body": body,
        })

        if clk_name not in result["inputs"]:
            result["inputs"].append(clk_name)
        if rst_name not in result["inputs"] and "rst" in sensitivity.lower():
            result["inputs"].append(rst_name)

    return result
