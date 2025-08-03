import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Upload,
  Banknote,
  Smartphone,
  Copy,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { manualPaymentsAPI } from '@/lib/api';
import { Link } from 'react-router-dom';

interface ManualPaymentProps {
  projectId: string;
  amount: number;
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
}

const ManualPayment: React.FC<ManualPaymentProps> = ({
  projectId,
  amount,
  onSuccess,
  onError,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'created' | 'uploaded' | 'verified' | 'delivery_confirmed' | 'completed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [payment, setPayment] = useState<any>(null);
  // Default payment method - will be selected on payment instructions page
  const paymentMethod = 'easypaisa';
  const [paymentDetails, setPaymentDetails] = useState({
    transactionId: '',
    phoneNumber: '',
    senderName: '',
    notes: ''
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Payment account details
  const paymentAccounts = {
    easypaisa: {
      number: '03165687188',
      name: 'EasyPaisa Account'
    },
    bank_transfer: {
      number: '3761006274320001',
      name: 'MCB Islamic Bank',
      accountType: 'Current Account'
    }
  };

  const handleCreatePayment = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await manualPaymentsAPI.createPayment({
        projectId,
        amount,
        paymentMethod
      });

      setPayment(response.data.payment);
      setPaymentStatus('created');
      onSuccess?.(response.data.payment);
      
      toast({
        title: 'Payment Order Created',
        description: 'Please send the payment and upload proof.',
      });

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create payment order';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
      
      // Check if it's the "already exists" error and provide a helpful message with link
      if (errorMsg.includes('already have a payment order') || errorMsg.includes('Payment order already exists')) {
        toast({
          title: 'Payment Order Already Exists',
          description: (
            <div className="flex flex-col space-y-2">
              <span>You already have a payment order for this project.</span>
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="w-fit"
              >
                <Link to="/payment-orders">
                  <Eye className="h-4 w-4 mr-2" />
                  View My Payment Orders
                </Link>
              </Button>
            </div>
          ),
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment || !screenshot) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('transactionId', paymentDetails.transactionId);
      formData.append('phoneNumber', paymentDetails.phoneNumber);
      formData.append('senderName', paymentDetails.senderName);
      formData.append('notes', paymentDetails.notes);
      formData.append('screenshot', screenshot);

      const response = await manualPaymentsAPI.uploadPaymentProof(payment._id, formData);

      setPayment(response.data.payment);
      setPaymentStatus('uploaded');
      
      toast({
        title: 'Payment Proof Uploaded',
        description: 'Your payment proof has been submitted for verification.',
      });

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to upload payment proof';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await manualPaymentsAPI.confirmDelivery(payment._id, {
        confirmationNotes: 'Delivery confirmed by buyer'
      });

      setPayment(response.data.payment);
      setPaymentStatus('delivery_confirmed');
      
      toast({
        title: 'Delivery Confirmed',
        description: 'Thank you for confirming delivery. Seller will be paid shortly.',
      });

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to confirm delivery';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Account number copied to clipboard',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Payment' },
      payment_uploaded: { color: 'bg-blue-100 text-blue-800', text: 'Payment Proof Uploaded' },
      payment_verified: { color: 'bg-green-100 text-green-800', text: 'Payment Verified' },
      delivery_confirmed: { color: 'bg-purple-100 text-purple-800', text: 'Delivery Confirmed' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  if (paymentStatus === 'completed') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Completed!</h3>
            <p className="text-muted-foreground">
              The seller has been paid and the transaction is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Manual Payment
        </CardTitle>
        <CardDescription>
          Complete your payment through EasyPaisa or Bank Transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status */}
        {payment && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">Payment Status:</span>
            {getStatusBadge(payment.status)}
          </div>
        )}

        {/* Step 1: Create Payment Order */}
        {paymentStatus === 'idle' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Amount to Pay</Label>
              <div className="text-3xl font-bold text-primary">
                RS {amount.toFixed(2)}
              </div>
            </div>



            <Button 
              onClick={handleCreatePayment}
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Payment Order...
                </>
              ) : (
                'Create Payment Order'
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Payment Instructions */}
        {paymentStatus === 'created' && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please send the exact amount to the account below and upload proof of payment.
              </AlertDescription>
            </Alert>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Account Type:</span>
                <span>{paymentAccounts[paymentMethod].name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {paymentMethod === 'easypaisa' ? 'Phone Number:' : 'Account Number:'}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono">{paymentAccounts[paymentMethod].number}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(paymentAccounts[paymentMethod].number)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {paymentMethod === 'bank_transfer' && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account Type:</span>
                  <span>{paymentAccounts[paymentMethod].accountType}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="font-medium">Amount:</span>
                <span className="font-bold text-lg">RS {amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Send the exact amount shown above</p>
              <p>• Keep your transaction ID/receipt</p>
              <p>• Upload a screenshot of the payment confirmation</p>
            </div>
          </div>
        )}

        {/* Step 3: Upload Payment Proof */}
        {(paymentStatus === 'created' || paymentStatus === 'payment_uploaded') && (
          <form onSubmit={handleUploadProof} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={paymentDetails.transactionId}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, transactionId: e.target.value }))}
                placeholder="Enter transaction ID or reference number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Sender Phone Number</Label>
              <Input
                id="phoneNumber"
                value={paymentDetails.phoneNumber}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                value={paymentDetails.senderName}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, senderName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot">Payment Screenshot</Label>
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Upload a screenshot of your payment confirmation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={paymentDetails.notes}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information about your payment"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !screenshot}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Proof...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Payment Proof
                </>
              )}
            </Button>
          </form>
        )}

        {/* Step 4: Payment Verified - Wait for Delivery */}
        {paymentStatus === 'payment_verified' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment has been verified! The seller will now deliver your project.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Seller will deliver your project</li>
                <li>• You'll receive the project files/deliverables</li>
                <li>• Review the delivered work</li>
                <li>• Confirm delivery to release payment to seller</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 5: Confirm Delivery */}
        {paymentStatus === 'payment_verified' && (
          <Button 
            onClick={handleConfirmDelivery}
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming Delivery...
              </>
            ) : (
              'Confirm Delivery & Release Payment'
            )}
          </Button>
        )}

        {/* Step 6: Delivery Confirmed */}
        {paymentStatus === 'delivery_confirmed' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Delivery confirmed! The seller will be paid within 24 hours.
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Payment Process</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Admin will verify the delivery</li>
                <li>• 95% of payment will be sent to seller</li>
                <li>• 5% platform fee will be retained</li>
                <li>• You'll receive confirmation once seller is paid</li>
              </ul>
            </div>
          </div>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Terms and Conditions */}
        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Terms & Conditions:</strong></p>
          <ul className="space-y-1">
            <li>• Payment must be sent to the exact account details provided</li>
            <li>• Screenshot proof is required for verification</li>
            <li>• Platform fee of 5% applies to all transactions</li>
            <li>• Payment to seller is held until delivery confirmation</li>
            <li>• Disputes must be raised within 7 days of payment</li>
            <li>• Refunds are processed manually by admin review</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualPayment; 