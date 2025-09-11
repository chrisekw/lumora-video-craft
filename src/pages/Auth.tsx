import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic will be implemented here
    console.log(isLogin ? 'Login' : 'Signup', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative">
        <Card className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-card rounded-2xl">
          <CardHeader className="text-center pb-6">
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center space-x-2 mb-6 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-card transition-spring">
                <span className="text-white font-bold text-xl font-mono">L</span>
              </div>
              <span className="text-2xl font-bold font-mono gradient-text">Lumora</span>
            </Link>
            
            <CardTitle className="text-2xl font-bold font-mono">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </CardTitle>
            <CardDescription className="font-mono">
              {isLogin 
                ? 'Sign in to continue creating amazing videos' 
                : 'Join thousands of creators using Lumora'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button 
              variant="outline" 
              className="w-full border-border/50 hover:bg-muted/50 transition-smooth"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLogin ? 'Sign in' : 'Sign up'} with Google
            </Button>
            
            <div className="flex items-center">
              <Separator className="flex-1" />
              <span className="px-3 text-xs text-muted-foreground font-mono uppercase tracking-wider">
                or continue with email
              </span>
              <Separator className="flex-1" />
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-mono font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 border-border/50 focus:border-primary transition-smooth rounded-2xl font-mono"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="font-mono font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 border-border/50 focus:border-primary transition-smooth rounded-2xl font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="font-mono font-medium">
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 border-border/50 focus:border-primary transition-smooth rounded-2xl font-mono"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}
              
              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border/50" />
                    <span className="text-sm font-mono text-muted-foreground">Remember me</span>
                  </label>
                  <Button variant="link" className="p-0 h-auto font-mono text-sm">
                    Forgot password?
                  </Button>
                </div>
              )}
              
              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full mt-6"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isLogin ? 'Sign in' : 'Create account'}
              </Button>
            </form>
            
            {/* Toggle between login/signup */}
            <div className="text-center pt-4">
              <p className="text-sm font-mono text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary-glow transition-smooth font-medium underline underline-offset-2"
                >
                  {isLogin ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </div>
            
            {!isLogin && (
              <p className="text-xs text-muted-foreground text-center font-mono leading-relaxed">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-primary hover:text-primary-glow transition-smooth underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:text-primary-glow transition-smooth underline">
                  Privacy Policy
                </a>
              </p>
            )}
          </CardContent>
        </Card>
        
        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm font-mono text-muted-foreground hover:text-primary transition-smooth">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;