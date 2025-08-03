import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Package,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { manualPaymentsAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import React from 'react'; // Added missing import for React

interface MultiProjectPaymentProps {
  cartItems: any[];
  onSuccess?: (payments: any[]) => void;
  onError?: (error: string) => void;
}

const MultiProjectPayment: React.FC<MultiProjectPaymentProps> = ({
  cartItems,
  onSuccess,
  onError,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdPayments, setCreatedPayments] = useState<any[]>([]);
  // Default payment method - will be selected on payment instructions page
  const paymentMethod = 'easypaisa';

  // Filter out projects that are not available for purchase
  const availableProjects = cartItems.filter(item => item.project?.status === 'available');
  const unavailableProjects = cartItems.filter(item => item.project?.status !== 'available');

  // Show warning if there are unavailable projects
  React.useEffect(() => {
    if (unavailableProjects.length > 0) {
      toast({
        title: 'Some Projects Not Available',
        description: `${unavailableProjects.length} project(s) are not available for purchase. Only approved projects can be purchased.`,
        variant: 'destructive',
      });
    }
  }, [unavailableProjects.length, toast]);

  const handleCreateAllPayments = async () => {
    if (availableProjects.length === 0) {
      toast({
        title: 'No Available Projects',
        description: 'All projects in your cart are not available for purchase. Please wait for admin approval or remove them from cart.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const payments = [];
    const errors = [];
    let hasExistingPaymentError = false;

    console.log('=== Starting Multi-Project Payment Process ===');
    console.log('Available projects to process:', availableProjects);
    console.log('Total available projects:', availableProjects.length);

    try {
      for (let i = 0; i < availableProjects.length; i++) {
        const item = availableProjects[i];
        setCurrentStep(i + 1);
        
        console.log(`=== Processing item ${i + 1}/${availableProjects.length} ===`);
        console.log('Item data:', item);
        console.log('Project data:', item.project);
        console.log('Project ID:', item.project._id);
        console.log('Project price:', item.project.price);
        
        if (!item.project || !item.project._id) {
          const errorMsg = `Invalid project data for item ${i + 1}`;
          console.error(errorMsg, item);
          errors.push(errorMsg);
          continue;
        }
        
        try {
          console.log(`Creating payment for project: ${item.project._id}, amount: ${item.project.price}`);
          
          const paymentData = {
            projectId: item.project._id,
            amount: item.project.price,
            paymentMethod
          };
          
          console.log('Payment request data:', paymentData);
          
          const response = await manualPaymentsAPI.createPayment(paymentData);

          console.log(`Payment created successfully for project: ${item.project._id}`, response.data.payment);
          payments.push(response.data.payment);
          
          console.log(`Current payments array length: ${payments.length}`);
          
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || 'Unknown error';
          const fullErrorMsg = `Failed to create payment for "${item.project.title}": ${errorMsg}`;
          errors.push(fullErrorMsg);
          console.error('Payment creation error:', error);
          console.error('Error response:', error.response);
          console.error('Error message:', errorMsg);
          
          // Check if it's the "already exists" error
          if (errorMsg.includes('already have a payment order') || errorMsg.includes('Payment order already exists')) {
            hasExistingPaymentError = true;
          }
        }
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`=== Payment Process Complete ===`);
      console.log(`Total payments created: ${payments.length}`);
      console.log(`Total errors: ${errors.length}`);
      console.log(`Created payments:`, payments);
      console.log(`Errors:`, errors);
      
      setCreatedPayments(payments);
      
      if (payments.length > 0) {
        console.log(`Calling onSuccess with ${payments.length} payments`);
        onSuccess?.(payments);
        
        if (errors.length > 0) {
          if (hasExistingPaymentError) {
            toast({
              title: 'Partial Success - Some Orders Already Exist',
              description: `${payments.length} payment orders created successfully. Some projects already have payment orders.`,
              variant: 'default',
            });
          } else {
            toast({
              title: 'Partial Success',
              description: `${payments.length} payment orders created successfully. ${errors.length} failed. Check console for details.`,
              variant: 'default',
            });
          }
        } else {
          toast({
            title: 'All Payment Orders Created!',
            description: `${payments.length} payment orders have been created successfully. Please complete each payment separately.`,
          });
        }
      } else {
        console.log('No payments were created successfully');
        onError?.('Failed to create any payment orders');
        
        if (hasExistingPaymentError) {
          toast({
            title: 'Payment Orders Already Exist',
            description: 'All projects already have payment orders. Please check your existing orders.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to create any payment orders. Please try again.',
            variant: 'destructive',
          });
        }
      }

    } catch (error: any) {
      console.error('=== Fatal Error in Payment Process ===');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
      
      const errorMsg = error.response?.data?.message || 'Failed to create payment orders';
      console.error('Error creating payment orders:', error);
      onError?.(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      console.log('=== Payment Process Finished ===');
    }
  };

  const totalAmount = availableProjects.reduce((sum, item) => sum + item.project.price, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Multi-Project Payment
        </CardTitle>
        <CardDescription>
          Create payment orders for {availableProjects.length} available project{availableProjects.length !== 1 ? 's' : ''}
          {unavailableProjects.length > 0 && ` (${unavailableProjects.length} not available)`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project List */}
        <div className="space-y-3">
          <h4 className="font-medium">Projects in Cart:</h4>
          
          {/* Available Projects */}
          {availableProjects.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-green-600">Available for Purchase ({availableProjects.length})</h5>
              {availableProjects.map((item, index) => (
                <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{item.project.title}</h5>
                      <p className="text-xs text-muted-foreground">
                        by {item.project.seller?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">RS {item.project.price}</div>
                    {currentStep > index && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Created
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Unavailable Projects */}
          {unavailableProjects.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-red-600">Not Available for Purchase ({unavailableProjects.length})</h5>
              {unavailableProjects.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{item.project.title}</h5>
                      <p className="text-xs text-muted-foreground">
                        by {item.project.seller?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-red-600">
                        Status: {item.project.status} - {item.project.status === 'pending' ? 'Awaiting admin approval' : 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">RS {item.project.price}</div>
                    <Badge variant="destructive" className="text-xs">
                      Not Available
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount:</span>
            <span className="text-xl font-bold">RS {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Progress Indicator */}
        {isLoading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Creating payment orders...</span>
              <span>{currentStep}/{availableProjects.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / availableProjects.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleCreateAllPayments}
          disabled={isLoading || availableProjects.length === 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Payment Orders...
            </>
          ) : availableProjects.length === 0 ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              No Available Projects
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Create Payment Orders for {availableProjects.length} Project{availableProjects.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Each project will have a separate payment order. You'll need to complete each payment individually 
            and upload proof for each one. The platform fee (5%) is charged to sellers, not buyers.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MultiProjectPayment; 