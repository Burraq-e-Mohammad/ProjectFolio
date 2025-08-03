import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle, Star, Clock, DollarSign, Users, Award } from "lucide-react";

const WhyUs = () => {
  const trustFeatures = [
    {
      icon: <Shield className="h-8 w-8 text-success" />,
      title: "Secure Transactions",
      description: "All payments are protected with bank-level security and escrow services.",
      badge: "100% Safe"
    },
    {
      icon: <Lock className="h-8 w-8 text-primary" />,
      title: "Data Protection",
      description: "Your personal and project data is encrypted and stored securely.",
      badge: "SSL Encrypted"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-success" />,
      title: "Quality Assurance",
      description: "Every project is reviewed and tested before being listed on our platform.",
      badge: "Verified"
    },
    {
      icon: <Star className="h-8 w-8 text-warning" />,
      title: "Rated Projects",
      description: "Community-driven ratings help you find the best projects for your needs.",
      badge: "5-Star System"
    }
  ];

  const benefits = [
    {
      icon: <Clock className="h-6 w-6 text-tech-blue" />,
      title: "Save Time",
      description: "Find ready-made solutions instead of building from scratch."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-success" />,
      title: "Cost Effective",
      description: "Get professional software at a fraction of custom development cost."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Expert Network",
      description: "Connect with experienced developers and software architects."
    },
    {
      icon: <Award className="h-6 w-6 text-warning" />,
      title: "Quality Guaranteed",
      description: "Money-back guarantee if the project doesn't meet expectations."
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime", description: "Reliable service you can count on" },
    { number: "< 24h", label: "Support Response", description: "Fast resolution of any issues" },
    { number: "256-bit", label: "SSL Encryption", description: "Military-grade security" },
    { number: "RS 500K+", label: "Secured Transactions", description: "Total value protected" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-success/5 via-primary/5 to-tech-blue/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
              Why Choose ProjectFolio?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your trust and security are our top priorities. Here's why developers 
              and businesses choose our platform for their software project needs.
            </p>
          </div>
        </section>

        {/* Trust & Security Features */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Trust & Security First</h2>
              <p className="text-xl text-muted-foreground">
                We've built our platform with security and trust as the foundation
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustFeatures.map((feature, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="mb-3">
                      {feature.badge}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Security Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Security by the Numbers</h2>
              <p className="text-xl text-muted-foreground">
                Our commitment to security is backed by real metrics
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6 bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-lg font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Developers & Businesses Love Us</h2>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted/50 flex-shrink-0">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop" 
                  alt="Secure development" 
                  className="rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-6 -left-6 bg-background border rounded-lg p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-8 w-8 text-success" />
                    <div>
                      <div className="font-semibold">100% Secure</div>
                      <div className="text-sm text-muted-foreground">Guaranteed Protection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-muted-foreground">
                Real feedback from our community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "The security measures give me complete peace of mind when buying software projects.",
                  author: "Alex Thompson",
                  role: "Startup Founder",
                  rating: 5
                },
                {
                  quote: "I've sold over 20 projects here. The platform is reliable and payments are always secure.",
                  author: "Maria Garcia",
                  role: "Full-Stack Developer",
                  rating: 5
                },
                {
                  quote: "Quality projects, fair prices, and excellent customer support. Highly recommended!",
                  author: "James Wilson",
                  role: "Product Manager",
                  rating: 5
                }
              ].map((testimonial, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WhyUs;