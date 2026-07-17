import re

def check_syntax(verilog_text):

    errors = []

    # Rule 1: Empty file
    if not verilog_text.strip():
        errors.append("The uploaded file is empty.")

    # Rule 2: Missing module
    if "module" not in verilog_text:
        errors.append("Missing 'module' declaration.")

    # Rule 3: Missing endmodule
    if "endmodule" not in verilog_text:
        errors.append("Missing 'endmodule' statement.")

    # Rule 4: Check module declaration
    module_pattern = r"module\s+\w+\s*\("

    if not re.search(module_pattern, verilog_text):
        errors.append("Invalid module declaration.")

    # Rule 5: Missing closing );
    if ");" not in verilog_text:
        errors.append("Missing ');' after module port list.")

    return errors