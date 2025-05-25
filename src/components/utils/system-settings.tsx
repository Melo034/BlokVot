import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Save, AlertTriangle, Shield, Database, Network, Bell } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [adminEmailRecipients, setAdminEmailRecipients] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [systemTimezone, setSystemTimezone] = useState("gmt");
  const [defaultLanguage, setDefaultLanguage] = useState("english");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);

  const handleSaveSettings = () => {
    setIsLoading(true);

    // Validation
    if (!adminEmailRecipients.match(/^([\w-.]+@([\w-]+\.)+[\w-]{2,4},?\s*)+$/) && adminEmailRecipients !== "") {
      toast.error("Error", {
        description: "Invalid email format for Admin Email Recipients.",
      });
      setIsLoading(false);
      return;
    }

    if (emergencyContactNumber !== "" && !emergencyContactNumber.match(/^\+?\d{1,15}$/)) {
      toast.error("Error", {
        description: "Invalid phone number format for Emergency Contact Number.",
      });
      setIsLoading(false);
      return;
    }

    // Simulate saving settings
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Success", {
        description: "Settings saved successfully!",
      });
    }, 2000);
  };

  const handleMaintenanceModeToggle = () => {
    if (!maintenanceMode) {
      setOpenMaintenanceDialog(true);
    } else {
      setMaintenanceMode(false);
    }
  };

  const confirmMaintenanceMode = () => {
    setMaintenanceMode(true);
    setOpenMaintenanceDialog(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-primary">System Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure platform settings and parameters</p>
      </div>

      <Tabs defaultValue="blockchain" className="space-y-6">
        <TabsList className="flex flex-wrap w-full gap-2 mb-4 sm:grid sm:grid-cols-2 md:grid-cols-4 lg:gap-4">
          <TabsTrigger
            value="blockchain"
            className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
          >
            Blockchain
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
          >
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blockchain">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Network className="h-5 w-5" />
                Blockchain Configuration
              </CardTitle>
              <CardDescription className="text-sm">Configure blockchain network settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Network</Label>
                  <Select defaultValue="ethereum-sepolia">
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum-mainnet">Ethereum Mainnet</SelectItem>
                      <SelectItem value="ethereum-sepolia">Ethereum Sepolia (Testnet)</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Gas Price (Gwei)</Label>
                  <Input type="number" defaultValue="7" className="text-sm sm:text-base" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Confirmation Blocks</Label>
                  <Input type="number" defaultValue="12" className="text-sm sm:text-base" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Transaction Timeout (minutes)</Label>
                  <Input type="number" defaultValue="10" className="text-sm sm:text-base" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Smart Contract Address</Label>
                <Input
                  defaultValue="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                  readOnly
                  className="text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-sm">Configure security policies and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">Require Two-Factor Authentication</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Force all administrators to use 2FA</div>
                  </div>
                  <Switch checked={twoFactorAuth} onCheckedChange={(checked) => setTwoFactorAuth(checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">Session Timeout</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Automatically log out inactive users</div>
                  </div>
                  <Select value={sessionTimeout} onValueChange={(value) => setSessionTimeout(value)}>
                    <SelectTrigger className="w-32 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">IP Whitelist</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Restrict admin access to specific IP addresses</div>
                  </div>
                  <Switch checked={ipWhitelist} onCheckedChange={(checked) => setIpWhitelist(checked)} />
                </div>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="text-sm sm:text-base">Security Notice</AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  Changes to security settings will affect all administrator accounts and may require re-authentication.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription className="text-sm">Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">Email Notifications</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Send email alerts for critical events</div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={(checked) => setEmailNotifications(checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">SMS Alerts</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Send SMS for security incidents</div>
                  </div>
                  <Switch checked={smsAlerts} onCheckedChange={(checked) => setSmsAlerts(checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">Slack Integration</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Post alerts to Slack channel</div>
                  </div>
                  <Switch checked={slackIntegration} onCheckedChange={(checked) => setSlackIntegration(checked)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Admin Email Recipients</Label>
                <Input
                  placeholder="admin1@nec.gov.sl, admin2@nec.gov.sl"
                  value={adminEmailRecipients}
                  onChange={(e) => setAdminEmailRecipients(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Emergency Contact Number</Label>
                <Input
                  placeholder="+232 76 123 4567"
                  value={emergencyContactNumber}
                  onChange={(e) => setEmergencyContactNumber(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription className="text-sm">General system settings and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">System Timezone</Label>
                  <Select value={systemTimezone} onValueChange={(value) => setSystemTimezone(value)}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Default Language</Label>
                  <Select value={defaultLanguage} onValueChange={(value) => setDefaultLanguage(value)}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="krio">Krio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">Maintenance Mode</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Temporarily disable public access</div>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={handleMaintenanceModeToggle} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm sm:text-base">Debug Mode</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Enable detailed error logging</div>
                  </div>
                  <Switch checked={debugMode} onCheckedChange={(checked) => setDebugMode(checked)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base"
        >
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Dialog open={openMaintenanceDialog} onOpenChange={setOpenMaintenanceDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Maintenance Mode</DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to enable maintenance mode? This will temporarily disable public access to the
              platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpenMaintenanceDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" onClick={confirmMaintenanceMode} className="w-full sm:w-auto">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}