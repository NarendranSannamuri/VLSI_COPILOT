function DownloadCard() {

    const downloadPDF = () => {

        window.open(
            "http://127.0.0.1:8000/download-report",
            "_blank"
        );

    };

    return (

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">

            <button

                onClick={downloadPDF}

                className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 py-3"

            >

                Download PDF Report

            </button>

        </div>

    );

}

export default DownloadCard;