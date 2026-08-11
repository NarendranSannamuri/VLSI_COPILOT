import os
import pytest
from backend.parsers.verilog_parser import parse_verilog
from backend.services.rtl_graph import RTLGraph

def test_full_adder_layout():
    verilog = """
    module full_adder(
        input a, b, cin,
        output sum, cout
    );
        assign sum = a ^ b ^ cin;
        assign cout = (a & b) | (b & cin) | (a & cin);
    endmodule
    """
    parsed = parse_verilog(verilog)
    assert parsed["module_name"] == "full_adder"

    g = RTLGraph(parsed)
    w, h = g._compute_layout()
    assert w > 0
    assert h > 0

    svg_block = g.generate_block_diagram().to_svg()
    svg_schem = g.generate_schematic_diagram().to_svg()

    assert "<svg" in svg_block
    assert "<svg" in svg_schem
    assert "full_adder" in svg_block
    assert "sum" in svg_schem
    assert "cout" in svg_schem

def test_sequential_fallback():
    # Sequential detector with no assigns
    verilog = """
    module seq_detector(
        input clk, rst, x,
        output z
    );
    endmodule
    """
    parsed = parse_verilog(verilog)
    g = RTLGraph(parsed)

    # It should have a Core Logic block
    svg_schem = g.generate_schematic_diagram().to_svg()
    assert "Sequential Core" in svg_schem
    assert "clk" in svg_schem
    assert "z" in svg_schem

def test_partitioned_schematic_diagram():
    # A design with deep rank logic to trigger partitioned drawing split
    verilog = """
    module deep_logic(
        input in_a, in_b, in_c, in_d, in_e,
        output out_f
    );
        wire w1 = in_a & in_b;
        wire w2 = w1 | in_c;
        wire w3 = w2 ^ in_d;
        wire w4 = ~w3;
        assign out_f = w4 & in_e;
    endmodule
    """
    parsed = parse_verilog(verilog)
    g = RTLGraph(parsed)

    # Check that rank spacing exists
    w, h = g._compute_layout()
    assert len(g.rank) > 0

    # Generate partitioned diagrams in both dark and light themes
    parts_dark = g.generate_schematic_diagram_parts(theme="dark")
    parts_light = g.generate_schematic_diagram_parts(theme="light")

    assert len(parts_dark) > 0
    assert len(parts_light) > 0
    assert len(parts_dark) == len(parts_light)

    # Verify reportlab serialization for each light part
    for part in parts_light:
        rl_drawing = part.to_reportlab()
        assert rl_drawing.width > 0
        assert rl_drawing.height > 0
