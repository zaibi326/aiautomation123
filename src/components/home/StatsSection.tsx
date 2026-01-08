const stats = [
  { value: "15,000+", label: "AI Workflows" },
  { value: "10,000+", label: "Happy Users" },
  { value: "500+", label: "Integrations" },
  { value: "99.9%", label: "Uptime" },
];

const StatsSection = () => {
  return (
    <section className="py-20 surface-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
