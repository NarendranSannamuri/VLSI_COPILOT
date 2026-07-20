function MetricsCard({ metrics }) {

    return (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">

            <h2 className="text-xl font-semibold text-slate-200 mb-8">
                Design Metrics
            </h2>

            <div className="space-y-5">

                <div className="flex justify-between">
                    <span className="text-slate-400">Inputs</span>
                    <span>{metrics.inputs}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Outputs</span>
                    <span>{metrics.outputs}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Assignments</span>
                    <span>{metrics.assignments}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Complexity</span>
                    <span>{metrics.module_complexity}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-slate-400">Design Type</span>
                    <span>{metrics.design_type}</span>
                </div>

            </div>

        </div>

    );

}

export default MetricsCard;