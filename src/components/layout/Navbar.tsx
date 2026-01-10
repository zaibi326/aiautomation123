import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, Sparkles, ExternalLink } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHeroPage = location.pathname === "/";

  const navLinks = [
    { name: "Automations", href: "/automations", external: false },
    { name: "Courses", href: "https://aiautobase.com/courses", external: true },
    { name: "Pricing", href: "/pricing", external: false },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary via-purple-600 to-primary">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 py-2 text-xs sm:text-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            <span className="text-primary-foreground font-medium">
              New: Access 15,000+ ready-made AI workflows
            </span>
            <Link 
              to="/automations" 
              className="text-primary-foreground font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity flex items-center gap-1"
            >
              Explore Now
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`fixed top-[36px] left-0 right-0 z-50 transition-all duration-300 ${
        isHeroPage ? "glass-dark" : "glass"
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className={`text-xl font-bold ${isHeroPage ? "hero-text" : "text-foreground"}`}>
                AutoFlow AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
                      isHeroPage ? "hero-text-muted hover:text-hero-text" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isHeroPage ? "hero-text-muted hover:text-hero-text" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant={isHeroPage ? "heroOutline" : "ghost"} size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" size="sm">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isHeroPage ? "text-hero-text hover:bg-hero-text/10" : "text-foreground hover:bg-muted"
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className={`md:hidden py-4 border-t ${
              isHeroPage ? "border-hero-text/10" : "border-border"
            }`}>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  link.external ? (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className={`text-sm font-medium py-2 flex items-center gap-1 ${
                        isHeroPage ? "hero-text-muted" : "text-muted-foreground"
                      }`}
                    >
                      {link.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-sm font-medium py-2 ${
                        isHeroPage ? "hero-text-muted" : "text-muted-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
                <div className="flex flex-col gap-2 pt-4">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant={isHeroPage ? "heroOutline" : "outline"} className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
