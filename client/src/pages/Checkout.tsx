import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cartAPI, manualPaymentsAPI } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, CreditCard, ArrowLeft, CheckCircle, Package, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ManualPayment from "@/components/payment/ManualPayment";
import MultiProjectPayment from "@/components/payment/MultiProjectPayment";

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cart, isLoading: cartLoading, error: cartError } = useQuery({
    queryKey: ['cart'],
    queryFn: cartAPI.getCart,
    enabled: !!user,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await manualPaymentsAPI.createPayment(data);
    },
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Payment Order Created",
        description: "Your payment order has been created successfully.",
      });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to create payment order';
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const createMultiPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await manualPaymentsAPI.createPayment(data);
    },
    onSuccess: (payments) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Payment Orders Created",
        description: "Your payment orders have been created successfully.",
      });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to create payment orders';
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    },
  });

  const handlePaymentSuccess = async (payment: any) => {
    try {
      // Clear the cart after successful payment creation
      await cartAPI.clearCart();
      
      toast({
        title: "Payment Order Created!",
        description: "Your payment order has been created successfully. Please follow the instructions to complete payment.",
      });
      
      // Navigate to payment instructions page with payment ID
      navigate('/payment-instructions', { 
        state: { 
          paymentIds: [payment._id] 
        } 
      });
    } catch (error) {
      // Still show success message even if cart clearing fails
      toast({
        title: "Payment Order Created!",
        description: "Your payment order has been created successfully. Please follow the instructions to complete payment.",
      });
    }
  };

  const handleMultiPaymentSuccess = async (payments: any[]) => {
    try {
      // Clear the cart after successful payment creation
      await cartAPI.clearCart();
      
      const paymentIds = payments.map(payment => payment._id);
      // Navigate to payment instructions page with payment IDs
      navigate('/payment-instructions', { 
        state: { 
          paymentIds: paymentIds
        } 
      });
    } catch (error) {
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading checkout...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cartItems = cart?.data?.data?.items || [];
  const subtotal = cart?.data?.data?.total || 0;
  const platformFee = subtotal * 0.05;
  const total = subtotal; // Platform fee is charged to seller, not added to buyer's total
  
  // Filter out items with null projects for accurate count and display
  const validCartItems = cartItems.filter((item: any) => item.project);



  if (validCartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6">
                Add some projects to your cart before proceeding to checkout
              </p>
              <Button asChild>
                <Link to="/browse">
                  Browse Projects
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-success/5 to-blue-500/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Checkout
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete your purchase securely
            </p>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div>
              {validCartItems.length === 1 ? (
                <ManualPayment
                  projectId={validCartItems[0]?.project?._id || ''}
                  amount={total}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              ) : (
                <MultiProjectPayment
                  cartItems={validCartItems}
                  onSuccess={handleMultiPaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                                     {/* Cart Items */}
                   <div className="space-y-3">
                     {validCartItems.map((item: any) => (
                      <div key={item._id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.project?.title || 'Project Not Available'}</h4>
                          <p className="text-xs text-muted-foreground">
                            by {item.project?.seller?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">RS {item.project?.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>RS {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Platform Fee</span>
                      <span>RS {platformFee.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>RS {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment Method Info */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">Payment Method</h4>
                    <p className="text-sm text-muted-foreground">
                      Manual payment via EasyPaisa or Bank Transfer. You'll receive detailed instructions after creating the payment order.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout; 