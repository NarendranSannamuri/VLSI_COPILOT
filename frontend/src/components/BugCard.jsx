function BugCard({ bugs }) {

    const severityColor =
        bugs.severity === "High"
            ? "text-red-400"
            : bugs.severity === "Medium"
            ? "text-yellow-400"
            : "text-green-400";

    return (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">

            <h2 className="text-xl font-semibold mb-8">
                RTL Bug Detection
            </h2>

            <div className="space-y-5">

                <div className="flex justify-between">
                    <span className="text-slate-400">
                        Severity
                    </span>

                    <span className={severityColor}>
                        {bugs.severity}
                    </span>
                </div>

                <div>
                    <p className="text-slate-400 mb-2">
                        Bug Type
                    </p>

                    <p>
                        {bugs.bug_type}
                    </p>
                </div>

                <div>
                    <p className="text-slate-400 mb-2">
                        Reason
                    </p>

                    <p>
                        {bugs.reason}
                    </p>
                </div>

                <div>
                    <p className="text-slate-400 mb-2">
                        Recommendation
                    </p>

                    <p>
                        {bugs.recommendation}
                    </p>
                </div>

            </div>

        </div>

    );

}

export default BugCard;