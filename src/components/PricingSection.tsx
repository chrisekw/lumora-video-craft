import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Crown, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out Lumora",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    features: [
      "2 projects per month",
      "Basic templates",
      "720p exports",
      "Lumora watermark",
      "Email support"
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    description: "For serious content creators",
    price: "$29",
    period: "per month",
    icon: Zap,
    features: [
      "20 projects per month",
      "All premium templates",
      "4K exports",
      "No watermark",
      "Priority support",
      "Advanced AI features",
      "Team collaboration"
    ],
    cta: "Start Pro Trial",
    variant: "hero" as const,
    popular: true
  },
  {
    name: "Enterprise",
    description: "For teams and agencies",
    price: "$99",
    period: "per month",
    icon: Crown,
    features: [
      "Unlimited projects",
      "Custom templates",
      "White-label exports",
      "API access",
      "Dedicated support",
      "Custom integrations",
      "Advanced analytics",
      "Team management"
    ],
    cta: "Contact Sales",
    variant: "premium" as const,
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-subtle">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-mono mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
            Choose the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative bg-card border shadow-card hover:shadow-glow transition-spring hover:scale-105 rounded-2xl ${
                plan.popular 
                  ? 'border-primary/50 shadow-glow scale-105' 
                  : 'border-border/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-mono font-bold shadow-soft">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center ${
                  plan.popular 
                    ? 'bg-gradient-primary shadow-glow' 
                    : 'bg-gradient-to-br from-muted to-muted-foreground/20'
                }`}>
                  <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="text-2xl font-mono font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="font-mono">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold font-mono">{plan.price}</span>
                  <span className="text-muted-foreground font-mono ml-2">/{plan.period}</span>
                </div>
                
                <Button 
                  variant={plan.variant} 
                  className="w-full mb-6"
                  size="lg"
                >
                  {plan.cta}
                </Button>
                
                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      <span className="text-sm font-mono text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;