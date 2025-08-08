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
import { Upload, X, Eye, DollarSign, Code, Image as ImageIcon, Mail, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/upload/ImageUpload";
import { projectsAPI } from "@/lib/api";

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
  "DevOps Tools",
  "Scripts",
  "Hardware",
  "Extension",
  "Other"
];

const PostAd = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const editMode = location.state?.editMode || false;
  const projectData = location.state?.projectData || null;
  
  const [images, setImages] = useState<string[]>(projectData?.images || []);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [qualityChecked, setQualityChecked] = useState(false);

  // Add at the top, after useState for projectData:
  const [title, setTitle] = useState(projectData?.title || "");
  const [description, setDescription] = useState(projectData?.description || "");
  const [selectedCategory, setSelectedCategory] = useState(
    projectData?.category && categories.includes(projectData.category)
      ? projectData.category
      : ""
  );
  const [price, setPrice] = useState(projectData?.price || "");
  const [whatsappNumber, setWhatsappNumber] = useState(projectData?.whatsappNumber || "");

  // Validation for required fields
  const isFormValid = () => {
    return (
      !!title.trim() &&
      !!description.trim() &&
      !!selectedCategory &&
      !!price &&
      images.length > 0 &&
      !!whatsappNumber.trim() &&
      termsChecked &&
      qualityChecked
    );
  };
  
  const DEFAULT_INCLUDED = [
    "Complete Source Code",
    "Documentation",
    "Installation Guide",
    "API Documentation",
    "Database Schema",
    "Unit Tests",
    "Video Tutorial",
    "6 Months Support"
  ];
  
  const [whatsIncludedItems, setWhatsIncludedItems] = useState<string[]>(projectData?.whatsIncluded?.filter((item: string) => !DEFAULT_INCLUDED.includes(item)) || []);
  const [checkedIncluded, setCheckedIncluded] = useState<string[]>(projectData?.whatsIncluded || []);
  const [newIncluded, setNewIncluded] = useState("");

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
      window.location.reload(); // Refresh the page to show changes
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
      window.location.reload(); // Refresh the page to show changes
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

  const addIncludedItem = () => {
    if (newIncluded.trim() && !whatsIncludedItems.includes(newIncluded.trim())) {
      setWhatsIncludedItems([...whatsIncludedItems, newIncluded.trim()]);
      setCheckedIncluded([...checkedIncluded, newIncluded.trim()]);
      setNewIncluded("");
    }
  };
  const removeIncludedItem = (item: string) => {
    setWhatsIncludedItems(whatsIncludedItems.filter(i => i !== item));
    setCheckedIncluded(checkedIncluded.filter(i => i !== item));
  };
  const toggleIncluded = (item: string) => {
    setCheckedIncluded(checkedIncluded.includes(item)
      ? checkedIncluded.filter(i => i !== item)
      : [...checkedIncluded, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setIsSubmitting(true);
    
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
      title: title,
      description: description,
      category: selectedCategory,
      price: parseFloat(price),
      images: images,
      whatsIncluded: checkedIncluded,
      whatsappNumber: whatsappNumber
    };

    if (editMode && projectData) {
      // Update existing project
      updateProjectMutation.mutate({
        id: projectData._id,
        projectData: submitData
      }, {
        onSettled: () => setIsSubmitting(false)
      });
    } else {
      // Create new project
      createProjectMutation.mutate(submitData, {
        onSettled: () => setIsSubmitting(false)
      });
    }
  };

  const technologies = [
    "React", "Vue", "Angular", "Node.js", "Python", "Django", "Laravel", "Flutter",
    "React Native", "Java", "C#", ".NET", "PHP", "Ruby", "Go", "Rust"
  ];

  // When using categories, default to [] if undefined:
  const categoriesSafe = Array.isArray(categories) ? categories : [];

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
                      value={title}
                      onChange={e => setTitle(e.target.value)}
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
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select name="category" required value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesSafe.map((category) => (
                            <SelectItem key={category} value={category}>
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
                          placeholder="e.g., 50000"
                          className="no-spinner"
                          value={price}
                          onChange={e => setPrice(e.target.value)}
                          min={0}
                          step={1}
                          required
                        />
                      </div>
                    
                    <div>
                      <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                      <Input 
                        id="whatsappNumber" 
                        name="whatsapp"
                        type="tel" 
                        placeholder="e.g., +923001234567"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Include country code (e.g., +92 for Pakistan)
                      </p>
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
                  
                  {/* Remove Demo URL and Tags UI sections */}
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>What's Included <span className="text-xs text-muted-foreground">(Optional)</span></span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2">
                    {/* Default Items */}
                    <div className="flex flex-col gap-2">
                      {DEFAULT_INCLUDED.map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox
                            id={`included-default-${item}`}
                            checked={checkedIncluded.includes(item)}
                            onCheckedChange={() => toggleIncluded(item)}
                          />
                          <Label htmlFor={`included-default-${item}`}>{item}</Label>
                        </div>
                      ))}
                    </div>
                    {/* Custom Add */}
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newIncluded}
                        onChange={e => setNewIncluded(e.target.value)}
                        placeholder="Add an item (e.g., Source Code, Docs)"
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addIncludedItem())}
                      />
                      <Button type="button" variant="outline" onClick={addIncludedItem}>
                        Add
                      </Button>
                    </div>
                    {/* Custom Items */}
                    <div className="flex flex-col gap-2 mt-2">
                      {whatsIncludedItems.length === 0 && (
                        <span className="text-sm text-muted-foreground">No custom items added yet.</span>
                      )}
                      {whatsIncludedItems.map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <Checkbox
                            id={`included-${item}`}
                            checked={checkedIncluded.includes(item)}
                            onCheckedChange={() => toggleIncluded(item)}
                          />
                          <Label htmlFor={`included-${item}`}>{item}</Label>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeIncludedItem(item)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Submit */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required checked={termsChecked} onCheckedChange={val => setTermsChecked(val === true)} />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the Terms of Service and confirm that I own all rights to this project
                      </Label>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox id="quality" required checked={qualityChecked} onCheckedChange={val => setQualityChecked(val === true)} />
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
                      disabled={!isFormValid() || isSubmitting || updateProjectMutation.isPending}
                    >
                      {isSubmitting || updateProjectMutation.isPending ? (
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