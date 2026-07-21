function AIReviewCard({ review }) {

    return (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-lg">

            <h2 className="text-2xl font-semibold mb-8">
                AI Engineering Review
            </h2>

            <div className="space-y-8">

                {/* Summary */}

                <div>

                    <h3 className="text-lg font-semibold text-blue-400 mb-3">
                        Summary
                    </h3>

                    <p className="text-slate-300">
                        {review.summary}
                    </p>

                </div>

                {/* Strengths */}

                <div>

                    <h3 className="text-lg font-semibold text-green-400 mb-3">
                        Strengths
                    </h3>

                    <ul className="space-y-2">

                        {review.strengths.map((item, index) => (

                            <li
                                key={index}
                                className="text-slate-300"
                            >
                                ✓ {item}
                            </li>

                        ))}

                    </ul>

                </div>

                {/* Issues */}

                <div>

                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                        Issues
                    </h3>

                    <ul className="space-y-2">

                        {review.issues.map((item, index) => (

                            <li
                                key={index}
                                className="text-slate-300"
                            >
                                • {item}
                            </li>

                        ))}

                    </ul>

                </div>

                {/* Recommendations */}

                <div>

                    <h3 className="text-lg font-semibold text-cyan-400 mb-3">
                        Recommendations
                    </h3>

                    <ul className="space-y-2">

                        {review.recommendations.map((item, index) => (

                            <li
                                key={index}
                                className="text-slate-300"
                            >
                                → {item}
                            </li>

                        ))}

                    </ul>

                </div>

            </div>

        </div>

    );

}

export default AIReviewCard;