import re


def parse_verilog(verilog_code: str):
    """
    Parse a simple Verilog module.
    """

    result = {
        "module_name": "",
        "inputs": [],
        "outputs": [],
        "assignments": []
    }

    # Find module name
    module_match = re.search(r"module\s+(\w+)", verilog_code)
    if module_match:
        result["module_name"] = module_match.group(1)

    # Find inputs
    inputs = re.findall(r"input\s+(\w+)", verilog_code)
    result["inputs"] = inputs

    # Find outputs
    outputs = re.findall(r"output\s+(\w+)", verilog_code)
    result["outputs"] = outputs

    # Find assign statements
    assigns = re.findall(r"assign\s+(.*?);", verilog_code)
    result["assignments"] = assigns

    return result