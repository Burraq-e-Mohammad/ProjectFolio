import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsAPI } from '@/lib/api';

interface StripePaymentProps {
  projectId: string;
  amount: number;
  onSuccess?: (escrowAccount: any) => void;
  onError?: (error: string) => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const StripePayment: React.FC<StripePaymentProps> = ({
  projectId,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Create escrow payment
      const escrowResponse = await paymentsAPI.createEscrowPayment({
        projectId,
        amount,
        paymentMethod: 'stripe',
      });

      const { clientSecret, escrowAccount } = escrowResponse.data;

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            // You can add billing details here if needed
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setPaymentStatus('error');
        onError?.(error.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: error.message || 'Payment failed',
          variant: 'destructive',
        });
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment with backend
        await paymentsAPI.confirmPayment({
          escrowAccountId: escrowAccount._id,
          paymentIntentId: paymentIntent.id,
        });

        setPaymentStatus('success');
        onSuccess?.(escrowAccount);
        toast({
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully',
        });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Payment failed';
      setErrorMessage(errorMsg);
      setPaymentStatus('error');
      onError?.(errorMsg);
      toast({
        title: 'Payment Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment has been processed and the escrow account has been created.
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
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
        <CardDescription>
          Complete your payment to secure this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="text-2xl font-bold text-primary">
              RS {amount.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Card Information</label>
            <div className="border rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay RS ${amount.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your payment is secured by Stripe and held in escrow until project completion.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePayment; 