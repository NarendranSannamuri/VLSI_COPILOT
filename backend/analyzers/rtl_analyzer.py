def analyze_rtl(parsed_data):

    summary = {}

    summary["module_name"] = parsed_data["module_name"]

    summary["number_of_inputs"] = len(parsed_data["inputs"])

    summary["number_of_outputs"] = len(parsed_data["outputs"])

    summary["number_of_assignments"] = len(parsed_data["assignments"])

    summary["has_module"] = parsed_data["module_name"] != ""

    summary["is_combinational"] = (
        len(parsed_data["assignments"]) > 0
    )

    summary["rtl_summary"] = (
        f"{summary['module_name']} contains "
        f"{summary['number_of_inputs']} inputs, "
        f"{summary['number_of_outputs']} outputs and "
        f"{summary['number_of_assignments']} assign statements."
    )

    return summary