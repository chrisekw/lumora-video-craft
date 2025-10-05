import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { User, Bell, Shield, Palette, Key, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Profile state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    loadProfile();
    loadNotificationPreferences();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setFirstName(data.full_name?.split(' ')[0] || '');
      setLastName(data.full_name?.split(' ').slice(1).join(' ') || '');
    }
  };

  const loadNotificationPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setEmailNotifications(data.email_notifications);
      setMarketingEmails(data.marketing_emails);
      setWeeklyReports(data.weekly_reports);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);

    const fullName = `${firstName} ${lastName}`.trim();

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString()
      });

    setIsSavingProfile(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setIsSavingNotifications(true);

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        email_notifications: emailNotifications,
        marketing_emails: marketingEmails,
        weekly_reports: weeklyReports,
        updated_at: new Date().toISOString()
      });

    setIsSavingNotifications(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Notification preferences updated!"
      });
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setIsChangingPassword(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Password changed successfully!"
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordDialog(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, you'd need an edge function to delete the user
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          <MobileHeader title="Settings" />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 font-mono">Settings</h1>
              <p className="text-sm sm:text-base text-muted-foreground font-mono">
                Manage your account and application preferences
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
              {/* Profile Settings */}
              <div className="xl:col-span-2 space-y-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="font-mono">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="Enter your first name"
                          className="rounded-xl font-mono"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="font-mono">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Enter your last name"
                          className="rounded-xl font-mono"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
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
                      <p className="text-xs text-muted-foreground mt-1 font-mono">Email cannot be changed</p>
                    </div>
                    <Button 
                      className="rounded-2xl font-mono" 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? "Saving..." : "Save Changes"}
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
                      <Switch 
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-mono">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          Tips, tutorials, and product updates
                        </p>
                      </div>
                      <Switch 
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-mono">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground font-mono">
                          Weekly summary of your activity
                        </p>
                      </div>
                      <Switch 
                        checked={weeklyReports}
                        onCheckedChange={setWeeklyReports}
                      />
                    </div>
                    <Button 
                      className="rounded-2xl font-mono w-full"
                      onClick={handleSaveNotifications}
                      disabled={isSavingNotifications}
                    >
                      {isSavingNotifications ? "Saving..." : "Save Preferences"}
                    </Button>
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
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full rounded-2xl font-mono">
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-mono">Change Password</DialogTitle>
                          <DialogDescription className="font-mono">
                            Enter your new password below. It must be at least 6 characters long.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="newPassword" className="font-mono">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="rounded-xl font-mono"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword" className="font-mono">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="rounded-xl font-mono"
                            />
                          </div>
                          <Button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword}
                            className="w-full rounded-2xl font-mono"
                          >
                            {isChangingPassword ? "Changing..." : "Change Password"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Separator />
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full rounded-2xl font-mono text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-mono">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="font-mono">
                            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteAccount}
                            className="bg-destructive hover:bg-destructive/90 font-mono"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
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
                      Manage your API keys for video generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full rounded-2xl font-mono">
                          View API Keys
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-mono text-xl">⚠️ Required API Keys</DialogTitle>
                          <DialogDescription className="font-mono">
                            All 3 API keys below are REQUIRED for your app to work
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          {/* Critical Warning */}
                          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                              <div>
                                <h4 className="font-semibold font-mono text-destructive mb-1">
                                  Current Error: API Keys Not Configured
                                </h4>
                                <p className="text-sm font-mono text-muted-foreground">
                                  Your video generation is failing because the API keys are missing or incorrectly named in Supabase Secrets.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Step-by-step instructions */}
                          <div className="space-y-3 p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
                            <h4 className="font-semibold font-mono flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                              Get Your API Keys
                            </h4>
                            <div className="ml-8 space-y-2">
                              <div>
                                <p className="text-sm font-mono font-semibold">REPLICATE_API_KEY</p>
                                <Button variant="outline" size="sm" className="mt-1" asChild>
                                  <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Get Key
                                  </a>
                                </Button>
                              </div>
                              <div>
                                <p className="text-sm font-mono font-semibold">ELEVENLABS_API_KEY</p>
                                <Button variant="outline" size="sm" className="mt-1" asChild>
                                  <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Get Key
                                  </a>
                                </Button>
                              </div>
                              <div>
                                <p className="text-sm font-mono font-semibold">OPENAI_API_KEY</p>
                                <Button variant="outline" size="sm" className="mt-1" asChild>
                                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Get Key
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 p-4 bg-primary/5 border-2 border-primary/20 rounded-xl">
                            <h4 className="font-semibold font-mono flex items-center gap-2">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
                              Add Keys to Supabase
                            </h4>
                            <ol className="ml-8 list-decimal list-inside space-y-2 text-sm font-mono">
                              <li>Click "Open Supabase Secrets" button below</li>
                              <li>Click "Add Secret" for each key</li>
                              <li className="font-bold text-destructive">Use EXACT names (case-sensitive):
                                <ul className="list-none ml-6 mt-1 space-y-1 font-mono text-xs">
                                  <li>• REPLICATE_API_KEY</li>
                                  <li>• ELEVENLABS_API_KEY</li>
                                  <li>• OPENAI_API_KEY</li>
                                </ul>
                              </li>
                              <li>Paste each API key value</li>
                              <li>Save and refresh your app</li>
                            </ol>
                            
                            <Button 
                              size="lg"
                              className="w-full rounded-2xl font-mono mt-4"
                              onClick={() => window.open('https://supabase.com/dashboard/project/hipolqjthriiwdzfxpdd/settings/functions', '_blank')}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Supabase Secrets Manager
                            </Button>
                          </div>

                          <Separator />

                          <div className="space-y-2 text-xs font-mono text-muted-foreground">
                            <p><strong>Why do I need these?</strong></p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li><strong>REPLICATE_API_KEY:</strong> Powers all AI video generation</li>
                              <li><strong>ELEVENLABS_API_KEY:</strong> Creates AI voiceovers for videos</li>
                              <li><strong>OPENAI_API_KEY:</strong> Analyzes URLs and generates scripts</li>
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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