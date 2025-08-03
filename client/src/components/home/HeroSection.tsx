import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, TrendingUp, Shield, Users } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBanner} 
          alt="Software Marketplace" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/95" />
      </div>

      {/* Content */}
      <div className="container relative z-10 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-tech-purple to-tech-blue bg-clip-text text-transparent">
            Buy & Sell Software Projects
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A secure marketplace for buying and selling software projects. 
            Connect with verified developers and find the perfect solution for your needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8" asChild>
              <Link to="/browse">
                <Search className="mr-2 h-5 w-5" />
                Browse Projects
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link to="/post-ad">
                <TrendingUp className="mr-2 h-5 w-5" />
                Sell Your Project
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-muted-foreground">Verified Developers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div className="text-2xl font-bold text-success">200+</div>
              <div className="text-muted-foreground">Projects Available</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-tech-blue/10">
                <Shield className="h-6 w-6 text-tech-blue" />
              </div>
              <div className="text-2xl font-bold text-tech-blue">100%</div>
              <div className="text-muted-foreground">Secure Transactions</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;