import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Globe } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Verified Developers",
      description: "Connect with pre-vetted developers who have proven track records and expertise."
    },
    {
      icon: <Target className="h-8 w-8 text-success" />,
      title: "Quality Assurance",
      description: "Every project undergoes thorough review to ensure it meets our high standards."
    },
    {
      icon: <Award className="h-8 w-8 text-warning" />,
      title: "Secure Transactions",
      description: "Protected payments and escrow services ensure safe and reliable transactions."
    },
    {
      icon: <Globe className="h-8 w-8 text-tech-blue" />,
      title: "Diverse Projects",
      description: "From web applications to mobile apps, find projects across all technologies."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 via-tech-purple/5 to-tech-blue/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-tech-purple bg-clip-text text-transparent">
              About ProjectFolio
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A trusted marketplace connecting developers with businesses. Buy and sell 
              high-quality software projects with confidence and security.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    ProjectFolio is a premier marketplace designed to bridge the gap between 
                    talented developers and businesses seeking innovative software solutions. 
                    Our platform provides a secure and efficient way to buy and sell 
                    high-quality software projects.
                  </p>
                  <p>
                    We understand that every business has unique needs, and every developer 
                    has unique skills. That's why we've created a platform that not only 
                    facilitates transactions but also ensures quality, security, and 
                    satisfaction for all parties involved.
                  </p>
                  <p>
                    Our mission is to empower developers to monetize their expertise while 
                    helping businesses find the perfect software solutions to drive their 
                    growth and success.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" 
                  alt="Team collaboration" 
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose ProjectFolio</h2>
              <p className="text-xl text-muted-foreground">
                We provide a secure and efficient platform for software project transactions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
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

export default About;