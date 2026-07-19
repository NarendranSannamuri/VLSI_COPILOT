function Features() {
  const features = [
    "Syntax Validation",
    "RTL Analysis",
    "AI Review",
    "RTL Quality Score",
    "Bug Detection",
    "Testbench Generation",
    "PDF Report",
  ];

  return (
    <section className="max-w-5xl mx-auto py-20">

      <h2 className="text-3xl font-bold text-center mb-12">
        Engineering Workflow
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {features.map((feature) => (
          <div
            key={feature}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >
            {feature}
          </div>
        ))}

      </div>

    </section>
  );
}

export default Features;