import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"
import { Hero } from "@/components/Home/Hero"
import Features from "@/components/Home/Features"
import { useReadContract } from "thirdweb/react";
import { contract } from "@/client";


const Home = () => {

    const ListItem = ({ text }: { text: string }) => (
        <li className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
            <span>{text}</span>
        </li>
    );


    const { data: stats, isPending: isStatsPending } = useReadContract({
        contract,
        method: "function getSystemStats() view returns (uint256 totalPolls, uint256 totalCandidates, uint256 totalVoters, uint256 totalVotes, uint256 activePolls)",
        params: [],
    }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined; isPending: boolean };

    return (
        <div className="bg-neutral-900">
            <Navbar />
            <main>
                {/* Hero Section */}
                <Hero />
                {/* Key Features Section */}
                <Features />
                {/* Stats Section */}
                
                <section className="py-20 bg-gradient-to-r from-primary/80 to-primary/60 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    {isStatsPending ? "..." : stats?.[0] ?? 0}
                                </div>
                                <div className="text-blue-100">
                                    {Number(stats?.[0] ?? 0) === 1 ? "Total Poll" : "Total Polls"}
                                </div>
                            </div>

                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    {isStatsPending ? "..." : stats?.[4] ?? 0}
                                </div>
                                <div className="text-blue-100">
                                    {Number(stats?.[4] ?? 0) === 1 ? "Active Poll" : "Active Polls"}
                                </div>
                            </div>

                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    {isStatsPending ? "..." : stats?.[2] ?? 0}
                                </div>
                                <div className="text-blue-100">
                                    {Number(stats?.[2] ?? 0) === 1 ? "Total Voter" : "Total Voters"}
                                </div>
                            </div>

                            <div>
                                <div className="text-4xl font-bold mb-2">
                                    {isStatsPending ? "..." : stats?.[1] ?? 0}
                                </div>
                                <div className="text-blue-100">
                                    {Number(stats?.[1] ?? 0) === 1 ? "Total Candidate" : "Total Candidates"}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* CTA Section */}
                <section className="w-full py-12 md:py-24 ">
                    <div className="container mx-auto  px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter text-lora sm:text-4xl md:text-5xl text-white">
                                        Ready to Experience the Future of Voting?
                                    </h2>
                                    <p className="max-w-[600px] text-neutral-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Join millions of Sierra Leoneans who are already using our secure blockchain voting platform.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Link to="/polls">
                                        <Button size="lg">
                                            Cast your Vote
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="px-4 sm:px-6 md:px-8 py-10">
                                <div className="flex justify-center">
                                    <div className="relative w-full max-w-2xl aspect-video">
                                        {/* Background Glow */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 rounded-xl opacity-20 blur-xl"></div>

                                        {/* Foreground Card */}
                                        <div className="relative bg-white border rounded-xl shadow-xl p-4 sm:p-6 h-full flex flex-col justify-center overflow-hidden">
                                            <Tabs defaultValue="voters" className="w-full">
                                                <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
                                                    <TabsTrigger value="voters">For Voters</TabsTrigger>
                                                    <TabsTrigger value="officials">For Officials</TabsTrigger>
                                                    <TabsTrigger value="observers">For Observers</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="voters" className="p-4 space-y-2 text-sm text-neutral-700">
                                                    <ListItem text="Secure and private voting from anywhere" />
                                                    <ListItem text="Verify your vote was counted correctly" />
                                                    <ListItem text="Access real-time election results" />
                                                </TabsContent>

                                                <TabsContent value="officials" className="p-4 space-y-2 text-sm text-neutral-700">
                                                    <ListItem text="Manage elections with ease" />
                                                    <ListItem text="Reduce administrative costs" />
                                                    <ListItem text="Generate comprehensive reports" />
                                                </TabsContent>

                                                <TabsContent value="observers" className="p-4 space-y-2 text-sm text-neutral-700">
                                                    <ListItem text="Monitor elections transparently" />
                                                    <ListItem text="Access blockchain verification tools" />
                                                    <ListItem text="Generate independent audit reports" />
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}


export default Home
