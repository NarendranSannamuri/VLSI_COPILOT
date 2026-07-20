function MetricsCard({ metrics }) {

    return (

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

            <h2 className="text-xl font-semibold mb-6">

                Design Metrics

            </h2>

            <div className="space-y-4">

                <p>Inputs : {metrics.inputs}</p>

                <p>Outputs : {metrics.outputs}</p>

                <p>Assignments : {metrics.assignments}</p>

                <p>Complexity : {metrics.module_complexity}</p>

                <p>Type : {metrics.design_type}</p>

            </div>

        </div>

    );

}

export default MetricsCard;