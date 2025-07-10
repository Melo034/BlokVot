
import { Footer } from "@/components/utils/Footer"
import { Navbar } from "@/components/utils/Navbar"
import { User, Vote, Shield, CheckCircle } from "lucide-react"

const HowItWorks = () => {
    return (
        <div className="flex flex-col min-h-screen bg-neutral-900">
            <Navbar />
            <div className="container py-16 sm:py-20 px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                            How BlokVot Works
                        </h2>
                        <p className="max-w-[900px] text-neutral-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Our blockchain voting system follows a simple but secure process to ensure election integrity.
                        </p>
                    </div>
                </div>
                <div className="mx-auto max-w-5xl py-12">
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 transform -translate-x-1/2"></div>

                        {/* Step 1 */}
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            <div className="md:text-right flex flex-col justify-center order-2 md:order-1">
                                <h3 className="text-2xl font-bold text-primary mb-2">Voter Authentication</h3>
                                <p className="text-neutral-400">
                                    Voters verify their identity using secure multi-factor authentication methods, including biometric
                                    verification where available.
                                </p>
                            </div>
                            <div className="flex justify-center md:justify-start order-1 md:order-2">
                                <div className="relative">
                                    <div className="absolute left-1/2 top-1/2 w-16 h-16 bg-blue-100 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            <div className="flex justify-center md:justify-end">
                                <div className="relative">
                                    <div className="absolute left-1/2 top-1/2 w-16 h-16 bg-blue-100 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                                        <Vote className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-primary mb-2">Cast Ballot</h3>
                                <p className="text-neutral-400">
                                    Voters make their candidate selection through a simple and intuitive interface, with one vote allowed per
                                    poll.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                            <div className="md:text-right flex flex-col justify-center order-2 md:order-1">
                                <h3 className="text-2xl font-bold text-primary mb-2">Blockchain Recording</h3>
                                <p className="text-neutral-400">
                                    Votes are encrypted and recorded on the blockchain, creating an immutable record that cannot be altered or
                                    deleted.
                                </p>
                            </div>
                            <div className="flex justify-center md:justify-start order-1 md:order-2">
                                <div className="relative">
                                    <div className="absolute left-1/2 top-1/2 w-16 h-16 bg-blue-100 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                                        <Shield className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex justify-center md:justify-end">
                                <div className="relative">
                                    <div className="absolute left-1/2 top-1/2 w-16 h-16 bg-blue-100 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                                        <CheckCircle className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-2xl font-bold text-primary mb-2">Vote Verification</h3>
                                <p className="text-neutral-400">
                                    Voters can verify their vote has been properly recorded while maintaining anonymity, using a unique
                                    verification code.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default HowItWorks


