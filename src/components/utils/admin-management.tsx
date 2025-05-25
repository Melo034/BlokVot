import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash2, Shield, UserCheck, UserX, Key, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminManagementProps {
  searchQuery: string;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "Super Administrator" | "Election Manager" | "System Operator" | "Auditor";
  permissions: string[];
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  createdDate: string;
  createdBy: string;
}

export function AdminManagement({ searchQuery }: AdminManagementProps) {
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showEditAdmin, setShowEditAdmin] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const [isSuspendAlertOpen, setIsSuspendAlertOpen] = useState(false);
  const [adminToSuspend, setAdminToSuspend] = useState<string | null>(null);

  // Form state for Add Admin dialog
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<
    "Election Manager" | "System Operator" | "Auditor" | "Super Administrator"
  >("Election Manager");
  const [newAdminPermissions, setNewAdminPermissions] = useState<string[]>([]);

  // Form state for Edit Admin dialog
  const [editAdminName, setEditAdminName] = useState("");
  const [editAdminEmail, setEditAdminEmail] = useState("");
  const [editAdminRole, setEditAdminRole] = useState<
    "Election Manager" | "System Operator" | "Auditor" | "Super Administrator"
  >("Election Manager");
  const [editAdminStatus, setEditAdminStatus] = useState<"active" | "inactive" | "suspended">("active");
  const [editAdminPermissions, setEditAdminPermissions] = useState<string[]>([]);

  // Form state for Permissions dialog
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);

  // Mock admin data
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: "ADM-001",
      name: "Dr. Mohamed Kamara",
      email: "m.kamara@nec.gov.sl",
      role: "Super Administrator",
      permissions: ["all"],
      status: "active",
      lastLogin: "2025-05-23T10:30:00Z",
      createdDate: "2024-01-01",
      createdBy: "System",
    },
    {
      id: "ADM-002",
      name: "Fatima Bangura",
      email: "f.bangura@nec.gov.sl",
      role: "Election Manager",
      permissions: ["manage_elections", "view_results", "manage_candidates"],
      status: "active",
      lastLogin: "2025-05-22T16:45:00Z",
      createdDate: "2024-02-15",
      createdBy: "Dr. Mohamed Kamara",
    },
    {
      id: "ADM-003",
      name: "Ibrahim Sesay",
      email: "i.sesay@nec.gov.sl",
      role: "System Operator",
      permissions: ["view_system_health", "manage_users", "view_audit_logs"],
      status: "active",
      lastLogin: "2025-05-23T09:15:00Z",
      createdDate: "2024-03-10",
      createdBy: "Dr. Mohamed Kamara",
    },
    {
      id: "ADM-004",
      name: "Aminata Koroma",
      email: "a.koroma@nec.gov.sl",
      role: "Auditor",
      permissions: ["view_audit_logs", "view_results", "export_reports"],
      status: "inactive",
      lastLogin: "2025-05-20T14:30:00Z",
      createdDate: "2024-04-05",
      createdBy: "Dr. Mohamed Kamara",
    },
  ]);

  const allPermissions = [
    { id: "manage_elections", label: "Manage Elections", description: "Create, edit, and publish elections" },
    { id: "manage_candidates", label: "Manage Candidates", description: "Add and edit candidate information" },
    { id: "manage_voters", label: "Manage Voters", description: "Add, edit, and manage voter accounts" },
    { id: "manage_admins", label: "Manage Administrators", description: "Add, edit, and manage admin accounts" },
    { id: "view_results", label: "View Results", description: "Access election results and analytics" },
    { id: "view_audit_logs", label: "View Audit Logs", description: "Access system audit logs and activity" },
    { id: "export_reports", label: "Export Reports", description: "Generate and export system reports" },
    { id: "system_settings", label: "System Settings", description: "Configure system settings and parameters" },
    { id: "view_system_health", label: "View System Health", description: "Monitor system performance and health" },
  ];

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Super Administrator":
        return <Badge className="bg-red-500">Super Admin</Badge>;
      case "Election Manager":
        return <Badge className="bg-blue-500">Election Manager</Badge>;
      case "System Operator":
        return <Badge className="bg-green-500">System Operator</Badge>;
      case "Auditor":
        return <Badge className="bg-purple-500">Auditor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-500">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditAdminName(admin.name);
    setEditAdminEmail(admin.email);
    setEditAdminRole(admin.role);
    setEditAdminStatus(admin.status);
    setEditAdminPermissions(admin.permissions);
    setShowEditAdmin(true);
  };

  const handleManagePermissions = (admin: Admin) => {
    setSelectedAdmin(admin);
    setTempPermissions(admin.permissions);
    setShowPermissions(true);
  };

  const handleDeleteAdmin = (adminId: string) => {
    setAdminToDelete(adminId);
    setIsDeleteAlertOpen(true);
  };

  const confirmDeleteAdmin = () => {
    if (adminToDelete) {
      setAdmins(admins.filter((admin) => admin.id !== adminToDelete));
      toast.success("Admin deleted", { description: "Admin account successfully deleted." });
    }
    setIsDeleteAlertOpen(false);
    setAdminToDelete(null);
  };

  const handleSuspendAdmin = (adminId: string) => {
    setAdminToSuspend(adminId);
    setIsSuspendAlertOpen(true);
  };

  const confirmSuspendAdmin = () => {
    if (adminToSuspend) {
      setAdmins(
        admins.map((admin) =>
          admin.id === adminToSuspend
            ? { ...admin, status: admin.status === "active" ? "suspended" : "active" }
            : admin
        )
      );
      toast.success("Admin status updated", {
        description: `Admin account ${admins.find((a) => a.id === adminToSuspend)?.status === "active" ? "suspended" : "activated"}.`,
      });
    }
    setIsSuspendAlertOpen(false);
    setAdminToSuspend(null);
  };

  const handleAddAdmin = () => {
    if (!newAdminName || !newAdminEmail || !newAdminRole) {
      toast.error("Error", { description: "Please fill in all required fields." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error("Error", { description: "Please enter a valid email address." });
      return;
    }
    const newAdmin: Admin = {
      id: `ADM-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      name: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      permissions: newAdminPermissions,
      status: "active",
      lastLogin: new Date().toISOString(),
      createdDate: new Date().toISOString(),
      createdBy: "Current User",
    };
    setAdmins([...admins, newAdmin]);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminRole("Election Manager");
    setNewAdminPermissions([]);
    setShowAddAdmin(false);
    toast.success("Admin added", { description: "New admin account successfully created." });
  };

  const handleEditAdminSubmit = () => {
    if (!editAdminName || !editAdminEmail || !editAdminRole || !editAdminStatus) {
      toast.error("Error", { description: "Please fill in all required fields." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editAdminEmail)) {
      toast.error("Error", { description: "Please enter a valid email address." });
      return;
    }
    setAdmins(
      admins.map((admin) =>
        admin.id === selectedAdmin?.id
          ? {
              ...admin,
              name: editAdminName,
              email: editAdminEmail,
              role: editAdminRole,
              status: editAdminStatus,
              permissions: editAdminPermissions,
            }
          : admin
      )
    );
    setShowEditAdmin(false);
    toast.success("Admin updated", { description: "Admin account successfully updated." });
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (showAddAdmin) {
      setNewAdminPermissions(
        checked
          ? [...newAdminPermissions, permissionId]
          : newAdminPermissions.filter((id) => id !== permissionId)
      );
    } else if (showEditAdmin) {
      setEditAdminPermissions(
        checked
          ? [...editAdminPermissions, permissionId]
          : editAdminPermissions.filter((id) => id !== permissionId)
      );
    } else if (showPermissions) {
      setTempPermissions(
        checked ? [...tempPermissions, permissionId] : tempPermissions.filter((id) => id !== permissionId)
      );
    }
  };

  const handleSavePermissions = () => {
    if (selectedAdmin) {
      setAdmins(
        admins.map((admin) =>
          admin.id === selectedAdmin.id ? { ...admin, permissions: tempPermissions } : admin
        )
      );
      toast.success("Permissions updated", { description: "Admin permissions successfully updated." });
    }
    setShowPermissions(false);
    setTempPermissions([]);
  };

  useEffect(() => {
    if (selectedAdmin) {
      setEditAdminName(selectedAdmin.name);
      setEditAdminEmail(selectedAdmin.email);
      setEditAdminRole(selectedAdmin.role);
      setEditAdminStatus(selectedAdmin.status);
      setEditAdminPermissions(selectedAdmin.permissions);
    }
  }, [selectedAdmin]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-primary">Administrator Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage administrator accounts and permissions</p>
        </div>
        <Button
          onClick={() => setShowAddAdmin(true)}
          className="bg-primary text-sm sm:text-base hover:bg-primary/90 w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Administrator
        </Button>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-600 text-sm sm:text-base">Security Notice</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm">
          Administrator actions are logged and audited. Only grant necessary permissions to maintain system security.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Administrator Accounts</CardTitle>
          <CardDescription className="text-sm sm:text-base">{filteredAdmins.length} administrators found</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Administrator</TableHead>
                <TableHead className="text-xs sm:text-sm">Role</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                <TableHead className="text-xs sm:text-sm">Last Login</TableHead>
                <TableHead className="text-xs sm:text-sm">Created</TableHead>
                <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src="/placeholder.svg" alt={admin.name} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {admin.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm sm:text-base">{admin.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">{admin.email}</div>
                        <div className="text-xs text-muted-foreground">{admin.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(admin.role)}</TableCell>
                  <TableCell>{getStatusBadge(admin.status)}</TableCell>
                  <TableCell>
                    <div className="text-xs sm:text-sm">{new Date(admin.lastLogin).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(admin.lastLogin).toLocaleTimeString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs sm:text-sm">{new Date(admin.createdDate).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">by {admin.createdBy}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditAdmin(admin)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManagePermissions(admin)}>
                          <Key className="mr-2 h-4 w-4" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {admin.status === "active" ? (
                          <DropdownMenuItem onClick={() => handleSuspendAdmin(admin.id)}>
                            <UserX className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleSuspendAdmin(admin.id)}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate Account
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600"
                          disabled={admin.role === "Super Administrator"}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Administrator</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Create a new administrator account with appropriate permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName" className="text-sm sm:text-base">Full Name</Label>
                <Input
                  id="adminName"
                  placeholder="Enter full name"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-sm sm:text-base">Email Address</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="Enter email address"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminRole" className="text-sm sm:text-base">Role</Label>
              <Select
                value={newAdminRole}
                onValueChange={(value) =>
                  setNewAdminRole(value as "Election Manager" | "System Operator" | "Auditor" | "Super Administrator")
                }
              >
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="Select administrator role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Super Administrator">Super Administrator</SelectItem>
                  <SelectItem value="Election Manager">Election Manager</SelectItem>
                  <SelectItem value="System Operator">System Operator</SelectItem>
                  <SelectItem value="Auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Permissions</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                {allPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.id}
                      checked={newAdminPermissions.includes(permission.id)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                    />
                    <Label htmlFor={permission.id} className="text-xs sm:text-sm">{permission.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle className="text-sm sm:text-base">Security Note</AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                The new administrator will receive login credentials via secure email. They must change their password
                on first login.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowAddAdmin(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={handleAddAdmin}>
              Create Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditAdmin} onOpenChange={setShowEditAdmin}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Administrator</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Update administrator details and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editAdminName" className="text-sm sm:text-base">Full Name</Label>
                  <Input
                    id="editAdminName"
                    value={editAdminName}
                    onChange={(e) => setEditAdminName(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAdminEmail" className="text-sm sm:text-base">Email Address</Label>
                  <Input
                    id="editAdminEmail"
                    type="email"
                    value={editAdminEmail}
                    onChange={(e) => setEditAdminEmail(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editAdminRole" className="text-sm sm:text-base">Role</Label>
                  <Select
                    value={editAdminRole}
                    onValueChange={(value) =>
                      setEditAdminRole(value as "Election Manager" | "System Operator" | "Auditor" | "Super Administrator")
                    }
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Super Administrator">Super Administrator</SelectItem>
                      <SelectItem value="Election Manager">Election Manager</SelectItem>
                      <SelectItem value="System Operator">System Operator</SelectItem>
                      <SelectItem value="Auditor">Auditor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editAdminStatus" className="text-sm sm:text-base">Status</Label>
                  <Select
                    value={editAdminStatus}
                    onValueChange={(value) => setEditAdminStatus(value as "active" | "inactive" | "suspended")}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                  {allPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission.id}`}
                        checked={editAdminPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                        disabled={selectedAdmin.role === "Super Administrator" && permission.id === "manage_admins"}
                      />
                      <Label htmlFor={`edit-${permission.id}`} className="text-xs sm:text-sm">{permission.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowEditAdmin(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={handleEditAdminSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Manage Permissions</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Update permissions for {selectedAdmin?.name || "selected administrator"}.
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Permissions</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                  {allPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={tempPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                        disabled={selectedAdmin.role === "Super Administrator" && permission.id === "manage_admins"}
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="text-xs sm:text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPermissions(false);
                setTempPermissions([]);
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={handleSavePermissions}>
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setAdminToDelete(null)} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAdmin} className="w-full sm:w-auto">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSuspendAlertOpen} onOpenChange={setIsSuspendAlertOpen}>
        <AlertDialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Confirm {admins.find((a) => a.id === adminToSuspend)?.status === "active" ? "Suspend" : "Activate"} Account
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              This will {admins.find((a) => a.id === adminToSuspend)?.status === "active" ? "suspend" : "activate"} the
              selected admin account.
            </DialogDescription>
          </DialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setAdminToSuspend(null)} className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmSuspendAdmin} className="w-full sm:w-auto">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}