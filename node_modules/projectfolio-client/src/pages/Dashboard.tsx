import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { manualPaymentsAPI, authAPI, projectsAPI } from "@/lib/api";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Shield,
  CreditCard,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckSquare,
  Send,
  LogOut,
  Image as ImageIcon,
  Mail,
  Calendar,
  UserCheck,
  UserX
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("projects");
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check if admin is logged in - only after loading is complete
  // Also ensure the current user from AuthContext is actually an admin
  const isAdminLoggedIn = !isLoading && Boolean(adminUser && adminToken) && user?.role === 'admin';
  
  // Auto-logout when leaving the page
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only clear admin session when actually leaving the page, not when switching tabs
      // This prevents clearing session when user just switches to another tab
    };

    const handleVisibilityChange = () => {
      // Don't clear admin session when tab becomes hidden
      // This was causing issues when users switch tabs or minimize browser
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Don't clear admin session when component unmounts
      // This was causing the session to be cleared immediately after login
    };
  }, []);

  // Check for stored admin session on component mount
  useEffect(() => {
    const storedAdminToken = localStorage.getItem('admin_token');
    const storedAdminUser = localStorage.getItem('admin_user');
    const loginTime = localStorage.getItem('admin_login_time');
    const adminLoggedOut = localStorage.getItem('admin_logged_out');

    // Check if current user is not an admin - deny access immediately
    if (user && user.role !== 'admin') {
      // Clear any stored admin session data
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_login_time');
      localStorage.removeItem('admin_logged_out');
      setIsAdmin(false);
      setSessionExpired(false);
      setIsLoading(false);
      return;
    }

    // Check if user intentionally logged out
    if (adminLoggedOut === 'true') {
      localStorage.removeItem('admin_logged_out'); // Clear the flag
      setIsAdmin(false);
      setSessionExpired(false);
      setIsLoading(false);
      return;
    }

    // Check if session has expired (24 hours)
    if (loginTime) {
      const loginTimestamp = parseInt(loginTime);
      const currentTime = Date.now();
      const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (currentTime - loginTimestamp > sessionDuration) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_login_time');
        // Don't set logout flag for session expiration - this is different from manual logout
        setIsAdmin(false);
        setSessionExpired(true);
        setIsLoading(false);
        return;
      }
    }

    if (storedAdminToken && storedAdminUser) {
      try {
        const parsedUser = JSON.parse(storedAdminUser);
        
        // Validate the token by making a test API call
        const validateToken = async () => {
          try {
            const response = await fetch('/api/auth/admin/validate-token', {
              headers: {
                'Authorization': `Bearer ${storedAdminToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              setAdminToken(storedAdminToken);
              setAdminUser(parsedUser);
              setIsAdmin(true);
            } else {
              // Clear invalid stored data
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_user');
              localStorage.removeItem('admin_login_time');
              setIsAdmin(false);
            }
          } catch (error) {
            // Clear invalid stored data
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            localStorage.removeItem('admin_login_time');
            setIsAdmin(false);
          } finally {
            setIsLoading(false);
          }
        };
        
        validateToken();
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_login_time');
        setIsAdmin(false);
        setIsLoading(false);
      }
    } else {
      setIsAdmin(false);
      setSessionExpired(false);
      setIsLoading(false);
    }
  }, [user]); // Add user as dependency to re-run when user changes

  // Fetch all manual payments for admin
  const { data: allPayments, isLoading: paymentsLoading, error: paymentsError } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      // Use relative URL since Vite proxy forwards /api to backend
      const response = await fetch('/api/manual-payments/admin/payments', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    },
    enabled: isAdminLoggedIn,
  });

  // Fetch all projects for admin approval
  const { data: allProjects, isLoading: projectsLoading, error } = useQuery({
    queryKey: ['adminProjects'],
    queryFn: async () => {
      // Use direct fetch with admin token instead of regular API
      const response = await fetch('/api/projects/pending', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    },
    enabled: !!adminToken,
  });

  const pendingProjects = allProjects?.projects || [];

  // Fetch all users for admin management
  const { data: allUsers, error: usersError, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await fetch('/api/auth/admin/users', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!adminToken,
  });

  const users = allUsers?.users || [];

  const adminLoginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      authAPI.adminLogin(credentials),
    onSuccess: (data) => {
      // Store admin token and user data separately from regular user
      localStorage.setItem('admin_token', data.data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.data.user));
      localStorage.setItem('admin_login_time', Date.now().toString()); // Store login time
      
      // Clear any logout flag since user is logging in
      localStorage.removeItem('admin_logged_out');
      
      setAdminToken(data.data.token);
      setAdminUser(data.data.user);
      setIsAdmin(true);
      setSessionExpired(false); // Reset session expired state
      
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!",
      });
      
      // Stay on dashboard page - no navigation needed
    },
    onError: (error: any) => {
      toast({
        title: "Access Denied",
        description: error.response?.data?.message || "Invalid admin credentials",
        variant: "destructive",
      });
    },
  });

  const verifyPaymentMutation = useMutation({
         mutationFn: async (paymentId: string) => {
       const response = await fetch(`/api/manual-payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ verificationNotes: 'Payment verified by admin' })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({
        title: "Payment Verified",
        description: "Payment has been verified successfully. Email notification sent to buyer.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });

  const paySellerMutation = useMutation({
         mutationFn: async (paymentId: string) => {
       const response = await fetch(`/api/manual-payments/${paymentId}/pay-seller`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod: 'Easypaisa',
          accountNumber: '',
          phoneNumber: '',
          accountHolderName: '',
          paymentNotes: 'Payment sent to seller'
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({
        title: "Seller Paid",
        description: "Payment has been sent to seller",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to pay seller",
        variant: "destructive",
      });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await fetch(`/api/manual-payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      // Check if the response is not successful
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete payment');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({
        title: "Payment Deleted",
        description: "Payment order has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment",
        variant: "destructive",
      });
    },
  });

  const approveProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      toast({
        title: "Project Approved",
        description: "Project has been approved and is now available for purchase",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve project",
        variant: "destructive",
      });
    },
  });

  const rejectProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: 'Project rejected by admin' })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProjects'] });
      toast({
        title: "Project Rejected",
        description: "Project has been rejected",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject project",
        variant: "destructive",
      });
    },
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    adminLoginMutation.mutate(adminCredentials);
  };

  const handleLogout = () => {
    // Clear admin session only
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_login_time'); // Clear login time on logout
    
    // Set a flag to indicate intentional logout
    localStorage.setItem('admin_logged_out', 'true');
    
    setAdminUser(null);
    setAdminToken(null);
    setIsAdmin(false);
    
    toast({
      title: "Logged Out",
      description: "You have been logged out of admin dashboard",
    });
    navigate('/');
  };

  const handleVerifyPayment = (paymentId: string) => {
    verifyPaymentMutation.mutate(paymentId);
  };

  const handlePaySeller = (paymentId: string) => {
    paySellerMutation.mutate(paymentId);
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePaymentMutation.mutate(paymentId);
  };

  const handleApproveProject = (projectId: string) => {
    approveProjectMutation.mutate(projectId);
  };

  const handleRejectProject = (projectId: string) => {
    rejectProjectMutation.mutate(projectId);
  };

  // Calculate payment statistics
  const getPaymentStats = () => {
    if (!allPayments?.payments) return [];
    
    const payments = allPayments.payments;
    const pendingVerification = payments.filter((p: any) => p.status === 'payment_uploaded').length;
    const verified = payments.filter((p: any) => p.status === 'payment_verified').length;
    const readyToPay = payments.filter((p: any) => p.status === 'delivery_confirmed').length;
    const completed = payments.filter((p: any) => p.status === 'completed').length;
    const totalPlatformFees = payments.reduce((sum: number, p: any) => sum + p.platformFeeAmount, 0);
    // Projects are sold when payment is verified, delivery confirmed, or completed
    const projectsSold = payments.filter((p: any) => 
      ['payment_verified', 'delivery_confirmed', 'completed'].includes(p.status)
    ).length;

    return [
      {
        title: "Total Revenue",
        value: `RS ${totalPlatformFees.toFixed(2)}`,
        change: "+12.5%",
        changeType: "positive",
        icon: DollarSign,
      },
      {
        title: "Projects Sold",
        value: projectsSold,
        change: "+8.2%",
        changeType: "positive",
        icon: TrendingUp,
      },
      {
        title: "Pending Verification",
        value: pendingVerification,
        change: "Requires action",
        changeType: "warning",
        icon: Clock,
      },
      {
        title: "Ready to Pay",
        value: readyToPay,
        change: "Awaiting payment",
        changeType: "info",
        icon: Send,
      },
    ];
  };

  // Generate profit data for chart
  const getProfitData = () => {
    if (!allPayments?.payments) return [];

    const payments = allPayments.payments;
    
    // Group payments by month
    const monthlyData: { [key: string]: number } = {};
    
    payments.forEach((payment: any) => {
      const date = new Date(payment.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      // Add platform fees as profit
      monthlyData[monthKey] += payment.platformFeeAmount;
    });

    // Convert to array format for chart
    const chartData = Object.entries(monthlyData)
      .map(([month, profit]) => ({
        month,
        profit: parseFloat(profit.toFixed(2)),
        formattedMonth: new Date(month + '-01').toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        })
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // If no data or only one month, create sample data for demonstration
    if (chartData.length <= 1) {
      const currentDate = new Date();
      const sampleData = [];
      
      // Generate 6 months of sample data with realistic progression
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Create realistic profit progression (starting low and growing)
        let baseProfit = 500; // Start with RS 500
        if (i === 5) baseProfit = 500; // 6 months ago
        else if (i === 4) baseProfit = 800;
        else if (i === 3) baseProfit = 1200;
        else if (i === 2) baseProfit = 1800;
        else if (i === 1) baseProfit = 2500;
        else baseProfit = 3400; // Current month
        
        // Add some variation
        const variation = Math.floor(Math.random() * 200) - 100; // ±100 RS variation
        const profit = Math.max(0, baseProfit + variation);
        
        sampleData.push({
          month: monthKey,
          profit: profit,
          formattedMonth: date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          })
        });
      }
      return sampleData;
    }

    return chartData;
  };

  // Show loading state while checking admin session
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading admin session...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show admin login form if not authenticated as admin or if current user is not an admin
  if (!isAdminLoggedIn || (user && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-success/5 to-blue-500/5">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Authentication</CardTitle>
              <CardDescription>
                {sessionExpired 
                  ? 'Your admin session has expired. Please log in again.'
                  : user && user.role !== 'admin'
                  ? 'Access denied. Only administrators can access this dashboard.'
                  : 'Enter admin credentials to access payment dashboard'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
                             <form onSubmit={handleAdminLogin} className="space-y-4">
                 {user && user.role !== 'admin' && (
                   <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                     <p className="text-sm text-red-600">
                       You are currently logged in as a regular user. Please log out and log in with admin credentials to access this dashboard.
                     </p>
                   </div>
                 )}
                <div>
                  <Label htmlFor="email">Admin Email</Label>
                                     <Input
                     id="email"
                     type="email"
                     value={adminCredentials.email}
                     onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                     placeholder="admin@projectfolio.com"
                     required
                     disabled={adminLoginMutation.isPending || (user && user.role !== 'admin')}
                   />
                </div>
                <div>
                  <Label htmlFor="password">Admin Password</Label>
                                     <Input
                     id="password"
                     type="password"
                     value={adminCredentials.password}
                     onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                     placeholder="Enter admin password"
                     required
                     disabled={adminLoginMutation.isPending || (user && user.role !== 'admin')}
                   />
                </div>
                                 <Button type="submit" className="w-full" disabled={adminLoginMutation.isPending || (user && user.role !== 'admin')}>
                   {adminLoginMutation.isPending ? (
                     <>
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                       Authenticating...
                     </>
                   ) : (
                     'Access Dashboard'
                   )}
                 </Button>
              </form>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Security Notice:</h4>
                <p className="text-xs text-muted-foreground">
                  • Admin credentials are stored securely on the server<br/>
                  • All admin actions are logged and monitored<br/>
                  • Session expires after 24 hours<br/>
                  • Use strong, unique passwords
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (paymentsLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard data...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = getPaymentStats();
  const payments = allPayments?.payments || [];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-primary/5 via-success/5 to-blue-500/5 border-b">
          <div className="container py-8">
            <div className="flex items-center justify-between">
              <div>
                                 <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                 <p className="text-muted-foreground">
                   Welcome, Administrator! Manage project approvals, payments, and transactions.
                 </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Admin Access
                </Badge>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

                 <div className="container py-8">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
             <TabsList className="grid w-full grid-cols-4">
               <TabsTrigger value="projects">Project Approval</TabsTrigger>
               <TabsTrigger value="payments">Payment Management</TabsTrigger>
               <TabsTrigger value="users">User Management</TabsTrigger>
               <TabsTrigger value="overview">Overview</TabsTrigger>
             </TabsList>

                         <TabsContent value="projects" className="space-y-6">
               <Card>
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2">
                     <CheckSquare className="h-5 w-5" />
                     Project Approval Queue
                   </CardTitle>
                   <CardDescription>
                     Review and approve pending projects before they become available for purchase
                   </CardDescription>
                 </CardHeader>
                                   <CardContent>
                    {error ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Projects</h3>
                        <p className="text-muted-foreground mb-4">{error.message}</p>
                        <Button onClick={() => window.location.reload()}>Retry</Button>
                      </div>
                    ) : pendingProjects.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No projects to review</h3>
                        <p className="text-muted-foreground">All projects have been reviewed</p>
                      </div>
                    ) : (
                     <div className="space-y-4">
                       {pendingProjects.map((project: any) => (
                         <div key={project._id} className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center space-x-4">
                             <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                               <CheckSquare className="h-6 w-6 text-muted-foreground" />
                             </div>
                             <div>
                               <h3 className="font-medium">{project.title}</h3>
                               <p className="text-sm text-muted-foreground">
                                 {project.seller?.name || 'Unknown'} • {project.category}
                               </p>
                               <p className="text-xs text-muted-foreground">
                                 RS {project.price} • {project.status}
                               </p>
                               <Badge variant={
                                 project.status === 'pending' ? 'secondary' :
                                 project.status === 'available' ? 'default' :
                                 project.status === 'rejected' ? 'destructive' :
                                 'outline'
                               }>
                                 {project.status}
                               </Badge>
                             </div>
                           </div>
                           <div className="flex items-center space-x-2">
                             {project.status === 'pending' && (
                               <>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => handleApproveProject(project._id)}
                                   disabled={approveProjectMutation.isPending}
                                   className="text-green-600 border-green-200 hover:bg-green-50"
                                 >
                                   <CheckCircle className="h-4 w-4 mr-1" />
                                   Approve
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => handleRejectProject(project._id)}
                                   disabled={rejectProjectMutation.isPending}
                                   className="text-red-600 border-red-200 hover:bg-red-50"
                                 >
                                   <XCircle className="h-4 w-4 mr-1" />
                                   Reject
                                 </Button>
                               </>
                             )}
                             <Button variant="outline" size="sm" asChild>
                               <Link to={`/project/${project._id}`}>
                                 <Eye className="h-4 w-4 mr-1" />
                                 View
                               </Link>
                             </Button>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                 </CardContent>
               </Card>
                         </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    View all registered users and their verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersError ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Users</h3>
                      <p className="text-muted-foreground mb-4">{usersError.message}</p>
                      <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                  ) : usersLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Loading Users</h3>
                      <p className="text-muted-foreground">Please wait while we fetch user data...</p>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No users found</h3>
                      <p className="text-muted-foreground">No users have registered yet</p>
                    </div>
                  ) : (
                    <>
                      {/* User Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">Total Users</p>
                              <p className="text-2xl font-bold text-blue-700">{allUsers?.total || 0}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-600">Verified</p>
                              <p className="text-2xl font-bold text-green-700">{allUsers?.verified || 0}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-500" />
                          </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-orange-600">Unverified</p>
                              <p className="text-2xl font-bold text-orange-700">{allUsers?.unverified || 0}</p>
                            </div>
                            <UserX className="h-8 w-8 text-orange-500" />
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-purple-600">Admins</p>
                              <p className="text-2xl font-bold text-purple-700">{allUsers?.admins || 0}</p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-500" />
                          </div>
                        </div>
                      </div>

                      {/* Users List */}
                      <div className="space-y-4">
                        {users.map((user: any) => (
                          <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-medium">
                                  {user.firstName} {user.lastName}
                                  {user.role === 'admin' && (
                                    <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                                      Admin
                                    </Badge>
                                  )}
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <span>{user.email}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={
                                    user.isVerified ? 'default' : 'secondary'
                                  }>
                                    {user.isVerified ? (
                                      <>
                                        <UserCheck className="h-3 w-3 mr-1" />
                                        Verified
                                      </>
                                    ) : (
                                      <>
                                        <UserX className="h-3 w-3 mr-1" />
                                        Unverified
                                      </>
                                    )}
                                  </Badge>
                                  {user.verificationStatus && (
                                    <Badge variant="outline">
                                      {user.verificationStatus}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div>Username: {user.username || 'N/A'}</div>
                              <div>Role: {user.role}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        {stat.changeType === "positive" ? (
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : stat.changeType === "warning" ? (
                          <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                        ) : stat.changeType === "info" ? (
                          <Send className="h-3 w-3 text-blue-500 mr-1" />
                        ) : (
                          <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Profit Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Profit Overview
                  </CardTitle>
                  <CardDescription>
                    Platform revenue trends over the last 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getProfitData()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="formattedMonth" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `RS ${value.toLocaleString()}`}
                          domain={[0, 'dataMax + 500']} // Start from 0 and add some padding
                        />
                        <Tooltip 
                          formatter={(value: any) => [`RS ${value.toLocaleString()}`, 'Profit']}
                          labelFormatter={(label) => `Month: ${label}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                          connectNulls={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Account Details
                  </CardTitle>
                  <CardDescription>
                    Account information for manual payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Easypaisa</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone Number:</span>
                          <span className="font-medium">03165687188</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Type:</span>
                          <span className="font-medium">Personal</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">MCB Islamic Bank</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Number:</span>
                          <span className="font-medium">3761006274320001</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank:</span>
                          <span className="font-medium">MCB Islamic</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    All Payment Orders
                  </CardTitle>
                  <CardDescription>
                    Manage and verify manual payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentsError ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Payments</h3>
                      <p className="text-muted-foreground mb-4">{paymentsError.message}</p>
                      <Button onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                  ) : paymentsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Loading Payments</h3>
                      <p className="text-muted-foreground">Please wait while we fetch payment data...</p>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No payment orders</h3>
                      <p className="text-muted-foreground">No manual payment transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment: any) => (
                        <div key={payment._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-medium">Payment #{payment._id.slice(-6)}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {payment.buyer?.name || 'Unknown'} → {payment.seller?.name || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  RS {payment.amount} • {payment.paymentMethod}
                                </p>
                                <Badge variant={
                                  payment.status === 'pending' ? 'secondary' :
                                  payment.status === 'payment_uploaded' ? 'outline' :
                                  payment.status === 'payment_verified' ? 'default' :
                                  payment.status === 'delivery_confirmed' ? 'secondary' :
                                  payment.status === 'completed' ? 'default' :
                                  'destructive'
                                }>
                                  {payment.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {payment.status === 'payment_uploaded' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleVerifyPayment(payment._id)}
                                  disabled={verifyPaymentMutation.isPending}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Verify
                                </Button>
                              )}
                              {payment.status === 'delivery_confirmed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePaySeller(payment._id)}
                                  disabled={paySellerMutation.isPending}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Pay Seller
                                </Button>
                              )}
                              {payment.status !== 'completed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePayment(payment._id)}
                                  disabled={deletePaymentMutation.isPending}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Payment Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Transaction ID:</span>
                                <span className="font-medium">{payment.paymentDetails?.transactionId || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Sender Phone:</span>
                                <span className="font-medium">{payment.paymentDetails?.phoneNumber || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Sender Name:</span>
                                <span className="font-medium">{payment.paymentDetails?.senderName || 'N/A'}</span>
                              </div>
                              {payment.paymentDetails?.notes && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Notes:</span>
                                  <span className="font-medium">{payment.paymentDetails.notes}</span>
                                </div>
                              )}
                            </div>

                            {/* Payment Screenshot */}
                            {payment.paymentDetails?.screenshot && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Payment Screenshot</span>
                                </div>
                                <div className="relative group">
                                  <img
                                    src={payment.paymentDetails.screenshot}
                                    alt="Payment proof"
                                    className="w-full h-32 object-contain rounded-lg border cursor-pointer hover:opacity-90 transition-opacity bg-muted"
                                    onClick={() => window.open(payment.paymentDetails.screenshot, '_blank')}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Click to view full size
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="text-xs text-muted-foreground">
                              Created: {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard; 