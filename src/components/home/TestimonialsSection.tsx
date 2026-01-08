import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "AutoFlow AI has completely transformed how we handle customer support. We've reduced response times by 80% and our customers love it.",
    author: "Sarah Chen",
    role: "Head of Operations",
    company: "TechStart Inc.",
    avatar: "SC",
  },
  {
    quote: "The pre-built templates saved us months of development time. We were able to automate our entire sales pipeline in just one afternoon.",
    author: "Michael Roberts",
    role: "VP of Sales",
    company: "GrowthCo",
    avatar: "MR",
  },
  {
    quote: "Best investment we've made this year. The ROI was immediate and the support team is incredibly responsive.",
    author: "Emily Watson",
    role: "CEO",
    company: "DataFlow Solutions",
    avatar: "EW",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Loved by Thousands of Teams
          </h2>
          <p className="text-lg text-muted-foreground">
            See why businesses trust AutoFlow AI to power their automation.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="p-8 rounded-2xl bg-card glow-card border border-border/50"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
