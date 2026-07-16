def generate_report(parsed, analysis, warnings, metrics):

    report = {

        "module_information": {

            "module_name": analysis["module_name"],

            "inputs": metrics["inputs"],

            "outputs": metrics["outputs"]

        },

        "design_metrics": {

            "complexity": metrics["module_complexity"],

            "design_type": metrics["design_type"],

            "assignments": metrics["assignments"]

        },

        "design_checks": warnings,

        "summary": analysis["rtl_summary"]

    }

    return report