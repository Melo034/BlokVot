import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Shield, Users, CheckCircle, Clock } from 'lucide-react'
import type { ReactNode } from 'react'

const Features = () => {
    return (
        <section className=" py-8 md:py-16">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary font-lora">
                            Why Blockchain Voting?
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Our system addresses key challenges in traditional voting systems using advanced blockchain
                            technology.
                        </p>
                    </div>
                </div>
                <Card className="@min-4xl:max-w-full @min-4xl:grid-cols-4 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16">
                    <div className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Shield className="size-6" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-semibold font-pt-serif">Secure & Tamper-Proof</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm font-lexend-deca mb-2">   Votes are securely recorded on the blockchain, making them immune to manipulation or unauthorized changes.</p>
                        </CardContent>
                    </div>
                    <div className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <CheckCircle className="size-6" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-semibold font-pt-serif">Transparent Verification</h3>
                        </CardHeader>

                        <CardContent>
                            <p className=" text-sm font-lexend-deca mb-2">Each vote can be verified by voters without compromising anonymity, ensuring confidence in the election results.</p>
                        </CardContent>
                    </div>
                    <div className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Users className="size-6" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-semibold font-pt-serif">Accessible Voting</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm font-lexend-deca">Enables voting from anywhere with internet access, increasing participation especially in remote areas.</p>
                        </CardContent>
                    </div>

                    <div className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Clock className="size-6" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-semibold font-pt-serif">Real-Time Results</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm font-lexend-deca">Instant counting and tabulation of votes, eliminating delays in announcing election outcomes.</p>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </section>
    )
}

export default Features

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)]">
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div aria-hidden className="bg-radial to-background absolute inset-0 from-transparent to-75%" />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)