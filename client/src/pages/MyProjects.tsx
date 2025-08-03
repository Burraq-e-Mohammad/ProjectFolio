import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { projectsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { 
  ShoppingBag, 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Loader2,
  Package,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ImageUpload from "@/components/upload/ImageUpload";

const MyProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    images: [] as string[]
  });

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['myProjects'],
    queryFn: projectsAPI.getMyProjects,
    enabled: !!user,
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: string; projectData: any }) => 
      projectsAPI.update(data.id, data.projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      setEditingProject(null);
      toast({
        title: "Project Updated",
        description: "Your project has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: string) => projectsAPI.delete(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast({
        title: "Project Deleted",
        description: "Your project has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setEditForm({
      title: project.title,
      description: project.description,
      category: project.category,
      price: project.price.toString(),
      images: project.images || []
    });
  };

  const handleEditInPostAd = (project: any) => {
    // Navigate to PostAd page with project data
    navigate('/post-ad', { 
      state: { 
        editMode: true, 
        projectData: project 
      } 
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    setEditForm(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const removeImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleUpdate = () => {
    if (!editingProject) return;
    
    updateProjectMutation.mutate({
      id: editingProject._id,
      projectData: {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        price: parseFloat(editForm.price),
        images: editForm.images
      }
    });
  };

  const handleDelete = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  const categories = [
    "Web Application",
    "Mobile App",
    "Desktop Software",
    "AI/ML",
    "Business Software",
    "Analytics",
    "Finance",
    "E-commerce",
    "Game Development",
    "DevOps Tools"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your projects...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const userProjects = projects?.data?.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-success/5 to-blue-500/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Manage and track all your submitted projects
            </p>
          </div>
        </section>

        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Your Projects ({userProjects.length})</h2>
              <p className="text-muted-foreground">
                View, edit, and manage your project listings
              </p>
            </div>
            <Button asChild>
              <Link to="/post-ad">
                <Plus className="mr-2 h-4 w-4" />
                Add New Project
              </Link>
            </Button>
          </div>

          {userProjects.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by creating your first project listing
                </p>
                <Button asChild>
                  <Link to="/post-ad">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project: any) => (
                <Card key={project._id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{project.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              RS {project.price}
                            </span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {project.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        <Badge variant={
                          project.status === 'pending' ? 'secondary' :
                          project.status === 'available' ? 'default' :
                          project.status === 'sold' ? 'destructive' :
                          project.status === 'rejected' ? 'destructive' :
                          'outline'
                        }>
                          {project.status === 'pending' ? 'Pending Approval' :
                           project.status === 'available' ? 'Available' :
                           project.status === 'sold' ? 'Sold' :
                           project.status === 'rejected' ? 'Rejected' :
                           project.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          // Show project details in a simple alert for now
                          alert(`Project: ${project.title}\nDescription: ${project.description}\nPrice: RS ${project.price}\nCategory: ${project.category}\nStatus: ${project.status}`);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Dialog onOpenChange={(open) => {
                        if (open) {
                          handleEdit(project);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                            <DialogDescription>
                              Make changes to your project here. Click save when you're done.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div>
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="category">Category</Label>
                                <Select 
                                  value={editForm.category} 
                                  onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="price">Price (PKR)</Label>
                                <Input
                                  id="price"
                                  type="number"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                                />
                              </div>
                            </div>
                            
                            {/* Images Section */}
                            <div>
                              <Label>Project Images</Label>
                              <div className="mt-2 space-y-4">
                                {/* Current Images */}
                                {editForm.images.length > 0 && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Current Images:</p>
                                    <div className="grid grid-cols-3 gap-2">
                                      {editForm.images.map((image, index) => (
                                        <div key={index} className="relative group aspect-video">
                                          <img
                                            src={image}
                                            alt={`Project image ${index + 1}`}
                                            className="w-full h-full object-contain rounded-md bg-muted"
                                            onError={(e) => {
                                              e.currentTarget.src = '/placeholder-project.jpg';
                                            }}
                                          />
                                          <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeImage(index)}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Add New Images */}
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">Add New Images:</p>
                                  <ImageUpload
                                    onUploadSuccess={handleImageUpload}
                                    maxFiles={5 - editForm.images.length}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => handleEditInPostAd(editingProject)}
                            >
                              Edit in Post Ad Page
                            </Button>
                            <Button 
                              onClick={handleUpdate}
                              disabled={updateProjectMutation.isPending}
                            >
                              {updateProjectMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your project
                              "{project.title}" and remove it from the marketplace.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(project._id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteProjectMutation.isPending}
                            >
                              {deleteProjectMutation.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                'Delete Project'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProjects; 