import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Plus, MoreHorizontal, Edit, Trash2, UserCheck, UserX, Download, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmationDialog } from "@/components/utils/confirmation-dialog";

interface UserManagementProps {
  searchQuery: string;
}

interface Voter {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  constituency: string;
  status: "active" | "inactive" | "pending" | "suspended";
  registrationDate: string;
  lastLogin: string;
  votingHistory: number;
  verificationStatus: "verified" | "pending" | "rejected";
}

const voterSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  phone: z.string().min(8, {
    message: "Phone number must be at least 8 characters.",
  }),
  district: z.string().min(1, {
    message: "Please select a district.",
  }),
  constituency: z.string().min(3, {
    message: "Constituency must be at least 3 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
});

export function UserManagement({ searchQuery }: UserManagementProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Voter | null>(null);
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVerification, setFilterVerification] = useState("all");
  const [voters, setVoters] = useState<Voter[]>([
    {
      id: "VID-2025-001234",
      name: "Aminata Sesay",
      email: "aminata.sesay@email.com",
      phone: "+232 76 123 4567",
      district: "Western Area Urban",
      constituency: "Constituency 110",
      status: "active",
      registrationDate: "2024-01-15",
      lastLogin: "2025-05-23T10:30:00Z",
      votingHistory: 3,
      verificationStatus: "verified",
    },
    {
      id: "VID-2025-001235",
      name: "Mohamed Kamara",
      email: "m.kamara@email.com",
      phone: "+232 77 234 5678",
      district: "Northern Province",
      constituency: "Constituency 045",
      status: "pending",
      registrationDate: "2025-05-20",
      lastLogin: "Never",
      votingHistory: 0,
      verificationStatus: "pending",
    },
    {
      id: "VID-2025-001236",
      name: "Fatima Bangura",
      email: "f.bangura@email.com",
      phone: "+232 78 345 6789",
      district: "Southern Province",
      constituency: "Constituency 078",
      status: "suspended",
      registrationDate: "2024-03-10",
      lastLogin: "2025-05-15T14:20:00Z",
      votingHistory: 2,
      verificationStatus: "verified",
    },
  ]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionOnUser, setActionOnUser] = useState<string | null>(null);
  const [userIdToActOn, setUserIdToActOn] = useState<string | null>(null);

  const filteredVoters = voters.filter((voter) => {
    const matchesSearch =
      voter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "active" && voter.status === "active") ||
      (selectedTab === "pending" && voter.status === "pending") ||
      (selectedTab === "suspended" && voter.status === "suspended");

    const matchesDistrict = filterDistrict === "all" || voter.district === filterDistrict;
    const matchesStatus = filterStatus === "all" || voter.status === filterStatus;
    const matchesVerification = filterVerification === "all" || voter.verificationStatus === filterVerification;

    return matchesSearch && matchesTab && matchesDistrict && matchesStatus && matchesVerification;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-red-500">Suspended</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditUser = (user: Voter) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleDeleteUser = (userId: string) => {
    setConfirmDialogOpen(true);
    setActionOnUser("delete");
    setUserIdToActOn(userId);
  };

  const handleSuspendUser = (userId: string) => {
    setConfirmDialogOpen(true);
    setActionOnUser("suspend");
    setUserIdToActOn(userId);
  };

  const handleActivateUser = (userId: string) => {
    setConfirmDialogOpen(true);
    setActionOnUser("activate");
    setUserIdToActOn(userId);
  };

  const confirmAction = () => {
    if (!userIdToActOn) return;

    let updatedVoters = [...voters];

    switch (actionOnUser) {
      case "delete":
        updatedVoters = voters.filter((voter) => voter.id !== userIdToActOn);
        toast.success("Success", {
          description: "User deleted successfully.",
        });
        break;
      case "suspend":
        updatedVoters = voters.map((voter) =>
          voter.id === userIdToActOn ? { ...voter, status: "suspended" } : voter
        );
        toast.success("Success", {
          description: "User suspended successfully.",
        });
        break;
      case "activate":
        updatedVoters = voters.map((voter) =>
          voter.id === userIdToActOn ? { ...voter, status: "active" } : voter
        );
        toast.success("Success", {
          description: "User activated successfully.",
        });
        break;
      default:
        break;
    }

    setVoters(updatedVoters);
    setConfirmDialogOpen(false);
    setActionOnUser(null);
    setUserIdToActOn(null);
  };

  const cancelAction = () => {
    setConfirmDialogOpen(false);
    setActionOnUser(null);
    setUserIdToActOn(null);
  };

  const AddUserForm = () => {
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm<z.infer<typeof voterSchema>>({
      resolver: zodResolver(voterSchema),
    });

    const onSubmit = (data: z.infer<typeof voterSchema>) => {
      const newVoter: Voter = {
        id: `VID-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0")}`,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        district: data.district,
        constituency: data.constituency,
        status: "pending",
        registrationDate: new Date().toISOString().split("T")[0],
        lastLogin: "Never",
        votingHistory: 0,
        verificationStatus: "pending",
      };

      setVoters([...voters, newVoter]);
      setShowAddUser(false);
      reset();
      toast.success("Success", {
        description: "New voter account created successfully.",
      });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
            <Input id="firstName" placeholder="Enter first name" {...register("firstName")} className="text-sm sm:text-base" />
            {errors.firstName && <p className="text-red-500 text-xs sm:text-sm">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
            <Input id="lastName" placeholder="Enter last name" {...register("lastName")} className="text-sm sm:text-base" />
            {errors.lastName && <p className="text-red-500 text-xs sm:text-sm">{errors.lastName.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
            <Input id="email" type="email" placeholder="Enter email address" {...register("email")} className="text-sm sm:text-base" />
            {errors.email && <p className="text-red-500 text-xs sm:text-sm">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
            <Input id="phone" placeholder="Enter phone number" {...register("phone")} className="text-sm sm:text-base" />
            {errors.phone && <p className="text-red-500 text-xs sm:text-sm">{errors.phone.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="district" className="text-sm sm:text-base">District</Label>
            <Select {...register("district")}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Western Area Urban">Western Area Urban</SelectItem>
                <SelectItem value="Western Area Rural">Western Area Rural</SelectItem>
                <SelectItem value="Northern Province">Northern Province</SelectItem>
                <SelectItem value="Southern Province">Southern Province</SelectItem>
                <SelectItem value="Eastern Province">Eastern Province</SelectItem>
              </SelectContent>
            </Select>
            {errors.district && <p className="text-red-500 text-xs sm:text-sm">{errors.district.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="constituency" className="text-sm sm:text-base">Constituency</Label>
            <Input id="constituency" placeholder="Enter constituency" {...register("constituency")} className="text-sm sm:text-base" />
            {errors.constituency && <p className="text-red-500 text-xs sm:text-sm">{errors.constituency.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm sm:text-base">Address</Label>
          <Input id="address" placeholder="Enter full address" {...register("address")} className="text-sm sm:text-base" />
          {errors.address && <p className="text-red-500 text-xs sm:text-sm">{errors.address.message}</p>}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setShowAddUser(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            Create Voter Account
          </Button>
        </DialogFooter>
      </form>
    );
  };

  const EditUserForm = ({ user }: { user: Voter }) => {
    const [firstName, setFirstName] = useState(user.name.split(" ")[0]);
    const [lastName, setLastName] = useState(user.name.split(" ")[1] || "");
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone);
    const [district, setDistrict] = useState(user.district);
    const [constituency, setConstituency] = useState(user.constituency);
    const [status, setStatus] = useState<string>(user.status);
    const [verificationStatus, setVerificationStatus] = useState<string>(user.verificationStatus);

    const handleSaveChanges = () => {
      const updatedVoter: Voter = {
        ...user,
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        district: district,
        constituency: constituency,
        status: status as "active" | "inactive" | "pending" | "suspended",
        verificationStatus: verificationStatus as "verified" | "pending" | "rejected",
      };

      const updatedVoters = voters.map((voter) => (voter.id === user.id ? updatedVoter : voter));
      setVoters(updatedVoters);
      setShowEditUser(false);
      toast.success("Success", {
        description: "Voter details updated successfully.",
      });
    };

    return (
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editFirstName" className="text-sm sm:text-base">First Name</Label>
            <Input id="editFirstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="text-sm sm:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editLastName" className="text-sm sm:text-base">Last Name</Label>
            <Input id="editLastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="text-sm sm:text-base" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editEmail" className="text-sm sm:text-base">Email Address</Label>
            <Input id="editEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm sm:text-base" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editPhone" className="text-sm sm:text-base">Phone Number</Label>
            <Input id="editPhone" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-sm sm:text-base" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editDistrict" className="text-sm sm:text-base">District</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Western Area Urban">Western Area Urban</SelectItem>
                <SelectItem value="Western Area Rural">Western Area Rural</SelectItem>
                <SelectItem value="Northern Province">Northern Province</SelectItem>
                <SelectItem value="Southern Province">Southern Province</SelectItem>
                <SelectItem value="Eastern Province">Eastern Province</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editConstituency" className="text-sm sm:text-base">Constituency</Label>
            <Input id="editConstituency" value={constituency} onChange={(e) => setConstituency(e.target.value)} className="text-sm sm:text-base" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="editStatus" className="text-sm sm:text-base">Account Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editVerification" className="text-sm sm:text-base">Verification Status</Label>
            <Select value={verificationStatus} onValueChange={setVerificationStatus}>
              <SelectTrigger className="text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setShowEditUser(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </div>
    );
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(filteredVoters, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "voter_data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast("Success", {
      description: "Voter data exported successfully.",
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-primary">Voter Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage voter accounts and permissions</p>
        </div>
        <Button
          onClick={() => setShowAddUser(true)}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto text-sm sm:text-base"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Voter
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">District</Label>
              <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="Western Area Urban">Western Area Urban</SelectItem>
                  <SelectItem value="Western Area Rural">Western Area Rural</SelectItem>
                  <SelectItem value="Northern Province">Northern Province</SelectItem>
                  <SelectItem value="Southern Province">Southern Province</SelectItem>
                  <SelectItem value="Eastern Province">Eastern Province</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Verification</Label>
              <Select value={filterVerification} onValueChange={setFilterVerification}>
                <SelectTrigger className="text-sm sm:text-base">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Actions</Label>
              <Button
                variant="outline"
                className="w-full text-sm sm:text-base"
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voter Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-4 py-2">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Voters ({voters.length})</TabsTrigger>
          <TabsTrigger value="active" className="text-xs sm:text-sm">
            Active ({voters.filter((v) => v.status === "active").length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pending ({voters.filter((v) => v.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="suspended" className="text-xs sm:text-sm">
            Suspended ({voters.filter((v) => v.status === "suspended").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Voter Accounts</CardTitle>
              <CardDescription className="text-sm">{filteredVoters.length} voters found</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Voter</TableHead>
                    <TableHead className="text-xs sm:text-sm">Contact</TableHead>
                    <TableHead className="text-xs sm:text-sm">Location</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Verification</TableHead>
                    <TableHead className="text-xs sm:text-sm">Voting History</TableHead>
                    <TableHead className="text-xs sm:text-sm">Last Login</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVoters.map((voter) => (
                    <TableRow key={voter.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src="/placeholder.svg" alt={voter.name} />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {voter.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm sm:text-base">{voter.name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">{voter.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs sm:text-sm">
                          <div>{voter.email}</div>
                          <div className="text-muted-foreground">{voter.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs sm:text-sm">
                          <div>{voter.district}</div>
                          <div className="text-muted-foreground">{voter.constituency}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(voter.status)}</TableCell>
                      <TableCell>{getVerificationBadge(voter.verificationStatus)}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{voter.votingHistory} elections</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        {voter.lastLogin === "Never" ? (
                          <span className="text-muted-foreground">Never</span>
                        ) : (
                          new Date(voter.lastLogin).toLocaleDateString()
                        )}
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
                            <DropdownMenuItem onClick={() => handleEditUser(voter)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {voter.status === "active" ? (
                              <DropdownMenuItem onClick={() => handleSuspendUser(voter.id)}>
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleActivateUser(voter.id)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate Account
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(voter.id)} className="text-red-600">
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
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Voter</DialogTitle>
            <DialogDescription className="text-sm">
              Create a new voter account. All fields are required for voter registration.
            </DialogDescription>
          </DialogHeader>
          <AddUserForm />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Voter Details</DialogTitle>
            <DialogDescription className="text-sm">
              Update voter information. Changes will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && <EditUserForm user={selectedUser} />}
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) cancelAction();
        }}
        onConfirm={confirmAction}
        onClose={cancelAction}
        title="Are you sure?"
        description={`This action cannot be undone. Are you sure you want to ${actionOnUser} this user?`}
      />
    </div>
  );
}