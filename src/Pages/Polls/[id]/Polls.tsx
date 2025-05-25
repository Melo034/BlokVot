import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Clock, CheckCircle, AlertCircle, Info, ChevronRight, ChevronLeft } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"




const Polls = () => {
    const { id } = useParams<{ id: string }>();
    const [step, setStep] = useState(1) // 1: View Candidates, 2: Confirm Vote, 3: Receipt
    const navigate = useNavigate()
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [verificationCode, setVerificationCode] = useState("")
    const [showCandidateInfo, setShowCandidateInfo] = useState<string | null>(null)

    // Mock poll data
    const poll = {
        id: id,
        title: id === "presidential-2025" ? "Presidential Election 2025" : "Parliamentary Election 2025",
        description:
            id === "presidential-2025"
                ? "General election for the President of Sierra Leone"
                : "Election for Members of Parliament",
        startDate: "2025-05-15T00:00:00Z",
        endDate: "2025-05-15T23:59:59Z",
        candidates:
            id === "presidential-2025"
                ? [
                    {
                        id: "candidate1",
                        name: "Julius Maada Bio",
                        party: "Sierra Leone People's Party",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Current president seeking re-election. Focused on education and economic development.",
                    },
                    {
                        id: "candidate2",
                        name: "Samura Kamara",
                        party: "All People's Congress",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Former foreign minister and opposition leader. Campaigning on healthcare and infrastructure.",
                    },
                    {
                        id: "candidate3",
                        name: "Kandeh Yumkella",
                        party: "National Grand Coalition",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Former UN official with focus on sustainable development and energy solutions.",
                    },
                    {
                        id: "candidate4",
                        name: "Samuel Williams",
                        party: "National Unity Party",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Businessman and political newcomer advocating for economic reforms.",
                    },
                ]
                : [
                    {
                        id: "mp1",
                        name: "Michael Brown",
                        party: "Sierra Leone People's Party",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Incumbent MP for Western Area Urban. Focused on urban development.",
                    },
                    {
                        id: "mp2",
                        name: "Elizabeth Taylor",
                        party: "All People's Congress",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Community organizer and activist. Advocating for women's rights and education.",
                    },
                    {
                        id: "mp3",
                        name: "David Wilson",
                        party: "National Grand Coalition",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Former teacher with focus on educational reform and youth empowerment.",
                    },
                    {
                        id: "mp4",
                        name: "Patricia Garcia",
                        party: "National Unity Party",
                        image: "/placeholder.svg?height=100&width=100",
                        bio: "Healthcare professional campaigning for improved medical facilities.",
                    },
                ],
    }

    const handleSelectCandidate = (candidateId: string) => {
        setSelectedCandidate(candidateId)
    }

    const handleReview = () => {
        if (selectedCandidate) {
            setStep(2)
        }
    }

    const handleBack = () => {
        if (step === 2) {
            setStep(1)
        } else if (step === 1) {
            navigate("/polls")
        }
    }

    const handleSubmit = () => {
        setIsSubmitting(true)
        // Simulate blockchain transaction
        setTimeout(() => {
            setIsSubmitting(false)
            setVerificationCode("SL" + Math.floor(100000 + Math.random() * 900000))
            setStep(3)
        }, 2000)
    }

    const handleFinish = () => {
        navigate("/polls")
    }

    const handleViewResults = () => {
        navigate("/results")
    }

    const getSelectedCandidate = () => {
        return poll.candidates.find((c) => c.id === selectedCandidate)
    }

    const getCandidateInfo = (candidateId: string) => {
        return poll.candidates.find((c) => c.id === candidateId)
    }
    return (
        <div>
            <Navbar />
            <main className="container mx-auto max-w-7xl py-16 sm:py-20 px-4">
                <div className="flex justify-end py-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Poll closes in: 8h 23m</span>
                    </div>
                </div>
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold text-primary">{poll.title}</h1>
                        <Badge className="bg-green-500">Active</Badge>
                    </div>
                    <p className="text-muted-foreground">{poll.description}</p>
                </div>

                <div className="mb-6">
                    <div className="w-full bg-white rounded-full h-2 mb-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${step * 33.33}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <div className={step >= 1 ? "text-primary font-medium" : ""}>View Candidates</div>
                        <div className={step >= 2 ? "text-primary font-medium" : ""}>Confirm Vote</div>
                        <div className={step >= 3 ? "text-primary font-medium" : ""}>Receipt</div>
                    </div>
                </div>

                {step === 1 && (
                    <>
                        <Alert className="mb-6">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Important</AlertTitle>
                            <AlertDescription>
                                You can cast only one vote in this election. Your vote will be securely recorded on the blockchain.
                            </AlertDescription>
                        </Alert>

                        <Card>
                            <CardHeader>
                                <CardTitle>Select a Candidate</CardTitle>
                                <CardDescription>Choose one candidate from the list below</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup value={selectedCandidate || ""} onValueChange={handleSelectCandidate} className="space-y-4">
                                    {poll.candidates.map((candidate) => (
                                        <div
                                            key={candidate.id}
                                            className="flex items-center space-x-2 rounded-md border p-4 transition-colors hover:bg-accent"
                                        >
                                            <RadioGroupItem value={candidate.id} id={candidate.id} className="text-primary" />
                                            <div className="flex flex-1 items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={candidate.image || "/placeholder.svg"} alt={candidate.name} />
                                                        <AvatarFallback>
                                                            {candidate.name
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <Label htmlFor={candidate.id} className="flex flex-col cursor-pointer">
                                                        <span className="font-medium">{candidate.name}</span>
                                                        <span className="text-sm text-muted-foreground">{candidate.party}</span>
                                                    </Label>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setShowCandidateInfo(candidate.id)
                                                    }}
                                                >
                                                    View Profile
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={() => navigate("/polls")}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Back to Polls
                                </Button>
                                <Button onClick={handleReview} disabled={!selectedCandidate} className="bg-primary/90 hover:bg-primary">
                                    Review Selection
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </>
                )}

                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirm Your Vote</CardTitle>
                            <CardDescription>Please review your selection carefully before submitting</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border p-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={getSelectedCandidate()?.image || "/placeholder.svg"}
                                            alt={getSelectedCandidate()?.name}
                                        />
                                        <AvatarFallback className="text-lg">
                                            {getSelectedCandidate()
                                                ?.name.split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg">{getSelectedCandidate()?.name}</h3>
                                        <p className="text-muted-foreground">{getSelectedCandidate()?.party}</p>
                                    </div>
                                </div>
                            </div>

                            <Alert className="bg-amber-50 border-amber-200">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-600">Important Notice</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Your vote is final and cannot be changed once submitted</li>
                                        <li>Your vote will be anonymously recorded on the blockchain</li>
                                        <li>You will receive a verification code to check your vote later</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={handleBack}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Change Selection
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary/90 hover:bg-primary">
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <span>Recording Vote</span>
                                        <Progress value={65} className="w-16 h-2" />
                                    </div>
                                ) : (
                                    <>
                                        Submit Vote to Blockchain
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="max-w-md mx-auto">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <CardTitle className="text-xl text-primary">Vote Successfully Recorded</CardTitle>
                            <CardDescription>Your vote has been securely recorded on the blockchain</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md border bg-muted p-4">
                                <div className="text-center font-mono text-lg">{verificationCode}</div>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                This is your unique verification code. You can use it to verify your vote on the blockchain.
                            </p>

                            <div className="rounded-md bg-gray-50 p-4 space-y-2">
                                <div className="text-sm">
                                    <span className="font-medium">Transaction ID:</span>
                                    <div className="font-mono text-xs break-all mt-1">
                                        0x{Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Block Number:</span>
                                    <span className="font-mono ml-2">15482934</span>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium">Timestamp:</span>
                                    <span className="ml-2">{new Date().toLocaleString()}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                            <div className="grid grid-cols-2 gap-2 w-full">
                                <Button variant="outline" onClick={handleFinish}>
                                    Return to Polls
                                </Button>
                                <Button className="bg-primary/90 hover:bg-primary" onClick={handleViewResults}>
                                    View Results
                                </Button>
                            </div>
                            <Button variant="link" className="text-primary">
                                Download Receipt
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </main>

            <Dialog open={!!showCandidateInfo} onOpenChange={() => setShowCandidateInfo(null)}>
                {showCandidateInfo && (
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Candidate Profile</DialogTitle>
                            <DialogDescription>Information about this candidate</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4 py-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage
                                    src={getCandidateInfo(showCandidateInfo)?.image || "/placeholder.svg"}
                                    alt={getCandidateInfo(showCandidateInfo)?.name}
                                />
                                <AvatarFallback className="text-2xl">
                                    {getCandidateInfo(showCandidateInfo)
                                        ?.name.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">{getCandidateInfo(showCandidateInfo)?.name}</h3>
                                <p className="text-muted-foreground">{getCandidateInfo(showCandidateInfo)?.party}</p>
                            </div>
                            <Separator />
                            <div className="w-full">
                                <h4 className="font-medium mb-2">Biography</h4>
                                <p className="text-sm text-muted-foreground">{getCandidateInfo(showCandidateInfo)?.bio}</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowCandidateInfo(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
            <Footer/>
        </div>
    )
}
export default Polls

