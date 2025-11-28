import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechStart",
    content: "Lumora transformed our content strategy. We're creating 10x more video content with half the effort. The AI-powered features are incredible.",
    avatar: "SC",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Content Creator",
    company: "Independent",
    content: "As a solo creator, Lumora gives me superpowers. I can turn any idea into a professional video in minutes. Game-changer for my business.",
    avatar: "MR",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Founder",
    company: "GrowthCo",
    content: "The URL cloning feature is pure magic. We paste competitor content and instantly create our own version. Our engagement rates have tripled.",
    avatar: "EW",
    rating: 5
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono mb-4 px-2">
            Loved by <span className="gradient-text">creators worldwide</span>
          </h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto font-mono px-4">
            Join thousands of creators who are already transforming their content strategy with Lumora.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className={`bg-card border border-border/50 shadow-card hover:shadow-glow transition-spring hover:scale-105 rounded-2xl animate-fade-in delay-${index * 100 + 200}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 font-mono leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4 border-2 border-primary/20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`} />
                    <AvatarFallback className="bg-gradient-primary text-white font-mono font-bold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold font-mono text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;