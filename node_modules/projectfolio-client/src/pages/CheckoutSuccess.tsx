import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Home, 
  ShoppingBag 
} from "lucide-react";
import { Link } from "react-router-dom";

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart from localStorage after successful checkout
    localStorage.removeItem('cart');
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Success Section */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="container max-w-2xl">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-green-800">
                  Payment Successful!
                </CardTitle>
                <CardDescription className="text-lg">
                  Thank you for your purchase. Your order has been processed successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Confirmation Email Sent</h4>
                      <p className="text-sm text-blue-700">
                        We've sent a confirmation email with your purchase details and download links.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Download className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Instant Access</h4>
                      <p className="text-sm text-green-700">
                        You can now download your purchased projects immediately from your account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">What's Next?</h3>
                  <div className="text-left space-y-2 text-sm text-muted-foreground">
                    <p>• Check your email for download instructions</p>
                    <p>• Access your projects from your account dashboard</p>
                    <p>• Contact support if you need any assistance</p>
                    <p>• Leave a review for the projects you purchased</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="flex-1">
                    <Link to="/my-projects">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      View My Projects
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Home
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

export default CheckoutSuccess; 