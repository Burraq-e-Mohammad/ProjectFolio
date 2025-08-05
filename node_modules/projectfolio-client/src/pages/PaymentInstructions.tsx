import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ArrowRight, 
  Copy, 
  CheckCircle, 
  Upload, 
  X,
  CreditCard,
  Phone,
  User,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const PaymentInstructions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('easypaisa');
  const [uploadingPayment, setUploadingPayment] = useState<string | null>(null);
  const [paymentScreenshots, setPaymentScreenshots] = useState<{ [key: string]: File | null }>({});
  const [paymentDetails, setPaymentDetails] = useState<{ [key: string]: any }>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Get payment IDs from location state
  const paymentIds = location.state?.paymentIds || [];

  // Fetch payment details for all created payments
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ['payment-instructions', paymentIds],
    queryFn: async () => {
      const paymentPromises = paymentIds.map((id: string) => 
        manualPaymentsAPI.getPaymentDetails(id)
      );
      const responses = await Promise.all(paymentPromises);
      return responses.map(response => response.data.payment);
    },
    enabled: paymentIds.length > 0,
  });

  const payments = paymentsData || [];

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleScreenshotChange = (paymentId: string, file: File | null) => {
    setPaymentScreenshots(prev => {
      const newState = {
        ...prev,
        [paymentId]: file
      };
      return newState;
    });
  };

  const handlePaymentDetailsChange = (paymentId: string, field: string, value: string) => {
    setPaymentDetails(prev => ({
      ...prev,
      [paymentId]: {
        ...prev[paymentId],
        [field]: value
      }
    }));
  };

  const handleUploadPaymentProof = async (paymentId: string) => {
    const screenshot = paymentScreenshots[paymentId];
    const details = paymentDetails[paymentId];

    if (!screenshot) {
      toast({
        title: 'Error',
        description: 'Please select a payment screenshot',
        variant: 'destructive',
      });
      return;
    }

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

    setUploadingPayment(paymentId);

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);
      formData.append('transactionId', details.transactionId);
      formData.append('phoneNumber', details.phoneNumber);
      formData.append('senderName', details.senderName);
      formData.append('notes', details.notes || '');

      await manualPaymentsAPI.uploadPaymentProof(paymentId, formData);

      // Remove the uploaded payment from the list
      const updatedPaymentIds = paymentIds.filter(id => id !== paymentId);
      
      // Clear the uploaded payment's state
      setPaymentScreenshots(prev => {
        const newState = { ...prev };
        delete newState[paymentId];
        return newState;
      });
      setPaymentDetails(prev => {
        const newState = { ...prev };
        delete newState[paymentId];
        return newState;
      });

      toast({
        title: 'Success',
        description: 'Payment proof uploaded successfully',
        variant: 'default',
      });

      // If there are more payments to process, update the URL and continue
      if (updatedPaymentIds.length > 0) {
        const newUrl = `/payment-instructions?paymentIds=${updatedPaymentIds.join(',')}`;
        navigate(newUrl, { replace: true });
      } else {
        // No more payments, redirect to payment orders page
        toast({
          title: 'All Payments Complete',
          description: 'All payment proofs have been uploaded successfully',
          variant: 'default',
        });
        navigate('/payment-orders');
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload payment proof',
        variant: 'destructive',
      });
    } finally {
      setUploadingPayment(null);
    }
  };

  const accountDetails = {
    easypaisa: {
      name: "EasyPaisa",
      phoneNumber: "03165687188",
      accountType: "Personal Account",
      accountHolder: "Project Folio"
    },
    bank: {
      name: "MCB Islamic Bank",
      accountNumber: "3761006274320001",
      accountType: "Current Account",
      accountHolder: "Project Folio"
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading payment instructions...</p>
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
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Payment Orders Created!
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your payment orders have been created successfully. Please complete each payment using the instructions below.
            </p>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Payment Instructions */}
             <div className="space-y-6">

               {/* Payment Method Selection */}
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <CreditCard className="h-5 w-5" />
                     Select Payment Method
                   </CardTitle>
                   <CardDescription>
                     Choose how you want to send the payment
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-3">
                     <Button
                       variant={selectedPaymentMethod === 'easypaisa' ? 'default' : 'outline'}
                       onClick={() => setSelectedPaymentMethod('easypaisa')}
                       className="justify-start h-auto p-4"
                     >
                       <div className="flex flex-col items-start">
                         <div className="flex items-center gap-2 mb-2">
                           <Phone className="h-4 w-4" />
                           <span className="font-medium">EasyPaisa</span>
                         </div>
                         <span className="text-xs text-muted-foreground">Mobile Payment</span>
                       </div>
                     </Button>
                     <Button
                       variant={selectedPaymentMethod === 'bank_transfer' ? 'default' : 'outline'}
                       onClick={() => setSelectedPaymentMethod('bank_transfer')}
                       className="justify-start h-auto p-4"
                     >
                       <div className="flex flex-col items-start">
                         <div className="flex items-center gap-2 mb-2">
                           <User className="h-4 w-4" />
                           <span className="font-medium">Bank Transfer</span>
                         </div>
                         <span className="text-xs text-muted-foreground">Direct Transfer</span>
                       </div>
                     </Button>
                   </div>
                   
                                       {/* Selected Method Details */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">
                        {selectedPaymentMethod === 'easypaisa' ? 'EasyPaisa Account Details & Instructions:' : 'Bank Transfer Account Details & Instructions:'}
                      </h4>
                      {selectedPaymentMethod === 'easypaisa' ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Phone Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{accountDetails.easypaisa.phoneNumber}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(accountDetails.easypaisa.phoneNumber, 'Phone Number')}
                                >
                                  {copiedField === 'Phone Number' ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Account Type:</span>
                              <span className="font-medium">{accountDetails.easypaisa.accountType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Account Holder:</span>
                              <span className="font-medium">{accountDetails.easypaisa.accountHolder}</span>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <p>1. Open your EasyPaisa app</p>
                            <p>2. Go to "Send Money" or "Transfer"</p>
                            <p>3. Enter the phone number above</p>
                            <p>4. Enter the exact amount for each payment order</p>
                            <p>5. Add a reference note: "Project Payment"</p>
                            <p>6. Complete the transaction and save the receipt</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Bank:</span>
                              <span className="font-medium">{accountDetails.bank.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Account Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{accountDetails.bank.accountNumber}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(accountDetails.bank.accountNumber, 'Account Number')}
                                >
                                  {copiedField === 'Account Number' ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Account Type:</span>
                              <span className="font-medium">{accountDetails.bank.accountType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Account Holder:</span>
                              <span className="font-medium">{accountDetails.bank.accountHolder}</span>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-2 text-sm">
                            <p>1. Open your bank's mobile app or visit branch</p>
                            <p>2. Go to "Transfer" or "Send Money"</p>
                            <p>3. Enter the account number above</p>
                            <p>4. Enter the exact amount for each payment order</p>
                            <p>5. Add reference: "Project Payment"</p>
                            <p>6. Complete the transfer and save the receipt</p>
                          </div>
                        </div>
                      )}
                    </div>
                 </CardContent>
               </Card>

               {/* Payment Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    How to Complete Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Send Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Transfer the exact amount to the account details above using your preferred payment method.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Save Transaction Details</p>
                        <p className="text-sm text-muted-foreground">
                          Keep your transaction ID, screenshot, or receipt for verification.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Upload Proof</p>
                        <p className="text-sm text-muted-foreground">
                          Go to your payment history and upload the payment proof for each order.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Orders List */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Your Payment Orders ({payments.length})
                  </CardTitle>
                  <CardDescription>
                    Complete each payment individually
                  </CardDescription>
                </CardHeader>
                                 <CardContent className="space-y-4">
                   {payments.map((payment: any, index: number) => (
                     <div key={payment._id} className="border rounded-lg p-4">
                       <div className="flex items-center justify-between mb-3">
                         <h4 className="font-medium">Payment #{payment._id.slice(-6)}</h4>
                         <Badge variant={payment.status === 'payment_uploaded' ? 'default' : 'secondary'}>
                           {payment.status === 'payment_uploaded' ? 'Proof Uploaded' : 'Pending'}
                         </Badge>
                       </div>
                       <div className="space-y-2 text-sm mb-4">
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Project:</span>
                           <span className="font-medium">{payment.projectId?.title || 'Loading...'}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Amount:</span>
                           <span className="font-medium">RS {payment.amount}</span>
                         </div>
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Payment Method:</span>
                           <span className="font-medium capitalize">{payment.paymentMethod?.replace('_', ' ')}</span>
                         </div>
                       </div>

                       {/* Payment Proof Upload Form */}
                       {payment.status === 'pending' && (
                         <div className="space-y-3 border-t pt-4">
                           <h5 className="font-medium text-sm">Upload Payment Proof</h5>
                           
                           <div className="space-y-2">
                             <Label htmlFor={`transactionId-${payment._id}`} className="text-xs">Transaction ID</Label>
                             <Input
                               id={`transactionId-${payment._id}`}
                               placeholder="Enter transaction ID or reference number"
                               value={paymentDetails[payment._id]?.transactionId || ''}
                               onChange={(e) => handlePaymentDetailsChange(payment._id, 'transactionId', e.target.value)}
                               className="text-sm"
                             />
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor={`phoneNumber-${payment._id}`} className="text-xs">Sender Phone Number</Label>
                             <Input
                               id={`phoneNumber-${payment._id}`}
                               placeholder="Enter your phone number"
                               value={paymentDetails[payment._id]?.phoneNumber || ''}
                               onChange={(e) => handlePaymentDetailsChange(payment._id, 'phoneNumber', e.target.value)}
                               className="text-sm"
                             />
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor={`senderName-${payment._id}`} className="text-xs">Sender Name</Label>
                             <Input
                               id={`senderName-${payment._id}`}
                               placeholder="Enter your full name"
                               value={paymentDetails[payment._id]?.senderName || ''}
                               onChange={(e) => handlePaymentDetailsChange(payment._id, 'senderName', e.target.value)}
                               className="text-sm"
                             />
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor={`notes-${payment._id}`} className="text-xs">Additional Notes (Optional)</Label>
                             <Textarea
                               id={`notes-${payment._id}`}
                               placeholder="Any additional information about your payment"
                               value={paymentDetails[payment._id]?.notes || ''}
                               onChange={(e) => handlePaymentDetailsChange(payment._id, 'notes', e.target.value)}
                               className="text-sm"
                               rows={2}
                             />
                           </div>

                           <div className="space-y-2">
                             <Label htmlFor={`screenshot-${payment._id}`} className="text-xs">Payment Screenshot</Label>
                             <div className="flex items-center gap-2">
                               <input
                                 ref={(el) => fileInputRefs.current[payment._id] = el}
                                 id={`screenshot-${payment._id}`}
                                 type="file"
                                 accept="image/*"
                                 onChange={(e) => {
                                   const file = e.target.files?.[0] || null;
                                   handleScreenshotChange(payment._id, file);
                                 }}
                                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                 style={{ display: 'none' }}
                               />
                               {paymentScreenshots[payment._id] && (
                                 <Button
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => handleScreenshotChange(payment._id, null)}
                                 >
                                   <X className="h-4 w-4" />
                                 </Button>
                               )}
                             </div>
                             {paymentScreenshots[payment._id] && (
                               <p className="text-xs text-green-600">
                                 ✓ {paymentScreenshots[payment._id]?.name}
                               </p>
                             )}
                           </div>

                           <Button
                             onClick={() => {
                               const fileInput = fileInputRefs.current[payment._id];
                               const currentScreenshot = paymentScreenshots[payment._id];
                               
                               if (!currentScreenshot) {
                                 // No file selected, open file picker
                                 fileInput?.click();
                               } else {
                                 // File already selected, proceed with upload
                                 handleUploadPaymentProof(payment._id);
                               }
                             }}
                             disabled={uploadingPayment === payment._id}
                             className="w-full"
                             size="sm"
                           >
                             {uploadingPayment === payment._id ? (
                               <>
                                 <Upload className="h-4 w-4 mr-2 animate-spin" />
                                 Uploading...
                               </>
                             ) : !paymentScreenshots[payment._id] ? (
                               <>
                                 <Upload className="h-4 w-4 mr-2" />
                                 Select & Upload Screenshot
                               </>
                             ) : (
                               <>
                                 <Upload className="h-4 w-4 mr-2" />
                                 Upload Payment Proof
                               </>
                             )}
                           </Button>
                           
                         </div>
                       )}

                       {/* Uploaded Proof Status */}
                       {payment.status === 'payment_uploaded' && (
                         <div className="border-t pt-4">
                           <div className="flex items-center gap-2 text-sm text-blue-600">
                             <CheckCircle className="h-4 w-4" />
                             <span>Payment proof uploaded successfully</span>
                           </div>
                           <p className="text-xs text-muted-foreground mt-1">
                             Admin will verify your payment and update the status soon.
                           </p>
                         </div>
                       )}
                     </div>
                   ))}
                 </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/my-projects')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to My Projects
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/browse')}
                >
                  Browse More Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentInstructions; 