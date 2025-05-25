import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Eye, Filter, AlertTriangle, Info, Shield, User, Vote, Settings } from "lucide-react";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/utils/date-range-picker";
import type { DateRange } from "react-day-picker";

interface AuditLogsProps {
  searchQuery: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: "authentication" | "user_management" | "election" | "system" | "security";
  user: string;
  userRole: string;
  details: string;
  ipAddress: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "success" | "failure" | "warning";
}

const initialAuditLogs: AuditLog[] = [
  {
    id: "LOG-001",
    timestamp: "2025-05-23T10:30:15Z",
    action: "Admin login successful",
    category: "authentication",
    user: "Dr. Mohamed Kamara",
    userRole: "Super Administrator",
    details: "Successful login from admin panel",
    ipAddress: "192.168.1.100",
    severity: "low",
    status: "success",
  },
  {
    id: "LOG-002",
    timestamp: "2025-05-23T10:25:42Z",
    action: "Voter account created",
    category: "user_management",
    user: "Ibrahim Sesay",
    userRole: "System Operator",
    details: "New voter account created for Aminata Sesay (VID-2025-001234)",
    ipAddress: "192.168.1.105",
    severity: "medium",
    status: "success",
  },
  {
    id: "LOG-003",
    timestamp: "2025-05-23T10:20:18Z",
    action: "Failed login attempt",
    category: "security",
    user: "Unknown",
    userRole: "N/A",
    details: "Multiple failed login attempts detected from suspicious IP",
    ipAddress: "203.45.67.89",
    severity: "high",
    status: "failure",
  },
  {
    id: "LOG-004",
    timestamp: "2025-05-23T10:15:33Z",
    action: "Election published to blockchain",
    category: "election",
    user: "Fatima Bangura",
    userRole: "Election Manager",
    details: "Presidential Election 2025 published to blockchain with 4 candidates",
    ipAddress: "192.168.1.102",
    severity: "medium",
    status: "success",
  },
  {
    id: "LOG-005",
    timestamp: "2025-05-23T10:10:07Z",
    action: "System configuration updated",
    category: "system",
    user: "Dr. Mohamed Kamara",
    userRole: "Super Administrator",
    details: "Blockchain gas price updated from 5 to 7 Gwei",
    ipAddress: "192.168.1.100",
    severity: "medium",
    status: "success",
  },
  {
    id: "LOG-006",
    timestamp: "2025-05-23T09:55:21Z",
    action: "Voter account suspended",
    category: "user_management",
    user: "Ibrahim Sesay",
    userRole: "System Operator",
    details: "Voter account VID-2025-001236 suspended due to suspicious activity",
    ipAddress: "192.168.1.105",
    severity: "high",
    status: "warning",
  },
];

export function AuditLogs({ searchQuery }: AuditLogsProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  useEffect(() => {
    setLogs(initialAuditLogs);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === "all" || log.category === filterCategory;
    const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || log.status === filterStatus;

    let matchesDateRange = true;
    if (dateRange?.from) {
      const logDate = new Date(log.timestamp);
      const fromDate = dateRange.from;
      const toDate = dateRange.to ?? new Date(); // Default to today if to is undefined
      toDate.setHours(23, 59, 59, 999); // End of day
      matchesDateRange = logDate >= fromDate && logDate <= toDate;
    }

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus && matchesDateRange;
  });

  const handleClearFilters = () => {
    setFilterCategory("all");
    setFilterSeverity("all");
    setFilterStatus("all");
    setDateRange(undefined);
  };

  const handleExportLogs = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(filteredLogs, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "audit-logs.json";
    link.click();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "authentication":
        return <Shield className="h-4 w-4" />;
      case "user_management":
        return <User className="h-4 w-4" />;
      case "election":
        return <Vote className="h-4 w-4" />;
      case "system":
        return <Settings className="h-4 w-4" />;
      case "security":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "authentication":
        return <Badge className="bg-blue-500">Authentication</Badge>;
      case "user_management":
        return <Badge className="bg-green-500">User Management</Badge>;
      case "election":
        return <Badge className="bg-purple-500">Election</Badge>;
      case "system":
        return <Badge className="bg-gray-500">System</Badge>;
      case "security":
        return <Badge className="bg-red-500">Security</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getSeverityBadge = (category: string) => {
    switch (category) {
      case "low":
        return <Badge variant="outline" className="border-green-500 text-green-600">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="border-orange-500 text-orange-600">High</Badge>;
      case "critical":
        return <Badge variant="outline" className="border-red-500 text-red-600">Critical</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">Success</Badge>;
      case "failure":
        return <Badge className="bg-red-500">Failure</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-primary">Audit Logs</h1>
          <p className="text-muted-foreground text-sm sm:text-base">System activity logs and security events</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base"
          onClick={handleExportLogs}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="user_management">User Management</SelectItem>
                  <SelectItem value="election">Election</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Severity</Label>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Date Range</Label>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
              {dateRange?.from ? (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {format(dateRange.from, "MMM dd, yyyy")} {dateRange.to ? `- ${format(dateRange.to, "MMM dd, yyyy")}` : ""}
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">Select a date range</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Actions</Label>
              <Button variant="outline" className="w-full text-sm sm:text-base" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Activity Logs</CardTitle>
          <CardDescription className="text-sm sm:text-base">{filteredLogs.length} log entries found</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Timestamp</TableHead>
                <TableHead className="text-xs sm:text-sm">Action</TableHead>
                <TableHead className="text-xs sm:text-sm">Category</TableHead>
                <TableHead className="text-xs sm:text-sm">User</TableHead>
                <TableHead className="text-xs sm:text-sm">Severity</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-xs sm:text-sm">{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs sm:text-sm">{log.action}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-xs">{log.details}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(log.category)}
                      {getCategoryBadge(log.category)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs sm:text-sm">{log.user}</div>
                    <div className="text-xs text-muted-foreground">{log.userRole}</div>
                  </TableCell>
                  <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(log)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredLogs.length > logsPerPage && (
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {Array.from({ length: Math.ceil(filteredLogs.length / logsPerPage) }, (_, i) => i + 1).map((number) => (
            <Button
              key={number}
              variant="outline"
              size="sm"
              className={`text-xs sm:text-sm ${currentPage === number ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => paginate(number)}
            >
              {number}
            </Button>
          ))}
        </div>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={showLogDetail} onOpenChange={setShowLogDetail}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Audit Log Details</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Detailed information about this system event</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium text-sm sm:text-base">Log ID</Label>
                  <div className="text-xs sm:text-sm font-mono">{selectedLog.id}</div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-sm sm:text-base">Timestamp</Label>
                  <div className="text-xs sm:text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-sm sm:text-base">Action</Label>
                <div className="text-xs sm:text-sm">{selectedLog.action}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium text-sm sm:text-base">Category</Label>
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(selectedLog.category)}
                    {getCategoryBadge(selectedLog.category)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-sm sm:text-base">Severity</Label>
                  {getSeverityBadge(selectedLog.severity)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium text-sm sm:text-base">User</Label>
                  <div className="text-xs sm:text-sm">
                    <div>{selectedLog.user}</div>
                    <div className="text-muted-foreground">{selectedLog.userRole}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-sm sm:text-base">Status</Label>
                  {getStatusBadge(selectedLog.status)}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-sm sm:text-base">IP Address</Label>
                <div className="text-xs sm:text-sm font-mono">{selectedLog.ipAddress}</div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-sm sm:text-base">Details</Label>
                <div className="text-xs sm:text-sm p-3 bg-gray-50 rounded-md">{selectedLog.details}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}