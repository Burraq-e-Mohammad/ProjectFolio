import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Upload, DollarSign, Star, MessageSquare, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Instructions = () => {
  const steps = [
    {
      number: "01",
      title: "Create Your Listing",
      description: "Fill out the project details form with comprehensive information about your software.",
      icon: <Upload className="h-6 w-6 text-primary" />,
      details: [
        "Write a compelling title and description",
        "Upload screenshots and demo videos",
        "Specify technical requirements",
        "Set your price and license terms"
      ]
    },
    {
      number: "02",
      title: "Review & Approval",
      description: "Our team reviews your project to ensure it meets our quality standards.",
      icon: <CheckCircle className="h-6 w-6 text-success" />,
      details: [
        "Code quality assessment",
        "Documentation review",
        "Security vulnerability check",
        "Functionality testing"
      ]
    },
    {
      number: "03",
      title: "Go Live",
      description: "Once approved, your project goes live and becomes available to buyers.",
      icon: <Star className="h-6 w-6 text-warning" />,
      details: [
        "Automatic listing in relevant categories",
        "SEO optimization for better visibility",
        "Featured placement opportunities",
        "Social media promotion"
      ]
    },
    {
      number: "04",
      title: "Get Paid",
      description: "Receive secure payments through our manual payment system when projects are sold.",
      icon: <DollarSign className="h-6 w-6 text-success" />,
      details: [
        "Manual payment verification",
        "Easypaisa & Bank Transfer support",
        "5% platform fee structure",
        "Escrow protection until delivery"
      ]
    }
  ];

  const requirements = [
    {
      title: "Code Quality",
      description: "Clean, well-commented code following best practices",
      icon: <CheckCircle className="h-5 w-5 text-success" />
    },
    {
      title: "Documentation",
      description: "Complete setup instructions and API documentation",
      icon: <MessageSquare className="h-5 w-5 text-primary" />
    },
    {
      title: "Security",
      description: "No vulnerabilities or malicious code",
      icon: <Shield className="h-5 w-5 text-warning" />
    }
  ];

  const tips = [
    "Use high-quality screenshots and demo videos",
    "Write detailed, keyword-rich descriptions",
    "Price competitively based on similar projects",
    "Respond quickly to buyer questions",
    "Provide excellent post-sale support",
    "Keep your projects updated"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 via-success/5 to-warning/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              How to Post Your Project
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Follow our simple step-by-step guide to list your software project 
              and start earning from your development skills.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/post-ad">
                <Upload className="mr-2 h-5 w-5" />
                Start Posting Now
              </Link>
            </Button>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple 4-Step Process</h2>
              <p className="text-xl text-muted-foreground">
                From upload to earning - here's how it works
              </p>
            </div>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                      {/* Step Number & Icon */}
                      <div className="bg-gradient-to-br from-primary/10 to-success/10 p-8 flex items-center justify-center lg:justify-start">
                        <div className="text-center lg:text-left">
                          <div className="text-6xl font-bold text-primary/20 mb-2">{step.number}</div>
                          <div className="flex items-center justify-center lg:justify-start mb-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background shadow-md">
                              {step.icon}
                            </div>
                          </div>
                          <h3 className="text-xl font-bold">{step.title}</h3>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="p-8">
                        <p className="text-muted-foreground mb-6">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                              <span className="text-sm">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Visual Element */}
                      <div className="bg-muted/30 p-8 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
                          <div className="text-3xl text-primary-foreground">
                            {step.icon}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Project Requirements</h2>
                <p className="text-muted-foreground mb-8">
                  To maintain our high quality standards, all projects must meet these requirements:
                </p>
                
                <div className="space-y-4">
                  {requirements.map((req, index) => (
                    <Card key={index} className="p-4">
                      <CardContent className="p-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                            {req.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{req.title}</h3>
                            <p className="text-sm text-muted-foreground">{req.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-6">Pro Tips for Success</h2>
                <p className="text-muted-foreground mb-8">
                  Follow these tips to maximize your project's visibility and sales:
                </p>
                
                <div className="space-y-3">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Badge variant="secondary" className="mt-1 flex-shrink-0">
                        {index + 1}
                      </Badge>
                      <p className="text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
                
                <Card className="mt-8 p-6 bg-gradient-to-br from-success/10 to-primary/10 border-success/20">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-4">
                      <Star className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Featured Listing</h3>
                        <p className="text-sm text-muted-foreground">
                          Want your project to get more visibility? Consider upgrading to a 
                          featured listing for increased exposure and higher sales potential.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <Card className="p-8 bg-gradient-to-r from-primary/10 via-success/10 to-warning/10 border-primary/20">
              <CardContent className="text-center p-0">
                <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who are already earning from their projects. 
                  Start your journey today!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/post-ad">
                      <Upload className="mr-2 h-5 w-5" />
                      Post Your Project
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/contact">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Get Help
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Instructions;