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
