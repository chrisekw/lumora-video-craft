import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Crown, Zap } from "lucide-react";

const Billing = () => {
  const currentPlan = {
    name: "Free",
    projectsUsed: 1,
    projectsLimit: 2,
    nextBilling: null
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out Lumora",
      features: [
        "2 projects per month",
        "Basic templates",
        "Watermark included",
        "720p export quality"
      ],
      buttonText: "Current Plan",
      isPopular: false,
      disabled: true
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      description: "For creators and small businesses",
      features: [
        "20 projects per month",
        "All premium templates",
        "No watermark",
        "1080p export quality",
        "Priority support",
        "Custom branding"
      ],
      buttonText: "Upgrade to Pro",
      isPopular: true,
      disabled: false
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "month",
      description: "For teams and agencies",
      features: [
        "Unlimited projects",
        "All templates & features",
        "4K export quality",
        "Team collaboration",
        "API access",
        "Dedicated support",
        "White-label solution"
      ],
      buttonText: "Contact Sales",
      isPopular: false,
      disabled: false
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <main className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 font-mono">Billing & Plans</h1>
              <p className="text-muted-foreground font-mono">
                Manage your subscription and billing preferences
              </p>
            </div>

            {/* Current Usage */}
            <Card className="rounded-2xl mb-8">
              <CardHeader>
                <CardTitle className="font-mono">Current Usage</CardTitle>
                <CardDescription className="font-mono">
                  Your usage for this billing period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-mono">
                      <span>Projects Used</span>
                      <span>{currentPlan.projectsUsed} / {currentPlan.projectsLimit}</span>
                    </div>
                    <Progress 
                      value={(currentPlan.projectsUsed / currentPlan.projectsLimit) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="font-semibold font-mono">Current Plan: {currentPlan.name}</p>
                      {currentPlan.nextBilling && (
                        <p className="text-sm text-muted-foreground font-mono">
                          Next billing: {currentPlan.nextBilling}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {currentPlan.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 font-mono">Choose Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card 
                    key={plan.name} 
                    className={`rounded-2xl relative ${
                      plan.isPopular ? 'border-primary shadow-glow' : ''
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-primary text-white font-mono px-4">
                          <Crown className="w-4 h-4 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl font-mono">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold font-mono">
                        {plan.price}
                        <span className="text-lg text-muted-foreground">
                          /{plan.period}
                        </span>
                      </div>
                      <CardDescription className="font-mono">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full mb-6 rounded-2xl font-mono"
                        variant={plan.isPopular ? "default" : "outline"}
                        disabled={plan.disabled}
                      >
                        {plan.buttonText}
                      </Button>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center font-mono text-sm">
                            <Check className="w-4 h-4 mr-3 text-primary shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Billing History */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="font-mono">Billing History</CardTitle>
                <CardDescription className="font-mono">
                  Your recent transactions and invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground font-mono">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No billing history yet</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Billing;