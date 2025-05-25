import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/utils/Navbar"
import { Footer } from "@/components/utils/Footer"
import { Hero } from "@/components/Home/Hero"
import Features from "@/components/Home/Features"

const Home = () => {
    return (
        <div>
            <Navbar />
            <main>
                {/* Hero Section */}
                <Hero />
                {/* Key Features Section */}
                <Features />
                {/* CTA Section */}
                <section className="w-full py-12 md:py-24 ">
                    <div className="container mx-auto  px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tighter text-lora sm:text-4xl md:text-5xl text-primary">
                                        Ready to Experience the Future of Voting?
                                    </h2>
                                    <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                        Join millions of Sierra Leoneans who are already using our secure blockchain voting platform.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Link to="/auth/login">
                                        <Button size="lg">
                                            Cast your Vote
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-[500px] aspect-video">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg opacity-20 blur-xl"></div>
                                    <div className="relative bg-white border rounded-lg shadow-lg p-6 h-full flex flex-col justify-center">
                                        <Tabs defaultValue="voters" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="voters">For Voters</TabsTrigger>
                                                <TabsTrigger value="officials">For Officials</TabsTrigger>
                                                <TabsTrigger value="observers">For Observers</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="voters" className="p-4">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Secure and private voting from anywhere</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Verify your vote was counted correctly</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Access real-time election results</span>
                                                    </li>
                                                </ul>
                                            </TabsContent>
                                            <TabsContent value="officials" className="p-4">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Manage elections with ease</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Reduce administrative costs</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Generate comprehensive reports</span>
                                                    </li>
                                                </ul>
                                            </TabsContent>
                                            <TabsContent value="observers" className="p-4">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Monitor elections transparently</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Access blockchain verification tools</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2" />
                                                        <span>Generate independent audit reports</span>
                                                    </li>
                                                </ul>
                                            </TabsContent>
                                        </Tabs>
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