import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { projectsAPI, cartAPI } from "@/lib/api";
import axios from "axios";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Star, 
  Calendar,
  User,
  DollarSign,
  Tag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [views, setViews] = useState<number>(0);

  // Fetch project data
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsAPI.getById(id),
    enabled: !!id,
  });

  // Update views when project data is loaded
  useEffect(() => {
    if (response?.data?.data) {
      setViews(response.data.data.views || 0);
    }
  }, [response?.data?.data]);

  // Fetch cart data to check if project is already in cart
  const { data: cartResponse } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.getCart(),
    enabled: !!user && !!id,
  });

  // Check if project is already in cart
  const isProjectInCart = () => {
    if (!cartResponse?.data?.data?.items) return false;
    const cartItems = cartResponse.data.data.items;
    return cartItems.some((item: any) => item.project?._id === id);
  };

  const deleteMutation = useMutation({
    mutationFn: () => projectsAPI.delete(id!),
    onSuccess: () => {
      toast({
        title: "Project Deleted",
        description: "Your project has been successfully deleted.",
      });
      navigate("/");
      window.location.reload(); // Refresh the page to show changes
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleEdit = () => {
    navigate('/post-ad', { 
      state: { 
        editMode: true, 
        projectData: response?.data?.data 
      } 
    });
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to purchase this project",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Check if project is already in cart
    if (isProjectInCart()) {
      toast({
        title: "Project Already in Cart",
        description: "This project is already in your cart. You can view it in your cart or proceed to checkout.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await cartAPI.addToCart(id!);
      
      // Invalidate cart query to refresh the cart data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast({
        title: "Added to Cart",
        description: "Project has been added to your cart",
      });
      navigate("/cart");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const nextImage = () => {
    if (response?.data?.data?.images && currentImageIndex < response.data.data.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading project details...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !response?.data?.data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/">Go Back Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const project = response.data.data; // Access the nested data property
  const isOwner = user?._id === project.seller?._id;
  const projectInCart = isProjectInCart();
  

  
  // Get the current image to display
  const currentImage = project.images?.[currentImageIndex];
  
  // Get fallback image based on category
  const getFallbackImage = (category: string) => {
    const fallbackImages: { [key: string]: string } = {
      'Web Application': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      'Mobile App': 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop',
      'Desktop Software': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
      'AI/ML': 'https://images.unsplash.com/photo-1673187736167-4d9c0ac262df?w=800&h=600&fit=crop',
      'Business Software': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      'Analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      'Finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
      'E-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      'Game Development': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
      'DevOps Tools': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=600&fit=crop'
    };
    return fallbackImages[category] || fallbackImages['Web Application'];
  };

  const displayImage = currentImage || getFallbackImage(project.category);
  

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container py-4">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <div className="container max-w-6xl pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                 <img
                   src={displayImage}
                   alt={project.title}
                   className="w-full h-full object-contain bg-muted"
                   onError={(e) => {
                     const fallbackImage = getFallbackImage(project.category);
                     e.currentTarget.src = fallbackImage;
                   }}
                 />
                
                {/* Navigation Arrows */}
                {project.images && project.images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={nextImage}
                      disabled={currentImageIndex === project.images.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {project.images && project.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {project.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-video rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground'
                      }`}
                    >
                                             <img
                         src={image || getFallbackImage(project.category)}
                         alt={`${project.title} ${index + 1}`}
                         className="w-full h-full object-contain bg-muted"
                         onError={(e) => {
                           const fallbackImage = getFallbackImage(project.category);
                           e.currentTarget.src = fallbackImage;
                         }}
                       />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.createdAt 
                            ? new Date(project.createdAt).toLocaleDateString() 
                            : 'Date not available'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this project? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <Badge variant="secondary">{project.category}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{views} views</span>
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary mb-6">
                  RS {project.price ? project.price.toLocaleString() : 'Price not available'}
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Description</h3>
                  {project.description && (
                    <span className="text-xs text-muted-foreground">
                      {project.description.length} characters
                    </span>
                  )}
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                    {project.description && project.description.length > 300 && !showFullDescription 
                      ? `${project.description.substring(0, 300)}...`
                      : project.description || 'No description available'
                    }
                  </div>
                  {project.description && project.description.length > 300 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="mt-2 text-primary hover:text-primary/80"
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Demo URL */}
              {project.demoUrl && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Demo</h3>
                  <Button variant="outline" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live Demo
                    </a>
                  </Button>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                {projectInCart ? (
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full" size="lg" disabled>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Already in Cart
                    </Button>
                    <Button variant="default" className="w-full" size="lg" asChild>
                      <Link to="/cart">
                        View Cart
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" size="lg" onClick={handlePurchase}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Purchase Project
                  </Button>
                )}
                <Button variant="outline" className="w-full" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download Preview
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {project.whatsIncluded && project.whatsIncluded.length > 0 && (
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.whatsIncluded.map((item: string) => (
                      <div key={item} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetails; 