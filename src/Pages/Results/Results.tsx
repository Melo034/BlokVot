import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3,
    Clock,
    Download,
    FileBarChart,
    Search,
    CheckCircle,
    ShieldCheck,
    AlertCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"



const Results = () => {

    const [selectedPoll, setSelectedPoll] = useState("presidential")
    const [selectedDistrict, setSelectedDistrict] = useState("all")
    const [verificationCode, setVerificationCode] = useState("")
    const [verificationResult, setVerificationResult] = useState<null | {
        status: "verified" | "not-found"
        timestamp?: string
        blockNumber?: string
        transactionHash?: string
        poll?: string
        candidate?: string
    }>(null)

    // Mock election data
    const presidentialResults = [
        { name: "Julius Maada Bio", party: "Sierra Leone People's Party", votes: 1245789, percentage: 42.3 },
        { name: "Samura Kamara", party: "All People's Congress", votes: 1056432, percentage: 35.9 },
        { name: "Kandeh Yumkella", party: "National Grand Coalition", votes: 487654, percentage: 16.6 },
        { name: "Samuel Williams", party: "National Unity Party", votes: 152345, percentage: 5.2 },
    ]

    const parliamentaryResults = [
        { name: "Michael Brown", party: "Sierra Leone People's Party", votes: 1156789, percentage: 39.3 },
        { name: "Elizabeth Taylor", party: "All People's Congress", votes: 1089432, percentage: 37.0 },
        { name: "David Wilson", party: "National Grand Coalition", votes: 512654, percentage: 17.4 },
        { name: "Patricia Garcia", party: "National Unity Party", votes: 184345, percentage: 6.3 },
    ]

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault()

        // Simulate blockchain verification
        if (verificationCode) {
            setTimeout(() => {
                if (verificationCode.startsWith("SL")) {
                    setVerificationResult({
                        status: "verified",
                        timestamp: new Date().toISOString(),
                        blockNumber: "15482934",
                        transactionHash:
                            "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
                        poll: "Presidential Election 2025",
                        candidate: "Julius Maada Bio",
                    })
                } else {
                    setVerificationResult({
                        status: "not-found",
                    })
                }
            }, 1000)
        }
    }

    return (
        <div>
            <Navbar />
            <main className="container mx-auto max-w-7xl px-4 py-16 sm:py-24">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Real-time Blockchain Tally</h1>
                        <p className="text-muted-foreground">Live results from the blockchain</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Last updated: 2 minutes ago</span>
                    </div>
                </div>

                <Tabs defaultValue="results" className="mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="results">Election Results</TabsTrigger>
                        <TabsTrigger value="verify">Verify Your Vote</TabsTrigger>
                    </TabsList>

                    <TabsContent value="results" className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <Card className="flex-1">
                                <CardHeader className="pb-2">
                                    <CardTitle>Total Votes Cast</CardTitle>
                                    <CardDescription>Secured on the blockchain</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">2,942,220</div>
                                    <p className="text-sm text-muted-foreground">78.4% of registered voters</p>
                                </CardContent>
                            </Card>
                            <Card className="flex-1">
                                <CardHeader className="pb-2">
                                    <CardTitle>Blockchain Blocks</CardTitle>
                                    <CardDescription>Containing vote transactions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">15,482</div>
                                    <p className="text-sm text-muted-foreground">100% verified by consensus</p>
                                </CardContent>
                            </Card>
                            <Card className="flex-1">
                                <CardHeader className="pb-2">
                                    <CardTitle>Verification Rate</CardTitle>
                                    <CardDescription>Voters who verified their votes</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">62.8%</div>
                                    <p className="text-sm text-muted-foreground">1,847,714 verifications</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileBarChart className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-semibold text-primary">Results by Election</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={selectedPoll} onValueChange={setSelectedPoll}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select election" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="presidential">Presidential</SelectItem>
                                        <SelectItem value="parliamentary">Parliamentary</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select district" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Districts</SelectItem>
                                        <SelectItem value="north">Northern Province</SelectItem>
                                        <SelectItem value="south">Southern Province</SelectItem>
                                        <SelectItem value="east">Eastern Province</SelectItem>
                                        <SelectItem value="west">Western Area</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" className="border-primary text-primary">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedPoll === "presidential" ? "Presidential Election Results" : "Parliamentary Election Results"}
                                </CardTitle>
                                <CardDescription>
                                    {selectedDistrict === "all"
                                        ? "Nationwide results"
                                        : `Results from ${selectedDistrict.charAt(0).toUpperCase() + selectedDistrict.slice(1)} Province`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {(selectedPoll === "presidential" ? presidentialResults : parliamentaryResults).map(
                                        (candidate, index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <div className="font-medium">{candidate.name}</div>
                                                        <div className="text-sm text-muted-foreground">{candidate.party}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium">{candidate.percentage}%</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {candidate.votes.toLocaleString()} votes
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-secondary">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{
                                                            width: `${candidate.percentage}%`,
                                                            backgroundColor:
                                                                index === 0
                                                                    ? "#0f766e"
                                                                    : // primary
                                                                    index === 1
                                                                        ? "#14b8a6"
                                                                        : // teal-500
                                                                        index === 2
                                                                            ? "#5eead4"
                                                                            : // teal-300
                                                                            "#99f6e4", // teal-200
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Blockchain Verification
                                </CardTitle>
                                <CardDescription>All votes are recorded on a public, immutable blockchain ledger</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="rounded-md bg-muted p-4">
                                        <h3 className="font-medium mb-2">How to verify the election integrity:</h3>
                                        <ol className="list-decimal pl-5 space-y-2 text-sm">
                                            <li>Each vote is recorded as a transaction on the blockchain</li>
                                            <li>Votes are anonymized but verifiable with your personal verification code</li>
                                            <li>The entire blockchain is publicly accessible for independent auditing</li>
                                            <li>Multiple independent nodes validate each transaction</li>
                                            <li>The consensus mechanism ensures no single entity can manipulate results</li>
                                        </ol>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="verify">
                        <Card>
                            <CardHeader>
                                <CardTitle>Verify Your Vote</CardTitle>
                                <CardDescription>Check that your vote was correctly recorded on the blockchain</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleVerify} className="space-y-4">
                                    <div className="flex space-x-2">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Enter your verification code (e.g., SL123456)"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value)}
                                            />
                                        </div>
                                        <Button type="submit" className="bg-primary hover:bg-teal-800">
                                            <Search className="h-4 w-4 mr-2" />
                                            Verify
                                        </Button>
                                    </div>

                                    {verificationResult && (
                                        <div className="mt-4">
                                            {verificationResult.status === "verified" ? (
                                                <Alert className="border-green-200 bg-green-50">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <AlertTitle className="text-green-600">Vote Successfully Verified</AlertTitle>
                                                    <AlertDescription>
                                                        <div className="mt-2 space-y-2">
                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <div className="font-medium">Poll:</div>
                                                                <div className="col-span-2">{verificationResult.poll}</div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <div className="font-medium">Candidate:</div>
                                                                <div className="col-span-2">{verificationResult.candidate}</div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <div className="font-medium">Timestamp:</div>
                                                                <div className="col-span-2">
                                                                    {new Date(verificationResult.timestamp!).toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <div className="font-medium">Block Number:</div>
                                                                <div className="col-span-2">{verificationResult.blockNumber}</div>
                                                            </div>
                                                            <Separator className="my-2" />
                                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                                <div className="font-medium">Transaction Hash:</div>
                                                                <div className="col-span-2 font-mono text-xs break-all">
                                                                    {verificationResult.transactionHash}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>Vote Not Found</AlertTitle>
                                                    <AlertDescription>
                                                        We couldn't find a vote with this verification code. Please check the code and try again.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <div className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ShieldCheck className="h-5 w-5 text-primary" />
                                        How Vote Verification Works
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            When you cast your vote, it is recorded on the blockchain with a unique verification code. This
                                            code allows you to verify that your vote was correctly recorded without revealing your identity.
                                        </p>

                                        <div className="rounded-md bg-muted p-4">
                                            <h3 className="font-medium mb-2">Verification Process:</h3>
                                            <ol className="list-decimal pl-5 space-y-2 text-sm">
                                                <li>Enter your verification code in the field above</li>
                                                <li>The system will search the blockchain for your vote transaction</li>
                                                <li>If found, you'll see details about your vote including timestamp and block number</li>
                                                <li>This confirms your vote was correctly recorded and included in the tally</li>
                                            </ol>
                                        </div>

                                        <Alert className="bg-teal-50 border-teal-200">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            <AlertTitle className="text-primary">Privacy Protected</AlertTitle>
                                            <AlertDescription>
                                                Your identity remains anonymous throughout this process. The verification code only confirms
                                                that your vote was recorded, not who you are.
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    )
}


export default Results
