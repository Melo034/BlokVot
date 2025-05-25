import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Vote,
    Shield,
    Bell,
    Lock,
    Eye,
    EyeOff,
    Download,
    CheckCircle,
    AlertCircle,
    Calendar,
    Mail,
    Edit,
    Save,
    X,
    Smartphone,
    Key,
    Clock,
    Upload,
    Camera,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"

interface VotingRecord {
    id: string
    electionTitle: string
    date: string
    time: string
    verificationCode: string
    status: "verified" | "pending"
    blockNumber: string
    transactionHash: string
}


const Profile = () => {

    const [activeTab, setActiveTab] = useState("overview")
    const [isEditing, setIsEditing] = useState(false)
    const [showVerificationCode, setShowVerificationCode] = useState<string | null>(null)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false)
    const [showImageUpload, setShowImageUpload] = useState(false)

    // Mock user data
    const userData = {
        id: "VID-2025-001234",
        name: "Aminata Sesay",
        email: "aminata.sesay@email.com",
        phone: "+232 76 123 4567",
        dateOfBirth: "1985-03-15",
        address: "15 Kissy Street, Freetown",
        district: "Western Area Urban",
        constituency: "Constituency 110",
        registrationDate: "2024-01-15",
        profileImage: "/placeholder.svg?height=100&width=100",
        verificationStatus: "verified",
        twoFactorEnabled: true,
        emailNotifications: true,
        smsNotifications: false,
        securityAlerts: true,
    }

    // Mock voting history
    const votingHistory: VotingRecord[] = [
        {
            id: "1",
            electionTitle: "Presidential Election 2025",
            date: "2025-05-15",
            time: "14:30",
            verificationCode: "SL789456",
            status: "verified",
            blockNumber: "15482934",
            transactionHash: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        },
        {
            id: "2",
            electionTitle: "Parliamentary Election 2025",
            date: "2025-05-15",
            time: "14:35",
            verificationCode: "SL789457",
            status: "verified",
            blockNumber: "15482935",
            transactionHash: "0x8a3f47Dd7745D0643936b4b855Cd565f5549g55f",
        },
        {
            id: "3",
            electionTitle: "Local Council Election 2024",
            date: "2024-11-20",
            time: "10:15",
            verificationCode: "SL654321",
            status: "verified",
            blockNumber: "14892456",
            transactionHash: "0x9b4g58Ee8856E0754047c5c966De676g6660h66g",
        },
    ]

    const handleSaveProfile = () => {
        setIsEditing(false)
        // In a real app, this would save to the backend
    }

    const handleDownloadVotingRecord = (record: VotingRecord) => {
        // In a real app, this would generate and download a PDF receipt
        console.log("Downloading voting record for:", record.electionTitle)
    }


    return (
        <div>
            <Navbar />
            <main className="container mx-auto max-w-7xl py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary">My Profile</h1>
                    <p className="text-muted-foreground mt-2">Manage your account settings and view your voting history</p>
                </div>
                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Profile Summary Card */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <div className="flex justify-center mb-4 relative group">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={userData.profileImage || "/placeholder.svg"} alt={userData.name} />
                                        <AvatarFallback className="text-2xl">
                                            {userData.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute bottom-0 right-0 rounded-full bg-white border-primary text-primary hover:bg-primary/10"
                                        onClick={() => setShowImageUpload(true)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardTitle className="text-xl">{userData.name}</CardTitle>
                                <CardDescription>Voter ID: {userData.id}</CardDescription>
                                <div className="flex justify-center mt-2">
                                    <Badge className="bg-green-500">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Verified
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{votingHistory.length}</div>
                                    <div className="text-sm text-muted-foreground">Elections Participated</div>
                                </div>
                                <Separator />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>District:</span>
                                        <span className="font-medium">{userData.district}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Constituency:</span>
                                        <span className="font-medium">{userData.constituency}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Registered:</span>
                                        <span className="font-medium">{new Date(userData.registrationDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="history">Voting History</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>Personal Information</CardTitle>
                                            <CardDescription>Your registered voter information</CardDescription>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="border-primary text-primary"
                                        >
                                            {isEditing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                                            {isEditing ? "Cancel" : "Edit"}
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Full Name</Label>
                                                <Input
                                                    id="fullName"
                                                    defaultValue={userData.name}
                                                    disabled={!isEditing}
                                                    className={isEditing ? "" : "bg-gray-50"}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    defaultValue={userData.email}
                                                    disabled={!isEditing}
                                                    className={isEditing ? "" : "bg-gray-50"}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    defaultValue={userData.phone}
                                                    disabled={!isEditing}
                                                    className={isEditing ? "" : "bg-gray-50"}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                                <Input
                                                    id="dateOfBirth"
                                                    type="date"
                                                    defaultValue={userData.dateOfBirth}
                                                    disabled={!isEditing}
                                                    className={isEditing ? "" : "bg-gray-50"}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="address">Address</Label>
                                                <Input
                                                    id="address"
                                                    defaultValue={userData.address}
                                                    disabled={!isEditing}
                                                    className={isEditing ? "" : "bg-gray-50"}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="district">District</Label>
                                                <Select disabled={!isEditing}>
                                                    <SelectTrigger className={isEditing ? "" : "bg-gray-50"}>
                                                        <SelectValue placeholder={userData.district} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="western-urban">Western Area Urban</SelectItem>
                                                        <SelectItem value="western-rural">Western Area Rural</SelectItem>
                                                        <SelectItem value="northern">Northern Province</SelectItem>
                                                        <SelectItem value="southern">Southern Province</SelectItem>
                                                        <SelectItem value="eastern">Eastern Province</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="constituency">Constituency</Label>
                                                <Input
                                                    id="constituency"
                                                    defaultValue={userData.constituency}
                                                    disabled={!isEditing}
                                                    className={isEditing ? "" : "bg-gray-50"}
                                                />
                                            </div>
                                        </div>
                                        {isEditing && (
                                            <div className="flex justify-end">
                                                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Save Changes
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Status</CardTitle>
                                        <CardDescription>Your current account verification and security status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                                <Shield className="h-8 w-8 text-blue-500" />
                                                <div>
                                                    <div className="font-medium">2FA Enabled</div>
                                                    <div className="text-sm text-muted-foreground">Account secured with 2FA</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                                <Vote className="h-8 w-8 text-emerald-500" />
                                                <div>
                                                    <div className="font-medium">Eligible to Vote</div>
                                                    <div className="text-sm text-muted-foreground">All requirements met</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Voting History Tab */}
                            <TabsContent value="history" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Voting History</CardTitle>
                                        <CardDescription>
                                            Your complete voting record with verification details. All votes are securely recorded on the
                                            blockchain.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {votingHistory.map((record) => (
                                                <Card key={record.id} className="border-l-4 border-l-emerald-500">
                                                    <CardContent className="pt-6">
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                                                            <div className="space-y-2">
                                                                <h3 className="font-semibold text-lg">{record.electionTitle}</h3>
                                                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                                    <div className="flex items-center">
                                                                        <Calendar className="mr-1 h-4 w-4" />
                                                                        {new Date(record.date).toLocaleDateString()}
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Clock className="mr-1 h-4 w-4" />
                                                                        {record.time}
                                                                    </div>
                                                                    <Badge className="bg-green-500">
                                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                                        {record.status}
                                                                    </Badge>
                                                                </div>
                                                                <div className="space-y-1 text-sm">
                                                                    <div className="flex items-center">
                                                                        <span className="font-medium mr-2">Verification Code:</span>
                                                                        <code className="bg-gray-100 px-2 py-1 rounded">{record.verificationCode}</code>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                setShowVerificationCode(showVerificationCode === record.id ? null : record.id)
                                                                            }
                                                                        >
                                                                            {showVerificationCode === record.id ? (
                                                                                <EyeOff className="h-4 w-4" />
                                                                            ) : (
                                                                                <Eye className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                    {showVerificationCode === record.id && (
                                                                        <div className="mt-2 p-3 bg-gray-50 rounded-md space-y-1">
                                                                            <div className="text-xs">
                                                                                <span className="font-medium">Block Number:</span> {record.blockNumber}
                                                                            </div>
                                                                            <div className="text-xs">
                                                                                <span className="font-medium">Transaction Hash:</span>
                                                                                <code className="ml-1 break-all">{record.transactionHash}</code>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDownloadVotingRecord(record)}
                                                                    className="border-primary text-primary"
                                                                >
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download Receipt
                                                                </Button>
                                                                <Link to={`/verify?code=${record.verificationCode}`}>
                                                                    <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
                                                                        <Shield className="mr-2 h-4 w-4" />
                                                                        Verify
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Security Settings</CardTitle>
                                        <CardDescription>Manage your account security and authentication methods</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Lock className="h-5 w-5 text-blue-500" />
                                                    <div>
                                                        <div className="font-medium">Password</div>
                                                        <div className="text-sm text-muted-foreground">Last changed 30 days ago</div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowChangePassword(true)}
                                                    className="border-primary text-primary"
                                                >
                                                    Change Password
                                                </Button>
                                            </div>

                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Smartphone className="h-5 w-5 text-green-500" />
                                                    <div>
                                                        <div className="font-medium">Two-Factor Authentication</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {userData.twoFactorEnabled ? "Enabled via SMS" : "Not enabled"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowTwoFactorSetup(true)}
                                                    className="border-emerald-500 text-emerald-600"
                                                >
                                                    {userData.twoFactorEnabled ? "Manage" : "Enable"}
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h3 className="font-medium">Security Alerts</h3>
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Recent Security Activity</AlertTitle>
                                                <AlertDescription>
                                                    Your account was accessed from a new device on May 15, 2025 at 2:30 PM. If this wasn't you,
                                                    please change your password immediately.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Privacy Settings</CardTitle>
                                        <CardDescription>Control how your information is used and displayed</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Public Voting Statistics</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Allow your voting participation to be included in public statistics
                                                </div>
                                            </div>
                                            <Switch defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">Research Participation</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Allow anonymized data to be used for electoral research
                                                </div>
                                            </div>
                                            <Switch />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Settings Tab */}
                            <TabsContent value="settings" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notification Preferences</CardTitle>
                                        <CardDescription>Choose how you want to receive updates and alerts</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Mail className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <div className="font-medium">Email Notifications</div>
                                                    <div className="text-sm text-muted-foreground">Election updates and reminders</div>
                                                </div>
                                            </div>
                                            <Switch defaultChecked={userData.emailNotifications} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Bell className="h-5 w-5 text-orange-500" />
                                                <div>
                                                    <div className="font-medium">Security Alerts</div>
                                                    <div className="text-sm text-muted-foreground">Login attempts and security events</div>
                                                </div>
                                            </div>
                                            <Switch defaultChecked={userData.securityAlerts} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Actions</CardTitle>
                                        <CardDescription>Manage your account data and preferences</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                                <div className="font-medium">Download Account Data</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Get a copy of all your account information and voting history
                                                </div>
                                            </div>
                                            <Button variant="outline" className="border-primary text-primary">
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                                            <div>
                                                <div className="font-medium text-red-600">Delete Account</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Permanently delete your account and all associated data
                                                </div>
                                            </div>
                                            <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                                                Delete Account
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            {/* Change Password Dialog */}
            <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label>Password Strength</Label>
                            <Progress value={75} className="h-2" />
                            <p className="text-sm text-muted-foreground">Strong password</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowChangePassword(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">Change Password</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Two-Factor Setup Dialog */}
            <Dialog open={showTwoFactorSetup} onOpenChange={setShowTwoFactorSetup}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Two-Factor Authentication</DialogTitle>
                        <DialogDescription>Secure your account with an additional layer of protection.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="cursor-pointer hover:bg-gray-50">
                                <CardContent className="pt-6 text-center">
                                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                                    <div className="font-medium">SMS</div>
                                    <div className="text-sm text-muted-foreground">Receive codes via text message</div>
                                </CardContent>
                            </Card>
                            <Card className="cursor-pointer hover:bg-gray-50">
                                <CardContent className="pt-6 text-center">
                                    <Key className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                    <div className="font-medium">Authenticator App</div>
                                    <div className="text-sm text-muted-foreground">Use an authenticator app</div>
                                </CardContent>
                            </Card>
                        </div>
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Security Recommendation</AlertTitle>
                            <AlertDescription>
                                We strongly recommend enabling two-factor authentication to protect your voting account from
                                unauthorized access.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTwoFactorSetup(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600">Setup 2FA</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Profile Image Upload Dialog */}
            <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>Upload a new profile picture or take a photo.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                                {userData.profileImage ? (
                                    <img
                                        src={userData.profileImage || "/placeholder.svg"}
                                        alt="Profile preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-4">
                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">No image selected</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Upload Options</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="profile-image"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => {
                                            // In a real app, this would handle the file upload
                                            console.log("File selected:", e.target.files?.[0])
                                        }}
                                    />
                                    <Button variant="outline" className="w-full flex items-center justify-center">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose File
                                    </Button>
                                </div>
                                <Button variant="outline" className="w-full flex items-center justify-center">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Take Photo
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Image Guidelines</Label>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                                <li>Image should clearly show your face</li>
                                <li>Maximum file size: 5MB</li>
                                <li>Supported formats: JPG, PNG, GIF</li>
                            </ul>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImageUpload(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">Save Profile Picture</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Footer />
        </div>
    )
}

export default Profile


