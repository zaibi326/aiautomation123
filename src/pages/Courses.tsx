import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { 
  Play, 
  CheckCircle, 
  Star, 
  Clock, 
  BookOpen, 
  Award, 
  Zap, 
  Database, 
  Globe, 
  Bot, 
  Code, 
  Layers,
  ArrowRight,
  Users,
  Trophy,
  Sparkles
} from "lucide-react";

const modules = [
  {
    icon: Zap,
    title: "Learn to Automate",
    lessons: 8,
    duration: "4 hours",
    topics: ["Web fundamentals & objects", "Identifying automation opportunities", "Building your first workflow", "Error handling basics"]
  },
  {
    icon: Database,
    title: "Master Databases",
    lessons: 6,
    duration: "3 hours",
    topics: ["Data types & transformations", "Schema structures", "Airtable fundamentals", "Data relationships"]
  },
  {
    icon: Globe,
    title: "Work with APIs",
    lessons: 7,
    duration: "4 hours",
    topics: ["Reading API documentation", "JSON files & structures", "Webhook setup", "Authentication methods"]
  },
  {
    icon: Bot,
    title: "Build AI Workflows",
    lessons: 10,
    duration: "6 hours",
    topics: ["Configuring ChatGPT & Claude", "Prompt engineering", "Multi-step AI chains", "Output parsing"]
  },
  {
    icon: Code,
    title: "Deploy AI Agents",
    lessons: 8,
    duration: "5 hours",
    topics: ["Autonomous agent design", "Tool integration", "Memory & context", "Production deployment"]
  },
  {
    icon: Layers,
    title: "Advanced Integrations",
    lessons: 6,
    duration: "3 hours",
    topics: ["Make & n8n mastery", "Zapier advanced", "Clay workflows", "Custom connectors"]
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Operations Lead, TechFlow",
    quote: "This course transformed how our team approaches automation. We've saved 40+ hours per week.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Founder, StartupLabs",
    quote: "The AI agent module alone was worth the investment. Now building agents for clients.",
    rating: 5
  },
  {
    name: "Emma Williams",
    role: "Marketing Director, BrandCo",
    quote: "Finally understand how to connect AI to our workflows. Game changer for our campaigns.",
    rating: 5
  }
];

const faqs = [
  {
    question: "How long do I have access to the course?",
    answer: "You get lifetime access to all course materials, including future updates and new modules we add."
  },
  {
    question: "Do I need coding experience?",
    answer: "No coding experience required! We start from the basics and build up. The course is designed for non-technical professionals."
  },
  {
    question: "What tools will I learn?",
    answer: "You'll master Airtable, Make, n8n, Zapier, Clay, and Relevance AI. Plus, you'll learn to work with ChatGPT, Claude, and Gemini APIs."
  },
  {
    question: "Is there a certificate?",
    answer: "Yes! Upon completion, you'll receive an AI Automation Specialist certificate that you can share on LinkedIn."
  }
];

const Courses = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-32 pb-16">
          {/* Hero Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI Builder Masterclass</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Become the AI Expert{" "}
                <span className="gradient-text">Your Team Turns To</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Master AI automation from zero to deployment. 100+ hours of content, 
                45+ lessons, and real-world projects to build your portfolio.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Enroll Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="w-full sm:w-auto gap-2">
                  <Play className="w-5 h-5" />
                  Watch Preview
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>100+ Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>45+ Lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  <span>Certificate Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span>5,000+ Students</span>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Method */}
          <section className="bg-muted/50 py-16 mb-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Learn → See → Build</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our proven learning methodology ensures you don't just understand concepts—you can apply them.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center p-6 rounded-2xl bg-background border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">1. Learn</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear video lessons breaking down complex concepts into digestible steps.
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-background border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">2. See</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch live demos and walkthroughs of real automation builds.
                  </p>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-background border border-border">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">3. Build</h3>
                  <p className="text-sm text-muted-foreground">
                    Hands-on exercises to create your own automations and AI workflows.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Course Modules */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Course Curriculum</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                6 comprehensive modules taking you from automation basics to deploying production AI agents.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => (
                <div 
                  key={module.title}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <module.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      Module {index + 1}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">{module.title}</h3>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {module.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {module.duration}
                    </span>
                  </div>
                  
                  <ul className="space-y-2">
                    {module.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="max-w-lg mx-auto">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-purple-500/10 border border-primary/20">
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold mb-4">
                    LIFETIME ACCESS
                  </span>
                  <h3 className="text-3xl font-bold text-foreground mb-2">AI Builder Masterclass</h3>
                  <p className="text-muted-foreground">Everything you need to become an AI automation expert</p>
                </div>
                
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-foreground">$499</span>
                    <span className="text-muted-foreground line-through">$999</span>
                  </div>
                  <p className="text-sm text-primary font-medium">50% off - Limited time offer</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "100+ hours of video content",
                    "45+ hands-on lessons",
                    "6 comprehensive modules",
                    "Real project templates",
                    "Private community access",
                    "Certificate of completion",
                    "Lifetime updates included"
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link to="/signup">
                  <Button variant="hero" size="xl" className="w-full">
                    Enroll Now
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                
                <p className="text-center text-xs text-muted-foreground mt-4">
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className="bg-muted/50 py-16 mb-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">What Students Say</h2>
                <p className="text-muted-foreground">Join 5,000+ professionals who've transformed their careers</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {testimonials.map((testimonial) => (
                  <div 
                    key={testimonial.name}
                    className="p-6 rounded-2xl bg-background border border-border"
                  >
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div 
                    key={faq.question}
                    className="p-6 rounded-2xl bg-card border border-border"
                  >
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl hero-gradient">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold hero-text mb-4">
                Ready to Become an AI Expert?
              </h2>
              <p className="text-lg hero-text-muted mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are already building the future with AI automation.
              </p>
              <Link to="/signup">
                <Button variant="hero" size="xl">
                  Start Learning Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Courses;
