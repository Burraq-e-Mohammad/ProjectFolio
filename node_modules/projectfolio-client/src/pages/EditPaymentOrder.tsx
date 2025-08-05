import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { manualPaymentsAPI } from '@/lib/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Upload, 
  X,
  CreditCard,
  Phone,
  User,
  FileText,
  AlertCircle,
  Edit,
  Loader2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const EditPaymentOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('easypaisa');
  const [uploadingPayment, setUploadingPayment] = useState<boolean>(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get payment ID from location state
  const paymentId = location.state?.paymentId;

  useEffect(() => {
    if (!paymentId) {
      toast({
        title: 'Error',
        description: 'No payment order selected for editing',
        variant: 'destructive',
      });
      navigate('/payment-orders');
    }
  }, [paymentId, navigate, toast]);

  // Fetch payment details
  const { data: paymentResponse, isLoading, error } = useQuery({
    queryKey: ['paymentDetails', paymentId],
    queryFn: () => manualPaymentsAPI.getPaymentDetails(paymentId),
    enabled: !!paymentId,
  });

  const payment = paymentResponse?.data?.payment;

  // Update payment mutation
  const updatePaymentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await manualPaymentsAPI.updatePaymentProof(paymentId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPayments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentDetails', paymentId] });
      toast({
        title: 'Success',
        description: 'Payment proof updated successfully',
        variant: 'default',
      });
      navigate('/payment-orders');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update payment proof',
        variant: 'destructive',
      });
    },
  });

  // Initialize payment details when payment data is loaded
  useEffect(() => {
    if (payment?.paymentDetails) {
      setPaymentDetails({
        transactionId: payment.paymentDetails.transactionId || '',
        phoneNumber: payment.paymentDetails.phoneNumber || '',
        senderName: payment.paymentDetails.senderName || '',
        notes: payment.paymentDetails.notes || '',
      });
    }
  }, [payment]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: 'Copied!',
      description: `${fieldName} copied to clipboard`,
    });
  };

  const handleScreenshotChange = (file: File | null) => {
    console.log('=== Screenshot Change ===');
    console.log('File:', file);
    console.log('File name:', file?.name);
    console.log('File size:', file?.size);
    
    setPaymentScreenshot(file);
  };

  const handleUpdatePaymentProof = async () => {
    console.log('=== Update Payment Proof ===');
    console.log('Payment ID:', paymentId);
    console.log('Payment screenshot:', paymentScreenshot);
    console.log('Payment details:', paymentDetails);
    
    const screenshot = paymentScreenshot;
    const details = paymentDetails;

    if (!details?.transactionId?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the transaction ID',
        variant: 'destructive',
      });
      return;
    }

    if (!details?.phoneNumber?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the phone number',
        variant: 'destructive',
      });
      return;
    }

    if (!details?.senderName?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the sender name',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ All validations passed - proceeding with update');
    
    setUploadingPayment(true);

    try {
      const formData = new FormData();
      if (screenshot) {
        formData.append('screenshot', screenshot);
      }
      formData.append('transactionId', details.transactionId);
      formData.append('phoneNumber', details.phoneNumber);
      formData.append('senderName', details.senderName);
      formData.append('notes', details.notes || '');

      console.log('FormData created');
      if (screenshot) {
        console.log('FormData includes screenshot:', screenshot.name);
      }

      await updatePaymentMutation.mutateAsync(formData);
      console.log('✅ Update successful');

    } catch (error: any) {
      console.error('❌ Update failed:', error);
    } finally {
      setUploadingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading payment details...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Payment</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the payment details. Please try again.
            </p>
            <Button onClick={() => navigate('/payment-orders')}>
              Back to Payment Orders
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if payment can be edited
  if (payment.status !== 'payment_uploaded') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Cannot Edit Payment</h2>
            <p className="text-muted-foreground mb-4">
              This payment cannot be edited as it has already been verified or processed.
            </p>
            <Button onClick={() => navigate('/payment-orders')}>
              Back to Payment Orders
            </Button>
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
              Edit Payment Proof
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Update your payment proof details
            </p>
          </div>
        </section>

        <div className="container py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => navigate('/payment-orders')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payment Orders
            </Button>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Project</Label>
                    <p className="text-lg font-semibold">{payment.project?.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-lg font-semibold text-green-600">
                      ${payment.amount?.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge variant="secondary" className="mt-1">
                      {payment.status === 'payment_uploaded' ? 'Payment Uploaded' : payment.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Select Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* EasyPaisa */}
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'easypaisa'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('easypaisa')}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">EasyPaisa</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send payment to our EasyPaisa account
                      </p>
                      <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Account Number:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">03001234567</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard('03001234567', 'Account Number');
                              }}
                            >
                              {copiedField === 'Account Number' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Account Name:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">ProjectFolio</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard('ProjectFolio', 'Account Name');
                              }}
                            >
                              {copiedField === 'Account Name' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* JazzCash */}
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === 'jazzcash'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod('jazzcash')}
                  >
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">JazzCash</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send payment to our JazzCash account
                      </p>
                      <div className="space-y-2 w-full">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Account Number:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">03001234567</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard('03001234567', 'Account Number');
                              }}
                            >
                              {copiedField === 'Account Number' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Account Name:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">ProjectFolio</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard('ProjectFolio', 'Account Name');
                              }}
                            >
                              {copiedField === 'Account Name' ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Update Payment Details
                </CardTitle>
                <CardDescription>
                  Update your payment transaction details and upload a new screenshot if needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionId">Transaction ID *</Label>
                    <Input
                      id="transactionId"
                      value={paymentDetails.transactionId || ''}
                      onChange={(e) => setPaymentDetails(prev => ({
                        ...prev,
                        transactionId: e.target.value
                      }))}
                      placeholder="Enter transaction ID"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={paymentDetails.phoneNumber || ''}
                      onChange={(e) => setPaymentDetails(prev => ({
                        ...prev,
                        phoneNumber: e.target.value
                      }))}
                      placeholder="Enter phone number"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="senderName">Sender Name *</Label>
                  <Input
                    id="senderName"
                    value={paymentDetails.senderName || ''}
                    onChange={(e) => setPaymentDetails(prev => ({
                      ...prev,
                      senderName: e.target.value
                    }))}
                    placeholder="Enter sender name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={paymentDetails.notes || ''}
                    onChange={(e) => setPaymentDetails(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    placeholder="Add any additional notes"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Screenshot Upload */}
                <div>
                  <Label className="text-sm">Payment Screenshot (Optional)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        console.log('=== File Input Change ===');
                        console.log('Files:', e.target.files);
                        console.log('First file:', e.target.files?.[0]);
                        
                        const file = e.target.files?.[0] || null;
                        console.log('File object:', file);
                        
                        if (file) {
                          console.log('✅ File selected successfully');
                        } else {
                          console.log('❌ No file selected');
                        }
                        
                        handleScreenshotChange(file);
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ display: 'none' }}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {paymentScreenshot ? 'Change Screenshot' : 'Select Screenshot'}
                    </Button>
                    {paymentScreenshot && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleScreenshotChange(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {paymentScreenshot && (
                    <p className="text-xs text-green-600 mt-2">
                      ✓ {paymentScreenshot.name}
                    </p>
                  )}
                  {payment.paymentDetails?.screenshot && !paymentScreenshot && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Current screenshot: {payment.paymentDetails.screenshot.split('/').pop()}
                    </p>
                  )}
                </div>

                {/* Update Button */}
                <Button
                  onClick={handleUpdatePaymentProof}
                  disabled={uploadingPayment}
                  className="w-full"
                  size="lg"
                >
                  {uploadingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating Payment Proof...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Payment Proof
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditPaymentOrder; 