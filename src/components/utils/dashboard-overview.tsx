import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Vote, Shield, Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface DashboardOverviewProps {
  stats: {
    totalVoters: number;
    activeElections: number;
    totalAdmins: number;
    systemUptime: string;
    pendingVerifications: number;
    flaggedAccounts: number;
  };
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const [blockchainSync, setBlockchainSync] = useState(98);
  const [databasePerformance, setDatabasePerformance] = useState(95);
  const [networkConnectivity, setNetworkConnectivity] = useState(100);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockchainSync((prev) => Math.min(100, prev + Math.random() * 2));
      setDatabasePerformance((prev) => Math.min(100, prev + Math.random() * 1.5));
      setNetworkConnectivity((prev) => Math.max(98, Math.min(100, prev + (Math.random() - 0.5))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReview = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Reviewing voter verifications...");
      setLoading(false);
    }, 1500);
  };

  const handleInvestigate = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Investigating flagged accounts...");
      setLoading(false);
    }, 1500);
  };

  const handleSchedule = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Scheduling system updates...");
      setLoading(false);
    }, 1500);
  };

  const handleAddVoter = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Navigating to add new voter page...");
      setLoading(false);
    }, 1500);
  };

  const handleCreateElection = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Navigating to create election page...");
      setLoading(false);
    }, 1500);
  };

  const handleExportReports = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Exporting reports...");
      setLoading(false);
    }, 1500);
  };

  const handleSecurityAudit = () => {
    setLoading(true);
    setTimeout(() => {
      alert("Initiating security audit...");
      setLoading(false);
    }, 1500);
  };

  const recentActivity = [
    {
      id: 1,
      action: "New voter registration",
      user: "Aminata Sesay",
      timestamp: "2 minutes ago",
      type: "info",
    },
    {
      id: 2,
      action: "Election published to blockchain",
      user: "System",
      timestamp: "15 minutes ago",
      type: "success",
    },
    {
      id: 3,
      action: "Suspicious login attempt blocked",
      user: "Security System",
      timestamp: "1 hour ago",
      type: "warning",
    },
    {
      id: 4,
      action: "Admin permissions updated",
      user: "Dr. Mohamed Kamara",
      timestamp: "2 hours ago",
      type: "info",
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-lg sm:text-2xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm sm:text-base">System overview and recent activity</p>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm sm:text-base font-medium">Total Voters</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalVoters.toLocaleString()}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm sm:text-base font-medium">Active Elections</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.activeElections}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Presidential & Parliamentary</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm sm:text-base font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.systemUptime}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm sm:text-base font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.totalAdmins}</div>
            <p className="text-xs sm:text-sm text-muted-foreground">Across all roles</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Pending Actions
            </CardTitle>
            <CardDescription className="text-sm">
              Items requiring administrator attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Voter Verifications */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Voter Verifications</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stats.pendingVerifications} pending approval</div>
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-xs sm:text-sm w-full sm:w-auto"
                onClick={handleReview}
                disabled={loading}
              >
                {loading ? "Loading..." : "Review"}
              </Button>
            </div>

            {/* Flagged Accounts */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">Flagged Accounts</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{stats.flaggedAccounts} accounts need review</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500 text-amber-600 text-xs sm:text-sm w-full sm:w-auto"
                onClick={handleInvestigate}
                disabled={loading}
              >
                {loading ? "Loading..." : "Investigate"}
              </Button>
            </div>

            {/* System Updates */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm sm:text-base">System Updates</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Security patch available</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-500 text-emerald-600 text-xs sm:text-sm w-full sm:w-auto"
                onClick={handleSchedule}
                disabled={loading}
              >
                {loading ? "Loading..." : "Schedule"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-sm">Latest system events and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                    {activity.type === "info" && <Activity className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium">{activity.action}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      by {activity.user} • {activity.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            System Health
          </CardTitle>
          <CardDescription className="text-sm">Real-time system performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Blockchain Sync</span>
                <span>{blockchainSync.toFixed(0)}%</span>
              </div>
              <Progress value={blockchainSync} className="h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">15,482 blocks synchronized</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Database Performance</span>
                <span>{databasePerformance.toFixed(0)}%</span>
              </div>
              <Progress value={databasePerformance} className="h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">Average response time: 120ms</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Network Connectivity</span>
                <span>{networkConnectivity.toFixed(0)}%</span>
              </div>
              <Progress value={networkConnectivity} className="h-2" />
              <p className="text-xs sm:text-sm text-muted-foreground">All nodes connected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
          <CardDescription className="text-sm">Frequently used administrative functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary hover:bg-primary/90 text-xs sm:text-sm"
              onClick={handleAddVoter}
              disabled={loading}
            >
              <Users className="h-6 w-6" />
              <span>{loading ? "Loading..." : "Add New Voter"}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-xs sm:text-sm"
              onClick={handleCreateElection}
              disabled={loading}
            >
              <Vote className="h-6 w-6" />
              <span>{loading ? "Loading..." : "Create Election"}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-xs sm:text-sm"
              onClick={handleExportReports}
              disabled={loading}
            >
              <Download className="h-6 w-6" />
              <span>{loading ? "Loading..." : "Export Reports"}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-xs sm:text-sm"
              onClick={handleSecurityAudit}
              disabled={loading}
            >
              <Shield className="h-6 w-6" />
              <span>{loading ? "Loading..." : "Security Audit"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}