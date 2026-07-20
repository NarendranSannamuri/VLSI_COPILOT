function AIReviewCard({ review }) {

    return (

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

            <h2 className="text-xl font-semibold mb-6">

                AI Review

            </h2>

            <div className="whitespace-pre-wrap text-slate-300">

                {review}

            </div>

        </div>

    );

}

export default AIReviewCard;