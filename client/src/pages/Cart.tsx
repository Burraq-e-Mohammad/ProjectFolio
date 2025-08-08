import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cartAPI } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Trash2, 
  DollarSign, 
  ArrowRight,
  Loader2,
  Package,
  CreditCard
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Cart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [dealCompleted, setDealCompleted] = useState(false);

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: cartAPI.getCart,
    enabled: !!user,
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (projectId: string) => cartAPI.removeFromCart(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Item Removed",
        description: "Project has been removed from your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartAPI.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  const handleRemoveItem = (projectId: string) => {
    removeFromCartMutation.mutate(projectId);
  };

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  const toggleDescription = (projectId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading cart...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cartItems = cart?.data?.data?.items || [];
  const total = cart?.data?.data?.total || 0;
  
  // Filter out items with null projects for accurate count
  const validCartItems = cartItems.filter((item: any) => item.project);
  
  // If no items in cart, show empty state
  if (validCartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/browse">
                  Browse Projects
                </Link>
              </Button>
            </div>
          </div>
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
              Shopping Cart
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Review your selected projects and proceed to checkout
            </p>
          </div>
        </section>

        <div className="container py-8">
          {validCartItems.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-6">
                  Start browsing projects to add them to your cart
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild>
                    <Link to="/browse">
                      Browse Projects
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/">
                      Go Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                                 <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold">Cart Items ({validCartItems.length})</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearCart}
                    disabled={clearCartMutation.isPending}
                  >
                    {clearCartMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Clear Cart
                  </Button>
                </div>

                                 {validCartItems.map((item: any) => (
                  <Card key={item._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 break-words">
                                {item.project?.title || 'Project Not Available'}
                              </h3>
                              <div className="mb-2">
                                <p className="text-muted-foreground text-sm whitespace-pre-wrap break-words">
                                  {item.project?.description && item.project.description.length > 150 && !expandedDescriptions.has(item.project._id)
                                    ? `${item.project.description.substring(0, 150)}...`
                                    : item.project?.description || 'Description not available'
                                  }
                                </p>
                                {item.project?.description && item.project.description.length > 150 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 text-primary hover:text-primary/80 p-0 h-auto text-xs"
                                    onClick={() => toggleDescription(item.project._id)}
                                  >
                                    {expandedDescriptions.has(item.project._id) ? 'Show Less' : 'Read More'}
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 flex-wrap">
                                <Badge variant="secondary">{item.project?.category || 'Unknown'}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  by {item.project?.seller?.name || 'Unknown'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 min-w-[120px]">
                              <div className="text-xl font-bold text-primary">
                                RS {item.project?.price || 0}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.project?._id || item._id)}
                                disabled={removeFromCartMutation.isPending}
                                className="mt-2"
                              >
                                {removeFromCartMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                                         <div className="space-y-2">
                                              <div className="flex justify-between">
                          <span>Subtotal ({validCartItems.length} items)</span>
                         <span>RS {total}</span>
                       </div>
                       <div className="flex justify-between text-sm text-muted-foreground">
                         <span>Platform Fee (5% - charged to seller)</span>
                         <span>-RS {(total * 0.05).toFixed(2)}</span>
                       </div>
                       <Separator />
                       <div className="flex justify-between font-bold text-lg">
                         <span>Total</span>
                         <span>RS {total}</span>
                       </div>
                     </div>

                    <div className="space-y-3">
                      {/* Make a Deal Button */}
                      {!dealCompleted && (
                        <Button className="w-full mb-2" variant="secondary" onClick={() => setDealModalOpen(true)}>
                          Make a Deal
                        </Button>
                      )}
                      {/* Modal for WhatsApp instructions */}
                      <Dialog open={dealModalOpen} onOpenChange={setDealModalOpen}>
                        <DialogContent className="max-w-md mx-auto text-center">
                          <h2 className="text-xl font-bold mb-4">Contact Us on WhatsApp</h2>
                          <p className="mb-4 text-base">
                            Contact us on WhatsApp at <span className="font-semibold">03165687188</span> to get project authentic verification from client by asking your queries regarding project or asking for the delivery of project procedure or you want a video of working project.
                          </p>
                          <Button className="w-full" onClick={() => { setDealCompleted(true); setDealModalOpen(false); }}>
                            Complete
                          </Button>
                        </DialogContent>
                      </Dialog>
                      {/* Proceed to Checkout Button (locked until deal completed) */}
                      <Button className="w-full" size="lg" onClick={handleCheckout} disabled={!dealCompleted}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/browse">
                          Continue Shopping
                        </Link>
                      </Button>
                    </div>

                                         <div className="text-xs text-muted-foreground space-y-1">
                       <p>• Manual payment verification</p>
                       <p>• Easypaisa & Bank Transfer support</p>
                       <p>• Escrow protection until delivery</p>
                       <p>• 5% platform fee charged to seller</p>
                     </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart; 