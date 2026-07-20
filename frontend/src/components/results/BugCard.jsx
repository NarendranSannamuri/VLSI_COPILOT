function BugCard({ bugs }) {

    return (

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

            <h2 className="text-xl font-semibold mb-6">

                Bug Detection

            </h2>

            <pre className="whitespace-pre-wrap">

                {JSON.stringify(bugs, null, 2)}

            </pre>

        </div>

    );

}

export default BugCard;