import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Loader2,
  Mail, 
  MessageSquare, 
  FileText, 
  BarChart, 
  Users, 
  ShoppingCart, 
  Database, 
  Zap, 
  Calendar, 
  Globe,
  Folder,
  FolderOpen,
  ChevronRight,
  Home
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { useAutomations } from "@/hooks/useAutomations";
import BulkDownloadSection from "@/components/home/BulkDownloadSection";
import N8nWorkflowPreview from "@/components/N8nWorkflowPreview";

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  mail: Mail,
  "message-square": MessageSquare,
  "file-text": FileText,
  "bar-chart": BarChart,
  users: Users,
  "shopping-cart": ShoppingCart,
  database: Database,
  zap: Zap,
  calendar: Calendar,
  globe: Globe,
  folder: Folder,
  "folder-open": FolderOpen,
  file: FileText,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName.toLowerCase()] || Zap;
};

const ITEMS_PER_PAGE = 6;

const Automations = () => {
  const { categories, subcategories, automations, loading } = useAutomations();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Get subcategories for selected category
  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === "All") return subcategories;
    const category = categories.find(c => c.name === selectedCategory);
    if (!category) return [];
    return subcategories.filter(s => s.category_id === category.id);
  }, [selectedCategory, categories, subcategories]);

  // Filter automations
  const filteredAutomations = useMemo(() => {
    return automations.filter((automation) => {
      const subcategory = subcategories.find(s => s.id === automation.subcategory_id);
      const category = subcategory ? categories.find(c => c.id === subcategory.category_id) : null;

      const matchesSearch = 
        automation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (automation.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "All" || category?.name === selectedCategory;
      const matchesSubcategory = selectedSubcategory === "All" || subcategory?.name === selectedSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [automations, subcategories, categories, searchQuery, selectedCategory, selectedSubcategory]);

  // Get visible automations based on current count
  const visibleAutomations = useMemo(() => {
    return filteredAutomations.slice(0, visibleCount);
  }, [filteredAutomations, visibleCount]);

  const hasMore = visibleCount < filteredAutomations.length;

  const handleBrowseMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  // Reset visible count when filters change
  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory("All");
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSubcategoryChange = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  // Get automation's category name
  const getAutomationCategory = (automation: typeof automations[0]) => {
    const subcategory = subcategories.find(s => s.id === automation.subcategory_id);
    const category = subcategory ? categories.find(c => c.id === subcategory.category_id) : null;
    return category?.name || "Uncategorized";
  };

  const getAutomationSubcategory = (automation: typeof automations[0]) => {
    const subcategory = subcategories.find(s => s.id === automation.subcategory_id);
    return subcategory?.name || "";
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <main className="pt-8 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Logo Header */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  AutoFlow AI
                </span>
              </Link>
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search automations..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button variant="outline" className="h-12 gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => handleCategoryChange("All")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "All"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Subcategories */}
            {selectedCategory !== "All" && filteredSubcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => handleSubcategoryChange("All")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    selectedSubcategory === "All"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ChevronRight className="w-3 h-3" />
                  All {selectedCategory}
                </button>
                {filteredSubcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubcategoryChange(sub.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSubcategory === sub.name
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {visibleAutomations.length} of {filteredAutomations.length} automations
            </p>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredAutomations.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No automations found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {automations.length === 0 
                    ? "Automations will appear here once added by admin."
                    : "Try adjusting your search or filters."}
                </p>
              </div>
            ) : (
              <>
                {/* Automations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleAutomations.map((automation) => {
                    const IconComponent = getIcon(automation.icon);
                    const categoryName = getAutomationCategory(automation);
                    const subcategoryName = getAutomationSubcategory(automation);
                    
                    return (
                      <Link
                        key={automation.id}
                        to={`/automations/${automation.id}`}
                        className="group p-4 rounded-2xl bg-card glow-card border border-border/50 flex flex-col"
                      >
                        {/* Workflow Preview - Auto-runs when JSON loads */}
                        <div className="h-40 mb-4 rounded-lg overflow-hidden bg-muted/30 border border-border/30">
                          {automation.preview_json ? (
                            <N8nWorkflowPreview 
                              json={typeof automation.preview_json === 'string' 
                                ? automation.preview_json 
                                : JSON.stringify(automation.preview_json)} 
                              compact={true}
                              className="h-full"
                            />
                          ) : (
                            <div className="h-full flex items-center justify-center">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <IconComponent className="w-6 h-6 text-primary" />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                            {categoryName}
                          </span>
                          {subcategoryName && (
                            <span className="text-xs text-muted-foreground">{subcategoryName}</span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {automation.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex-1">
                          {automation.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {automation.uses_count > 1000 
                            ? `${(automation.uses_count / 1000).toFixed(1)}k` 
                            : automation.uses_count} uses
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Browse More Button */}
                {hasMore && (
                  <div className="text-center mt-10">
                    <Button
                      onClick={handleBrowseMore}
                      variant="outline"
                      size="lg"
                      className="px-8"
                    >
                      Browse More ({filteredAutomations.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bulk Download Section */}
          <BulkDownloadSection />
        </main>
      </div>
    </PageTransition>
  );
};

export default Automations;
