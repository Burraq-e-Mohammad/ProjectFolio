import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Eye,
  Clock,
  DollarSign,
  FileText,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { manualPaymentsAPI } from '@/lib/api';

const UserPaymentHistory = () => {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ['user-payments'],
    queryFn: () => manualPaymentsAPI.getUserPayments(),
  });

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

  const getStatusDescription = (status: string) => {
    const descriptions = {
      pending: 'Please send payment and upload proof',
      payment_uploaded: 'Payment proof submitted, waiting for verification',
      payment_verified: 'Payment verified! Seller will deliver your project',
      delivery_confirmed: 'Delivery confirmed! Seller will be paid shortly',
      completed: 'Transaction completed successfully',
      disputed: 'Payment is under dispute'
    };
    return descriptions[status as keyof typeof descriptions] || 'Unknown status';
  };

  const getRoleBadge = (payment: any, userId: string) => {
    if (payment.buyerId._id === userId) {
      return <Badge className="bg-blue-100 text-blue-800">Buyer</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Seller</Badge>;
    }
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
          <h2 className="text-2xl font-bold">Payment History</h2>
          <p className="text-muted-foreground">
            Track your payment transactions and status
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
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">
              {payments?.data?.payments?.filter((p: any) => p.status === 'pending').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold">
              {payments?.data?.payments?.filter((p: any) => 
                ['payment_uploaded', 'payment_verified', 'delivery_confirmed'].includes(p.status)
              ).length || 0}
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Total Spent</span>
            </div>
            <p className="text-2xl font-bold">
              RS {payments?.data?.payments
                ?.filter((p: any) => p.buyerId._id === localStorage.getItem('userId'))
                ?.reduce((sum: number, p: any) => sum + p.amount, 0)
                .toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            View all your payment transactions and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments?.data?.payments?.map((payment: any) => (
              <div key={payment._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-medium">{payment.projectId?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Amount: RS {payment.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getRoleBadge(payment, localStorage.getItem('userId') || '')}
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

                <div className="text-sm text-muted-foreground">
                  {getStatusDescription(payment.status)}
                </div>

                {/* Action Buttons for Buyers */}
                {payment.buyerId._id === localStorage.getItem('userId') && 
                 payment.status === 'payment_verified' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => {
                        // This would trigger delivery confirmation
                        toast({
                          title: 'Delivery Confirmation',
                          description: 'Please confirm delivery in the payment details',
                        });
                        setSelectedPayment(payment);
                      }}
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Delivery
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {payments?.data?.payments?.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payment transactions found</p>
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
              Detailed information about this payment transaction
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
                  <p><span className="font-medium">Status:</span> {getStatusBadge(selectedPayment.status)}</p>
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

            {/* Verification Details */}
            {selectedPayment.verificationDetails && (
              <div>
                <h4 className="font-medium mb-2">Verification Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Verified At:</span> {new Date(selectedPayment.verificationDetails.verifiedAt).toLocaleString()}</p>
                  {selectedPayment.verificationDetails.verificationNotes && (
                    <p><span className="font-medium">Notes:</span> {selectedPayment.verificationDetails.verificationNotes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Confirmation */}
            {selectedPayment.deliveryConfirmation && (
              <div>
                <h4 className="font-medium mb-2">Delivery Confirmation</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Confirmed At:</span> {new Date(selectedPayment.deliveryConfirmation.confirmedAt).toLocaleString()}</p>
                  {selectedPayment.deliveryConfirmation.confirmationNotes && (
                    <p><span className="font-medium">Notes:</span> {selectedPayment.deliveryConfirmation.confirmationNotes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Seller Payment Details */}
            {selectedPayment.sellerPaymentDetails && (
              <div>
                <h4 className="font-medium mb-2">Seller Payment Details</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Payment Method:</span> {selectedPayment.sellerPaymentDetails.paymentMethod}</p>
                  <p><span className="font-medium">Account Number:</span> {selectedPayment.sellerPaymentDetails.accountNumber}</p>
                  <p><span className="font-medium">Account Holder:</span> {selectedPayment.sellerPaymentDetails.accountHolderName}</p>
                  <p><span className="font-medium">Paid At:</span> {new Date(selectedPayment.sellerPaymentDetails.paidAt).toLocaleString()}</p>
                  {selectedPayment.sellerPaymentDetails.paymentNotes && (
                    <p><span className="font-medium">Notes:</span> {selectedPayment.sellerPaymentDetails.paymentNotes}</p>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="font-medium mb-2">Transaction Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Payment order created - {new Date(selectedPayment.createdAt).toLocaleString()}</span>
                </div>
                {selectedPayment.paymentDetails && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Payment proof uploaded</span>
                  </div>
                )}
                {selectedPayment.verificationDetails && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Payment verified - {new Date(selectedPayment.verificationDetails.verifiedAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedPayment.deliveryConfirmation && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Delivery confirmed - {new Date(selectedPayment.deliveryConfirmation.confirmedAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedPayment.sellerPaymentDetails && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Seller paid - {new Date(selectedPayment.sellerPaymentDetails.paidAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

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

export default UserPaymentHistory; 