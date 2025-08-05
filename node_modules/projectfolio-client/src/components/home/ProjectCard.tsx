import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, Download, Heart, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface ProjectCardProps {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  rating?: number;
  reviews?: number;
  views?: number;
  downloads?: number;
  images: string[];
  featured?: boolean;
  seller?: any;
  createdAt?: string;
}

const ProjectCard = ({ 
  _id, 
  title, 
  description, 
  price, 
  category, 
  rating = 0, 
  reviews = 0, 
  views = 0, 
  downloads = 0, 
  images = [],
  featured = false,
  seller,
  createdAt
}: ProjectCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Use the first image as the main display image, or null if no images
  const mainImage = images && images.length > 0 ? images[0] : null;
  
  // Check if the image is a placeholder that should be replaced
  const isPlaceholderImage = mainImage && (
    mainImage.includes('via.placeholder.com') || 
    mainImage.includes('placeholder-project')
  );
  
  // Get a category-specific fallback image with optimized sizes
  const getFallbackImage = (category: string) => {
    const fallbackImages: { [key: string]: string } = {
      'Web Application': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop&q=80',
      'Mobile App': 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop&q=80',
      'Desktop Software': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&q=80',
      'AI/ML': 'https://images.unsplash.com/photo-1673187736167-4d9c0ac262df?w=400&h=300&fit=crop&q=80',
      'Business Software': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop&q=80',
      'Analytics': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80',
      'Finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&q=80',
      'E-commerce': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80',
      'Game Development': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop&q=80',
      'DevOps Tools': 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop&q=80'
    };
    return fallbackImages[category] || fallbackImages['Web Application'];
  };
  
  // Always use the actual project image if it exists and is not a placeholder
  const displayImage = mainImage && !isPlaceholderImage ? mainImage : getFallbackImage(category);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      {featured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="destructive" className="bg-gradient-to-r from-warning to-warning/80">
            Featured
          </Badge>
        </div>
      )}
      
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {/* Loading State */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {/* Show images with fallback and lazy loading */}
          {displayImage && !imageError ? (
            <img 
              src={displayImage} 
              alt={title}
              loading="lazy"
              className={`w-full h-full object-contain bg-muted group-hover:scale-105 transition-transform duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : null}
          
          {/* Placeholder when no image or image fails */}
          {(imageError || !displayImage) && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-sm font-medium">Project Image</div>
              </div>
            </div>
          )}
         
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-3 right-3 bg-background/80 hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-medium">{rating}</span>
            <span>({reviews})</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-4 w-4" />
            <span>{downloads}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            RS {price ? price.toLocaleString() : 'Price not available'}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
          <Link to={`/project/${_id}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;