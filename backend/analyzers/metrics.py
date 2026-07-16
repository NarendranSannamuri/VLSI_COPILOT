def calculate_metrics(parsed_data):

    metrics = {}

    inputs = len(parsed_data["inputs"])
    outputs = len(parsed_data["outputs"])
    assigns = len(parsed_data["assignments"])

    metrics["inputs"] = inputs
    metrics["outputs"] = outputs
    metrics["assignments"] = assigns

    score = inputs + outputs + assigns

    if score <= 5:
        metrics["module_complexity"] = "Low"

    elif score <= 10:
        metrics["module_complexity"] = "Medium"

    else:
        metrics["module_complexity"] = "High"

    if assigns > 0:
        metrics["design_type"] = "Combinational"
    else:
        metrics["design_type"] = "Sequential/Unknown"

    return metrics