function TestbenchCard({ testbench }) {

    return (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">

            <div className="flex justify-between items-center">

                <h2 className="text-xl font-semibold">

                    Generated Testbench

                </h2>

                <button

                    onClick={() => navigator.clipboard.writeText(testbench)}

                    className="border border-slate-700 px-4 py-2 rounded-lg"

                >

                    Copy

                </button>

            </div>

            <pre className="mt-8 bg-slate-950 rounded-xl p-6 overflow-x-auto text-sm">

                {testbench}

            </pre>

        </div>

    );

}

export default TestbenchCard;