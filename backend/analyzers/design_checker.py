def check_design(parsed_data):

    warnings = []

    if parsed_data["module_name"] == "":
        warnings.append("Module declaration not found.")

    if len(parsed_data["inputs"]) == 0:
        warnings.append("No input ports found.")

    if len(parsed_data["outputs"]) == 0:
        warnings.append("No output ports found.")

    if len(parsed_data["assignments"]) == 0:
        warnings.append("No assign statements found.")

    if len(warnings) == 0:
        warnings.append("No structural issues detected.")

    return warnings