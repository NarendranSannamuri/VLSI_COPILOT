import pytest
from backend.parsers.verilog_parser import parse_verilog
from backend.graph.rtl_graph import build_rtl_graph, build_svg_diagram

def test_full_adder_parse_and_routing():
    verilog_code = """
    module full_adder(
        input a,
        input b,
        input cin,
        output sum,
        output cout
    );
        assign sum = a ^ b ^ cin;
        assign cout = (a & b) | (b & cin) | (cin & a);
    endmodule
    """
    parsed = parse_verilog(verilog_code)
    assert parsed["module_name"] == "full_adder"
    assert "a" in parsed["inputs"]
    assert "sum" in parsed["outputs"]

    graph = build_rtl_graph(parsed)
    nodes = graph["nodes"]
    edges = graph["edges"]

    # Verify recognizable node types exist
    node_types = {n["type"] for n in nodes}
    assert "input" in node_types
    assert "output" in node_types
    assert "xor" in node_types or "and" in node_types or "or" in node_types

    # Ensure positions are calculated
    for node in nodes:
        assert "position" in node
        assert "x" in node["position"]
        assert "y" in node["position"]

    # Generate and verify SVG orthogonal routing syntax
    svg = build_svg_diagram(parsed, graph)
    assert "<svg" in svg
    assert "arrow" in svg
    assert "RTL SCHEMATIC" in svg
    # Ensure standard digital logic gate shapes/tags are drawn
    assert "polygon" in svg or "path" in svg


def test_systemverilog_example():
    sv_code = """
    module sv_example(
        input logic clk,
        input logic rst_n,
        input logic d,
        output logic q
    );
        always_ff @(posedge clk or negedge rst_n) begin
            if (!rst_n) begin
                q <= 1'b0;
            end else begin
                q <= d;
            end
        end
    endmodule
    """
    parsed = parse_verilog(sv_code)
    assert parsed["module_name"] == "sv_example"
    assert "clk" in parsed["inputs"]
    assert "q" in parsed["outputs"] or "q" in [b.get("targets", [])[0] for b in parsed.get("always_blocks", []) if b.get("targets")]

    graph = build_rtl_graph(parsed)
    node_types = {n["type"] for n in graph["nodes"]}
    assert "dff" in node_types


def test_sequence_detector_1011():
    seq_code = """
    module seq_detector_1011(
        input clk,
        input rst,
        input x,
        output reg z
    );
        reg [1:0] state, next_state;
        parameter S0 = 2'b00, S1 = 2'b01, S2 = 2'b10, S3 = 2'b11;

        always @(posedge clk or posedge rst) begin
            if (rst) state <= S0;
            else state <= next_state;
        end

        always @(*) begin
            case (state)
                S0: next_state = x ? S1 : S0;
                S1: next_state = x ? S1 : S2;
                S2: next_state = x ? S3 : S0;
                S3: next_state = x ? S1 : S2;
                default: next_state = S0;
            endcase
        end

        always @(*) begin
            z = (state == S3) && x;
        end
    endmodule
    """
    parsed = parse_verilog(seq_code)
    assert parsed["module_name"] == "seq_detector_1011"

    graph = build_rtl_graph(parsed)
    node_types = {n["type"] for n in graph["nodes"]}

    # Verify FSM-specific node layout
    assert "next_state" in node_types or "output_logic" in node_types or "dff" in node_types
