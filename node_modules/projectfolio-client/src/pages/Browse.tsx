import { useState, useEffect } from "react";
import { projectsAPI } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProjectCard from "@/components/home/ProjectCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Use direct API calls instead of TanStack Query for now
  const [projects, setProjects] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [categories, setCategories] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        // Failed to load projects
      } finally {
        setProjectsLoading(false);
      }
    };
    loadProjects();
  }, []);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        // Failed to load categories
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be triggered automatically by the query
  };

  // Real-time search - no need to submit form
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter and sort projects based on current filters
  const getFilteredAndSortedProjects = () => {
    if (!projects?.data?.projects) return [];
    
    let filteredProjects = [...projects.data.projects];

    // Apply search filter
    if (searchQuery) {
      filteredProjects = filteredProjects.filter((project: any) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          project.title?.toLowerCase().includes(searchLower) ||
          project.description?.toLowerCase().includes(searchLower) ||
          project.category?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filteredProjects = filteredProjects.filter((project: any) => {
        const projectCategory = project.category?.toLowerCase().replace(/\s+/g, '-');
        return projectCategory === selectedCategory;
      });
    }

    // Apply price range filter
    if (priceRange !== "all") {
      filteredProjects = filteredProjects.filter((project: any) => {
        const price = project.price || 0;
        switch (priceRange) {
          case "0-10000":
            return price >= 0 && price <= 10000;
          case "10000-50000":
            return price >= 10000 && price <= 50000;
          case "50000-100000":
            return price >= 50000 && price <= 100000;
          case "100000-200000":
            return price >= 100000 && price <= 200000;
          case "200000+":
            return price >= 200000;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filteredProjects.sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-low":
          return (a.price || 0) - (b.price || 0);
        case "price-high":
          return (b.price || 0) - (a.price || 0);
        case "popular":
          // For now, sort by views or rating if available, otherwise by newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "rating":
          // For now, sort by rating if available, otherwise by newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filteredProjects;
  };

  // Get paginated projects
  const getPaginatedProjects = () => {
    const filteredProjects = getFilteredAndSortedProjects();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  };

  // Calculate pagination info
  const filteredProjects = getFilteredAndSortedProjects();
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredProjects.length);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("newest");
    setPriceRange("all");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || sortBy !== "newest" || priceRange !== "all";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-success/5 to-blue-500/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Browse Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover thousands of high-quality software projects from talented developers worldwide
            </p>
          </div>
        </section>

        <div className="container py-8">
          {/* Filters and Search */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search projects by title, description, or tags..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                                                 {categoriesLoading ? (
                           <SelectItem value="loading" disabled>Loading...</SelectItem>
                         ) : (
                           categories?.categories?.map((category: string, index: number) => (
                             <SelectItem key={index} value={category.toLowerCase().replace(/\s+/g, '-')}>
                               {category}
                             </SelectItem>
                           ))
                         )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Newest First
                          </div>
                        </SelectItem>
                        <SelectItem value="oldest">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Oldest First
                          </div>
                        </SelectItem>
                        <SelectItem value="price-low">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Price: Low to High
                          </div>
                        </SelectItem>
                        <SelectItem value="price-high">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Price: High to Low
                          </div>
                        </SelectItem>
                        <SelectItem value="popular">
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Most Popular
                          </div>
                        </SelectItem>
                        <SelectItem value="rating">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-2" />
                            Highest Rated
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="0-10000">RS 0 - RS 10,000</SelectItem>
                        <SelectItem value="10000-50000">RS 10,000 - RS 50,000</SelectItem>
                        <SelectItem value="50000-100000">RS 50,000 - RS 100,000</SelectItem>
                        <SelectItem value="100000-200000">RS 100,000 - RS 200,000</SelectItem>
                        <SelectItem value="200000+">RS 200,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                {projectsLoading ? "Loading..." : `${filteredProjects.length} Projects Found`}
              </h2>
              {hasActiveFilters && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing filtered results
                </p>
              )}
              {!projectsLoading && filteredProjects.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {startIndex + 1}-{endIndex} of {filteredProjects.length} projects
                </p>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                                 {selectedCategory !== "all" && (
                   <Badge variant="secondary" className="flex items-center gap-1">
                     Category: {categories?.categories?.find((c: string) => c.toLowerCase().replace(/\s+/g, '-') === selectedCategory)}
                     <button
                       onClick={() => setSelectedCategory("all")}
                       className="ml-1 hover:text-destructive"
                     >
                       ×
                     </button>
                   </Badge>
                 )}
                {sortBy !== "newest" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Sort: {sortBy.replace("-", " ")}
                    <button
                      onClick={() => setSortBy("newest")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {priceRange !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: {priceRange}
                    <button
                      onClick={() => setPriceRange("all")}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                )}

              </div>
            </div>
          )}

          {/* Projects Grid/List */}
          {projectsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {getPaginatedProjects().map((project: any) => (
                <ProjectCard 
                  key={project._id} 
                  {...project}
                  className={viewMode === "list" ? "flex" : ""}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse; 