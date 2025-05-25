import { useState } from "react"
import {  useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Vote, ChevronRight, Calendar, Users, CheckCircle2, AlertCircle} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"

interface Poll {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    status: "active" | "upcoming" | "ended"
    candidateCount: number
    isEligible: boolean
    hasVoted: boolean
}

const Polls = () => {
    const [activeTab, setActiveTab] = useState("active")
    const navigate = useNavigate()

    // Mock polls data
    const polls: Poll[] = [
        {
            id: "presidential-2025",
            title: "Presidential Election 2025",
            description: "General election for the President of Sierra Leone",
            startDate: "2025-05-15T00:00:00Z",
            endDate: "2025-05-15T23:59:59Z",
            status: "active",
            candidateCount: 4,
            isEligible: true,
            hasVoted: false,
        },
        {
            id: "parliamentary-2025",
            title: "Parliamentary Election 2025",
            description: "Election for Members of Parliament",
            startDate: "2025-05-15T00:00:00Z",
            endDate: "2025-05-15T23:59:59Z",
            status: "active",
            candidateCount: 12,
            isEligible: true,
            hasVoted: true,
        },
        {
            id: "local-council-2025",
            title: "Local Council Election 2025",
            description: "Election for Local Council Representatives",
            startDate: "2025-05-20T00:00:00Z",
            endDate: "2025-05-20T23:59:59Z",
            status: "upcoming",
            candidateCount: 8,
            isEligible: true,
            hasVoted: false,
        },
        {
            id: "referendum-2025",
            title: "Constitutional Referendum 2025",
            description: "Vote on proposed constitutional amendments",
            startDate: "2025-06-01T00:00:00Z",
            endDate: "2025-06-01T23:59:59Z",
            status: "upcoming",
            candidateCount: 2,
            isEligible: false,
            hasVoted: false,
        },
    ]

    const filteredPolls = polls.filter((poll) => {
        if (activeTab === "active") return poll.status === "active"
        if (activeTab === "upcoming") return poll.status === "upcoming"
        if (activeTab === "completed") return poll.status === "ended" || (poll.status === "active" && poll.hasVoted)
        return true
    })

    const handleViewPoll = (pollId: string) => {
        navigate(`/polls/${pollId}`)
    }

    const getStatusBadge = (poll: Poll) => {
        if (poll.status === "active") {
            return <Badge className="bg-green-500">Active</Badge>
        } else if (poll.status === "upcoming") {
            return <Badge className="bg-blue-500">Upcoming</Badge>
        } else {
            return <Badge variant="outline">Ended</Badge>
        }
    }

    const getEligibilityStatus = (poll: Poll) => {
        if (!poll.isEligible) {
            return (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Not Eligible</AlertTitle>
                    <AlertDescription>
                        You are not eligible to vote in this poll. This may be due to your voter registration status or district.
                    </AlertDescription>
                </Alert>
            )
        }

        if (poll.hasVoted) {
            return (
                <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-600">Vote Cast</AlertTitle>
                    <AlertDescription>
                        You have already cast your vote in this poll. You can view your receipt or check the results.
                    </AlertDescription>
                </Alert>
            )
        }

        return null
    }
    return (
        <div>
           <Navbar/>
            <main className="container max-w-7xl mx-auto py-16 sm:py-20 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary">Available Polls</h1>
                    <p className="text-muted-foreground mt-2">Select a poll to view candidates and cast your vote</p>
                </div>

                <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>

                {filteredPolls.length === 0 ? (
                    <Card className="text-center p-8">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <Vote className="h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">No polls available in this category</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredPolls.map((poll) => (
                            <Card key={poll.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl text-primary">{poll.title}</CardTitle>
                                        {getStatusBadge(poll)}
                                    </div>
                                    <CardDescription>{poll.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pb-3">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {new Date(poll.startDate).toLocaleDateString()} - {new Date(poll.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{poll.candidateCount} candidates</span>
                                        </div>

                                        {poll.status === "active" && (
                                            <div className="pt-2">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span>Poll closing in:</span>
                                                    <span className="font-medium">8 hours 23 minutes</span>
                                                </div>
                                                <Progress value={65} className="h-2" />
                                            </div>
                                        )}

                                        {getEligibilityStatus(poll)}
                                    </div>
                                </CardContent>
                                <Separator />
                                <CardFooter className="pt-3">
                                    <Button
                                        onClick={() => handleViewPoll(poll.id)}
                                        className="w-full bg-primary/90 hover:bg-primary"
                                        disabled={!poll.isEligible || poll.status !== "active" || poll.hasVoted}
                                    >
                                        {poll.hasVoted ? "View Receipt" : poll.status === "active" ? "View Candidates" : "View Details"}
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
            <Footer/>
        </div>
    )
}

export default Polls

