import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-bold font-mono">Page Not Found</h2>
          <p className="text-muted-foreground font-mono max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="rounded-2xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="rounded-2xl bg-gradient-primary"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
