import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { User, Bell, Shield, Palette, Key } from "lucide-react";

const Settings = () => {
  const { user, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <main className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 font-mono">Settings</h1>
              <p className="text-muted-foreground font-mono">
                Manage your account and application preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Settings */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <CardTitle className="font-mono">Profile</CardTitle>
                    </div>
                    <CardDescription className="font-mono">
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="font-mono">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="Enter your first name"
                          className="rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="font-mono">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Enter your last name"
                          className="rounded-xl font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-mono">Email</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="rounded-xl font-mono"
                      />
                    </div>
                    <Button className="rounded-2xl font-mono">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <CardTitle className="font-mono">Notifications</CardTitle>
                    </div>
                    <CardDescription className="font-mono">
                      Configure your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-mono">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          Receive updates about your projects
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-mono">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          Tips, tutorials, and product updates
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-mono">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          Weekly summary of your activity
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <CardTitle className="font-mono">Security</CardTitle>
                    </div>
                    <CardDescription className="font-mono">
                      Manage your account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full rounded-2xl font-mono">
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl font-mono">
                      Enable Two-Factor Authentication
                    </Button>
                    <Separator />
                    <Button 
                      variant="destructive" 
                      className="w-full rounded-2xl font-mono"
                      onClick={signOut}
                    >
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Palette className="w-5 h-5" />
                      <CardTitle className="font-mono">Appearance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="font-mono">Dark Mode</Label>
                        <Switch />
                      </div>
                      <Separator />
                      <div>
                        <Label className="font-mono">Theme Color</Label>
                        <div className="flex space-x-2 mt-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-primary cursor-pointer ring-2 ring-primary ring-offset-2"></div>
                          <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer"></div>
                          <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                          <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Key className="w-5 h-5" />
                      <CardTitle className="font-mono">API Keys</CardTitle>
                    </div>
                    <CardDescription className="font-mono">
                      Manage your developer access
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full rounded-2xl font-mono">
                      Generate API Key
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Settings;