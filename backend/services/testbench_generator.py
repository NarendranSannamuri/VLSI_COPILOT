def generate_testbench(parsed):

    module_name = parsed["module_name"]
    inputs = parsed["inputs"]
    outputs = parsed["outputs"]

    tb = ""

    # Header
    tb += "`timescale 1ns/1ps\n\n"

    tb += f"module tb_{module_name};\n\n"

    # Input declarations
    for inp in inputs:
        tb += f"reg {inp};\n"

    tb += "\n"

    # Output declarations
    for out in outputs:
        tb += f"wire {out};\n"

    tb += "\n"

    # DUT Instantiation
    tb += f"{module_name} uut (\n"

    ports = []

    for inp in inputs:
        ports.append(f"    .{inp}({inp})")

    for out in outputs:
        ports.append(f"    .{out}({out})")

    tb += ",\n".join(ports)

    tb += "\n);\n\n"

    # Initial Block
    tb += "initial begin\n\n"

     # Test Cases
    tb += "    A = 0; B = 0;\n"
    tb += "    #10;\n\n"

    tb += "    A = 0; B = 1;\n"
    tb += "    #10;\n\n"

    tb += "    A = 1; B = 0;\n"
    tb += "    #10;\n\n"

    tb += "    A = 1; B = 1;\n"
    tb += "    #10;\n\n"

    tb += "    $finish;\n"
    tb += "end\n\n"

    tb += "initial begin\n"

    monitor_vars = inputs + outputs

    format_string = " ".join([f"{v}=%b" for v in monitor_vars])

    variable_list = ", ".join(monitor_vars)

    tb += f'    $monitor("{format_string}", {variable_list});\n'

    tb += "end\n\n"

    tb += "endmodule\n"


    return tb