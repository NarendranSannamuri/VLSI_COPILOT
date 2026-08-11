import { Download } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { downloadReportUrl } from "../../services/api";

function DownloadCard({ reportId }) {
  const downloadPDF = () => {
    if (!reportId) return;
    window.open(downloadReportUrl(reportId), "_blank");
  };

  return (
    <Card className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-xl font-semibold">Engineering Report</h2>
        <p className="mt-1 text-sm text-slate-400">
          Download a PDF summary of score, review, metrics, and bugs.
        </p>
      </div>
      <Button onClick={downloadPDF} disabled={!reportId}>
        <Download size={16} />
        Download PDF
      </Button>
    </Card>
  );
}

export default DownloadCard;
