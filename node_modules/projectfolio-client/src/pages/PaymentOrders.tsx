import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { manualPaymentsAPI } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Loader2,
  Calendar,
  DollarSign,
  User,
  Package,
  Upload,
  ArrowRight,
  Trash2,
  Edit
} from "lucide-react";
import { Link } from "react-router-dom";
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

const PaymentOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paymentsResponse, isLoading, error } = useQuery({
    queryKey: ['userPayments'],
    queryFn: () => manualPaymentsAPI.getUserPayments(),
    enabled: !!user,
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      return await manualPaymentsAPI.deletePayment(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPayments'] });
      toast({
        title: "Payment Order Deleted",
        description: "The payment order has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete payment order';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleDeletePayment = (paymentId: string) => {
    deletePaymentMutation.mutate(paymentId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'payment_uploaded':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'payment_verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivery_confirmed':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disputed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending Payment' },
      payment_uploaded: { variant: 'default' as const, text: 'Payment Uploaded' },
      payment_verified: { variant: 'default' as const, text: '✅ Payment Verified' },
      delivery_confirmed: { variant: 'default' as const, text: 'Delivery Confirmed' },
      completed: { variant: 'default' as const, text: 'Completed' },
      disputed: { variant: 'destructive' as const, text: 'Disputed' },
      refunded: { variant: 'secondary' as const, text: 'Refunded' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Please complete your payment by following the instructions.';
      case 'payment_uploaded':
        return 'Your payment proof has been uploaded and is being reviewed by our team.';
      case 'payment_verified':
        return '✅ Your payment has been verified by admin! The seller will now deliver the project files to you.';
      case 'delivery_confirmed':
        return 'Delivery has been confirmed. The seller will be paid soon.';
      case 'completed':
        return 'Payment completed successfully. The transaction is finished.';
      case 'disputed':
        return 'This payment is under dispute. Please contact support.';
      case 'refunded':
        return 'Payment has been refunded.';
      default:
        return 'Payment status unknown.';
    }
  };

  const getActionButton = (payment: any) => {
    switch (payment.status) {
      case 'pending':
        return (
          <Button size="sm" asChild>
            <Link to="/payment-instructions" state={{ paymentIds: [payment._id] }}>
              <Upload className="h-4 w-4 mr-2" />
              Complete Payment
            </Link>
          </Button>
        );
      case 'payment_uploaded':
        return (
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/payment-instructions" state={{ paymentIds: [payment._id] }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/edit-payment-order" state={{ paymentId: payment._id }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Payment
              </Link>
            </Button>
          </div>
        );
      case 'payment_verified':
      case 'delivery_confirmed':
      case 'completed':
      case 'disputed':
      case 'refunded':
        return (
          <Button variant="outline" size="sm" asChild>
            <Link to="/payment-instructions" state={{ paymentIds: [payment._id] }}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        );
      default:
        return (
          <Button variant="outline" size="sm" asChild>
            <Link to="/payment-instructions" state={{ paymentIds: [payment._id] }}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading payment orders...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Payment Orders</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your payment orders. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const payments = paymentsResponse?.data?.payments || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-r from-primary/5 via-success/5 to-blue-500/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              My Payment Orders
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track and manage all your payment orders in one place
            </p>
          </div>
        </section>

        <div className="container py-8">
          {payments.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Payment Orders Found</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't created any payment orders yet. Start browsing projects to make your first purchase.
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Payment Orders ({payments.length})</h2>
                <Button variant="outline" asChild>
                  <Link to="/browse">
                    Browse More Projects
                  </Link>
                </Button>
              </div>

              <div className="grid gap-6">
                {payments.map((payment: any) => (
                  <Card key={payment._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(payment.status)}
                            {getStatusBadge(payment.status)}
                          </div>
                          <CardTitle className="text-lg">
                            {payment.projectId?.title || 'Project Title Not Available'}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-2">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(payment.createdAt)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>RS {payment.amount?.toLocaleString()}</span>
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getActionButton(payment)}
                          
                          {/* Delete Button - Only show for pending payments */}
                          {payment.status === 'pending' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  disabled={deletePaymentMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Payment Order</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this payment order? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeletePayment(payment._id)}
                                    className="bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Project Details</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>Category:</strong> {payment.projectId?.category || 'N/A'}</p>
                            <p><strong>Seller:</strong> {payment.sellerId?.firstName} {payment.sellerId?.lastName}</p>
                            <p><strong>Payment Method:</strong> {payment.paymentMethod}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Payment Breakdown</h4>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p><strong>Total Amount:</strong> RS {payment.amount?.toLocaleString()}</p>
                            <p><strong>Platform Fee:</strong> RS {payment.platformFeeAmount?.toLocaleString()}</p>
                            <p><strong>Seller Amount:</strong> RS {payment.sellerAmount?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {payment.paymentDetails && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <h4 className="font-semibold mb-2">Payment Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              {payment.paymentDetails.transactionId && (
                                <p><strong>Transaction ID:</strong> {payment.paymentDetails.transactionId}</p>
                              )}
                              {payment.paymentDetails.phoneNumber && (
                                <p><strong>Phone Number:</strong> {payment.paymentDetails.phoneNumber}</p>
                              )}
                              {payment.paymentDetails.senderName && (
                                <p><strong>Sender Name:</strong> {payment.paymentDetails.senderName}</p>
                              )}
                              {payment.paymentDetails.notes && (
                                <p><strong>Notes:</strong> {payment.paymentDetails.notes}</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Status-specific action cards */}
                      {payment.status === 'pending' && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span className="font-semibold text-yellow-800">Payment Required</span>
                          </div>
                          <p className="text-sm text-yellow-700">
                            {getStatusDescription(payment.status)}
                          </p>
                        </div>
                      )}

                      {payment.status === 'payment_uploaded' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-800">Payment Under Review</span>
                          </div>
                          <p className="text-sm text-blue-700">
                            {getStatusDescription(payment.status)}
                          </p>
                        </div>
                      )}

                      {payment.status === 'payment_verified' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-800">Payment Verified</span>
                          </div>
                          <p className="text-sm text-green-700">
                            {getStatusDescription(payment.status)}
                          </p>
                        </div>
                      )}

                      {payment.status === 'delivery_confirmed' && (
                        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <span className="font-semibold text-purple-800">Delivery Confirmed</span>
                          </div>
                          <p className="text-sm text-purple-700">
                            {getStatusDescription(payment.status)}
                          </p>
                        </div>
                      )}

                      {payment.status === 'completed' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-800">Payment Completed</span>
                          </div>
                          <p className="text-sm text-green-700">
                            {getStatusDescription(payment.status)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentOrders; 