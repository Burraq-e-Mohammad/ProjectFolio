import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Phone, MessageSquare, HelpCircle, Bug, Lightbulb, DollarSign, Plus, Minus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { contactAPI } from "@/lib/api";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email Support",
      description: "Get help via email",
      contact: "projectfolio.official@gmail.com",
      response: "Within 24 hours"
    },
    {
      icon: <Phone className="h-6 w-6 text-success" />,
      title: "Phone Support",
      description: "Talk to our team",
      contact: "+92 316 5687188",
      response: "Mon-Fri 9AM-6PM PKT"
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-tech-blue" />,
      title: "Live Chat",
      description: "Instant assistance",
      contact: "Available on website",
      response: "Mon-Fri 9AM-9PM PKT"
    }
  ];

  const supportTopics = [
    {
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
      title: "General Support",
      description: "Questions about using the platform"
    },
    {
      icon: <Bug className="h-5 w-5 text-destructive" />,
      title: "Technical Issues",
      description: "Report bugs or technical problems"
    },
    {
      icon: <DollarSign className="h-5 w-5 text-success" />,
      title: "Billing & Payments",
      description: "Payment and transaction related queries"
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-warning" />,
      title: "Feature Requests",
      description: "Suggest new features or improvements"
    }
  ];

  const faqData = [
    {
      question: "How do I post a project for sale?",
      answer: "To post a project, click on 'Post Ad' in the navigation menu. Fill out the project details including title, description, category, price, and upload images. Once submitted, your project will be reviewed by our team before being published."
    },
    {
      question: "How long does project approval take?",
      answer: "Project approval typically takes 24-48 hours. Our team reviews each submission to ensure quality and compliance with our platform standards."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We support various payment methods including bank transfers, digital wallets, and secure escrow services. All transactions are protected with bank-level security."
    },
    {
      question: "How do I contact a seller?",
      answer: "Once you find a project you're interested in, you can use our built-in messaging system to communicate directly with the seller. This ensures secure and traceable communication."
    },
    {
      question: "What if I'm not satisfied with my purchase?",
      answer: "We offer a money-back guarantee if the project doesn't meet the described specifications. Contact our support team within 7 days of purchase to initiate a refund process."
    },
    {
      question: "How do I become a verified developer?",
      answer: "To become a verified developer, submit your identification documents and portfolio through our verification process. This helps build trust with potential buyers."
    },
    {
      question: "Can I edit my project after posting?",
      answer: "Yes, you can edit your project anytime. Go to 'My Projects' in your account dashboard and click the edit button to make changes to your project details."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely. We use industry-standard encryption and security measures to protect all personal and financial information. Your data is never shared with third parties without your consent."
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await contactAPI.sendMessage(formData);
      toast({
        title: "Message Sent!",
        description: "Your message has been sent successfully. We will get back to you soon!",
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-primary/5 via-tech-blue/5 to-success/5">
          <div className="container text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-tech-blue bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions, suggestions, or need help? We're here to assist you. 
              Choose the best way to reach us below.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Can We Help?</h2>
              <p className="text-xl text-muted-foreground">
                Multiple ways to get the support you need
              </p>
            </div>
            
                         <div className="flex justify-center">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                 {contactMethods.map((method, index) => (
                   <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                     <CardContent className="pt-6">
                       <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-muted/50">
                         {method.icon}
                       </div>
                       <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                       <p className="text-muted-foreground text-sm mb-3">{method.description}</p>
                       <p className="font-medium text-sm mb-2">{method.contact}</p>
                       <p className="text-xs text-muted-foreground">{method.response}</p>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card className="p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="John" 
                          className="mt-1" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Doe" 
                          className="mt-1" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com" 
                        className="mt-1" 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={formData.subject} onValueChange={handleSubjectChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Support</SelectItem>
                          <SelectItem value="technical">Technical Issues</SelectItem>
                          <SelectItem value="billing">Billing & Payments</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea 
                        id="message" 
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Please describe your question or issue in detail..."
                        className="mt-1 min-h-32"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="hero" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Support Topics & FAQ */}
              <div className="space-y-6">
                <Card className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl">Quick Support Topics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      {supportTopics.map((topic, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted flex-shrink-0">
                            {topic.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{topic.title}</h4>
                            <p className="text-sm text-muted-foreground">{topic.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {faqData.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {faq.answer}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;