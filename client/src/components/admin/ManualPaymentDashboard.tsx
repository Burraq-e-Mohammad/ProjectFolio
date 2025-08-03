import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  DollarSign,
  Clock,
  User,
  FileText,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { manualPaymentsAPI } from '@/lib/api';

const ManualPaymentDashboard = () => {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [sellerPaymentDetails, setSellerPaymentDetails] = useState({
    paymentMethod: 'easypaisa',
    accountNumber: '',
    phoneNumber: '',
    accountHolderName: '',
    paymentNotes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => manualPaymentsAPI.getAdminPayments(),
  });

  const handleVerifyPayment = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      await manualPaymentsAPI.verifyPayment(paymentId, {
        verificationNotes
      });
      
      toast({
        title: 'Payment Verified',
        description: 'Payment has been verified successfully.',
      });
      
      setVerificationNotes('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to verify payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaySeller = async (paymentId: string) => {
    setIsProcessing(true);
    try {
      await manualPaymentsAPI.paySeller(paymentId, sellerPaymentDetails);
      
      toast({
        title: 'Seller Paid',
        description: 'Seller has been paid successfully.',
      });
      
      setSellerPaymentDetails({
        paymentMethod: 'easypaisa',
        accountNumber: '',
        phoneNumber: '',
        accountHolderName: '',
        paymentNotes: ''
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to pay seller',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Payment' },
      payment_uploaded: { color: 'bg-blue-100 text-blue-800', text: 'Payment Proof Uploaded' },
      payment_verified: { color: 'bg-green-100 text-green-800', text: 'Payment Verified' },
      delivery_confirmed: { color: 'bg-purple-100 text-purple-800', text: 'Delivery Confirmed' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      disputed: { color: 'bg-red-100 text-red-800', text: 'Disputed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manual Payment Dashboard</h2>
          <p className="text-muted-foreground">
            Manage manual payments and verify transactions
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Pending Verification</span>
            </div>
            <p className="text-2xl font-bold">
              {payments?.data?.payments?.filter((p: any) => p.status === 'payment_uploaded').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Verified</span>
            </div>
            <p className="text-2xl font-bold">
              {payments?.data?.payments?.filter((p: any) => p.status === 'payment_verified').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Ready to Pay</span>
            </div>
            <p className="text-2xl font-bold">
              {payments?.data?.payments?.filter((p: any) => p.status === 'delivery_confirmed').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold">
              {payments?.data?.payments?.filter((p: any) => p.status === 'completed').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Orders</CardTitle>
          <CardDescription>
            Review and manage payment orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments?.data?.payments?.map((payment: any) => (
              <div key={payment._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium">Project: {payment.projectId?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Amount: RS {payment.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(payment.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Buyer:</span>
                    <p>{payment.buyerId?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Seller:</span>
                    <p>{payment.sellerId?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Payment Method:</span>
                    <p className="capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <p>{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {payment.status === 'payment_uploaded' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleVerifyPayment(payment._id)}
                      disabled={isProcessing}
                      size="sm"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Verify Payment
                    </Button>
                  </div>
                )}

                {payment.status === 'delivery_confirmed' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setSelectedPayment(payment)}
                      size="sm"
                    >
                      <DollarSign className="h-4 w-4" />
                      Pay Seller
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {payments?.data?.payments?.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payment orders found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Review payment information and take action
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Project Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Title:</span> {selectedPayment.projectId?.title}</p>
                  <p><span className="font-medium">Amount:</span> RS {selectedPayment.amount.toFixed(2)}</p>
                  <p><span className="font-medium">Platform Fee:</span> RS {selectedPayment.platformFeeAmount.toFixed(2)}</p>
                  <p><span className="font-medium">Seller Amount:</span> RS {selectedPayment.sellerAmount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">User Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Buyer:</span> {selectedPayment.buyerId?.name} ({selectedPayment.buyerId?.email})</p>
                  <p><span className="font-medium">Seller:</span> {selectedPayment.sellerId?.name} ({selectedPayment.sellerId?.email})</p>
                  <p><span className="font-medium">Payment Method:</span> {selectedPayment.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Payment Proof */}
            {selectedPayment.paymentDetails && (
              <div>
                <h4 className="font-medium mb-2">Payment Proof</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Transaction ID:</span> {selectedPayment.paymentDetails.transactionId}</p>
                  <p><span className="font-medium">Phone Number:</span> {selectedPayment.paymentDetails.phoneNumber}</p>
                  <p><span className="font-medium">Sender Name:</span> {selectedPayment.paymentDetails.senderName}</p>
                  {selectedPayment.paymentDetails.notes && (
                    <p><span className="font-medium">Notes:</span> {selectedPayment.paymentDetails.notes}</p>
                  )}
                  {selectedPayment.paymentDetails.screenshot && (
                    <div>
                      <p className="font-medium mb-2">Screenshot:</p>
                      <img 
                        src={selectedPayment.paymentDetails.screenshot} 
                        alt="Payment proof" 
                        className="max-w-xs border rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verification Section */}
            {selectedPayment.status === 'payment_uploaded' && (
              <div className="space-y-4">
                <h4 className="font-medium">Verify Payment</h4>
                <div className="space-y-2">
                  <Label htmlFor="verificationNotes">Verification Notes</Label>
                  <Textarea
                    id="verificationNotes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about the verification process"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => handleVerifyPayment(selectedPayment._id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Verify Payment
                </Button>
              </div>
            )}

            {/* Pay Seller Section */}
            {selectedPayment.status === 'delivery_confirmed' && (
              <div className="space-y-4">
                <h4 className="font-medium">Pay Seller</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerPaymentMethod">Payment Method</Label>
                    <select
                      id="sellerPaymentMethod"
                      value={sellerPaymentDetails.paymentMethod}
                      onChange={(e) => setSellerPaymentDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="easypaisa">EasyPaisa</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerAccountNumber">
                      {sellerPaymentDetails.paymentMethod === 'easypaisa' ? 'Phone Number' : 'Account Number'}
                    </Label>
                    <Input
                      id="sellerAccountNumber"
                      value={sellerPaymentDetails.accountNumber}
                      onChange={(e) => setSellerPaymentDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder={sellerPaymentDetails.paymentMethod === 'easypaisa' ? 'Phone number' : 'Account number'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerAccountHolder">Account Holder Name</Label>
                    <Input
                      id="sellerAccountHolder"
                      value={sellerPaymentDetails.accountHolderName}
                      onChange={(e) => setSellerPaymentDetails(prev => ({ ...prev, accountHolderName: e.target.value }))}
                      placeholder="Account holder name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerPaymentNotes">Payment Notes</Label>
                    <Textarea
                      id="sellerPaymentNotes"
                      value={sellerPaymentDetails.paymentNotes}
                      onChange={(e) => setSellerPaymentDetails(prev => ({ ...prev, paymentNotes: e.target.value }))}
                      placeholder="Notes about the payment"
                      rows={2}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => handlePaySeller(selectedPayment._id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <DollarSign className="h-4 w-4 mr-2" />
                  )}
                  Pay Seller (RS {selectedPayment.sellerAmount.toFixed(2)})
                </Button>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManualPaymentDashboard; 