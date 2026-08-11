import Card from "../ui/Card";

function AIReviewCard({ review }) {
  if (!review) return null;

  const sections = [
    { title: "Summary", items: review.summary ? [review.summary] : [], tone: "text-sky-300", list: false },
    { title: "Strengths", items: review.strengths || [], tone: "text-emerald-300", prefix: "✓ " },
    { title: "Issues", items: review.issues || [], tone: "text-amber-300", prefix: "• " },
    {
      title: "Recommendations",
      items: review.recommendations || [],
      tone: "text-cyan-300",
      prefix: "→ ",
    },
  ];

  return (
    <Card>
      <h2 className="mb-8 text-2xl font-semibold">AI Engineering Review</h2>
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className={`mb-3 text-lg font-semibold ${section.tone}`}>
              {section.title}
            </h3>
            {section.list === false ? (
              <p className="text-slate-300">{section.items[0]}</p>
            ) : (
              <ul className="space-y-2">
                {section.items.map((item, index) => (
                  <li key={index} className="text-slate-300">
                    {section.prefix}
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default AIReviewCard;
