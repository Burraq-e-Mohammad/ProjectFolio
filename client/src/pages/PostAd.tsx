import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Eye, DollarSign, Tag, Code, Image as ImageIcon, Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/upload/ImageUpload";
import { projectsAPI } from "@/lib/api";

const PostAd = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const editMode = location.state?.editMode || false;
  const projectData = location.state?.projectData || null;
  
  const [tags, setTags] = useState<string[]>(projectData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [images, setImages] = useState<string[]>(projectData?.images || []);
  const [resendingVerification, setResendingVerification] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
  };

  const sendVerificationEmail = async () => {
    setResendingVerification(true);
    try {
      await authAPI.resendVerificationEmail(user?.email || '');
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendingVerification(false);
    }
  };

  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: string; projectData: any }) => 
      projectsAPI.update(data.id, data.projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast({
        title: "Project Updated!",
        description: "Your project has been updated successfully.",
      });
      navigate('/my-projects');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return await projectsAPI.create(data);
    },
    onSuccess: (response) => {
      toast({
        title: "Project Posted Successfully!",
        description: "Your project has been submitted and is pending admin approval. You will be notified once it's approved and available on the website.",
        variant: "default",
        duration: 8000, // Show for 8 seconds instead of default 5 seconds
      });
      navigate('/my-projects');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to create project';
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is verified
    if (!user?.isVerified) {
      toast({
        title: "Email Verification Required",
        description: "Please verify your email address before posting projects.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    const submitData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      price: parseFloat(formData.get('price') as string),
      demoUrl: formData.get('demo-url') as string,
      tags: tags,
      images: images
    };

    if (editMode && projectData) {
      // Update existing project
      updateProjectMutation.mutate({
        id: projectData._id,
        projectData: submitData
      });
    } else {
      // Create new project
      createProjectMutation.mutate(submitData);
    }
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

  const technologies = [
    "React", "Vue", "Angular", "Node.js", "Python", "Django", "Laravel", "Flutter",
    "React Native", "Java", "C#", ".NET", "PHP", "Ruby", "Go", "Rust"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-success/5 to-tech-blue/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              {editMode ? "Edit Your Project" : "Post Your Project"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {editMode 
                ? "Update your project details and images below."
                : "Share your software project with thousands of potential buyers. Fill out the form below to get started."
              }
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16">
          <div className="container max-w-4xl">
            {/* Email Verification Check */}
            {!user?.isVerified && (
              <Card className="mb-8 border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <AlertCircle className="h-6 w-6 text-orange-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-800 mb-2">
                        Email Verification Required
                      </h3>
                      <p className="text-orange-700 mb-4">
                        You need to verify your email address before you can post projects. 
                        This helps us maintain a secure and trustworthy marketplace.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                                                 <Button
                           onClick={sendVerificationEmail}
                           disabled={resendingVerification}
                           variant="outline"
                           className="border-orange-300 text-orange-700 hover:bg-orange-100"
                         >
                           {resendingVerification ? (
                             <>
                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                               Sending...
                             </>
                           ) : (
                             <>
                               <Mail className="h-4 w-4 mr-2" />
                               Send Verification Email
                             </>
                           )}
                         </Button>
                        <Button
                          variant="outline"
                          asChild
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          <a href="mailto:support@projectfolio.com">
                            Contact Support
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Success Message */}
            {user?.isVerified && (
              <Card className="mb-8 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        Email Verified ✓
                      </h3>
                      <p className="text-green-700">
                        Your email is verified. You can now post projects!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className={`space-y-8 ${!user?.isVerified ? 'opacity-60' : ''}`}>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input 
                      id="title" 
                      name="title"
                      placeholder="e.g., Complete E-commerce Dashboard with Analytics"
                      className="mt-1"
                      defaultValue={projectData?.title || ''}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      name="description"
                      placeholder="Describe your project in detail..."
                      className="mt-1"
                      rows={6}
                      defaultValue={projectData?.description || ''}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required defaultValue={projectData?.category || ''}>
                        <SelectTrigger className="mt-1">
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
                        <Label htmlFor="price">Price (PKR) *</Label>
                        <Input 
                          id="price" 
                          name="price"
                          type="number" 
                          placeholder="299"
                          defaultValue={projectData?.price || ''}
                          required
                        />
                      </div>
                  </div>
                </CardContent>
              </Card>

              {/* Media & Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5" />
                    <span>Media & Tags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Project Images *</Label>
                    <ImageUpload 
                      onUploadSuccess={handleImageUpload}
                      onRemoveImage={(index) => {
                        setImages(prev => prev.filter((_, i) => i !== index));
                      }}
                      existingImages={images}
                      maxFiles={5}
                      maxSize={5}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="demo-url">Demo URL (Optional)</Label>
                    <Input 
                      id="demo-url" 
                      name="demo-url"
                      placeholder="https://your-demo-site.com"
                      className="mt-1"
                      defaultValue={projectData?.demoUrl || ''}
                    />
                  </div>
                  
                  <div>
                    <Label>Tags</Label>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:bg-muted rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" variant="outline" onClick={addTag}>
                          <Tag className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Submit */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the Terms of Service and confirm that I own all rights to this project
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox id="quality" required />
                      <Label htmlFor="quality" className="text-sm">
                                                 I confirm that this project meets ProjectFolio's quality standards
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox id="updates" />
                      <Label htmlFor="updates" className="text-sm">
                        Send me updates about my listing and marketplace news
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={!user?.isVerified || updateProjectMutation.isPending}
                    >
                      {updateProjectMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {editMode ? "Updating..." : "Submitting..."}
                        </>
                      ) : (
                        user?.isVerified 
                          ? (editMode ? "Update Project" : "Submit Project") 
                          : "Email Verification Required"
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={!user?.isVerified}
                      onClick={() => navigate('/my-projects')}
                    >
                      {editMode ? "Cancel" : "Save as Draft"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PostAd;