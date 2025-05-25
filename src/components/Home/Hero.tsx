import { ArrowDownRight, Shield,Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge"
import heroImage from "@/assets/hero.jpg";

interface HeroProps {
    heading?: string;
    description?: string;
    buttons?: {
        primary?: {
            text: string;
            url: string;
        };
        secondary?: {
            text: string;
            url: string;
        };
    };
}

const Hero = ({
    heading = "  The Future of Voting is Blockchain",
    description = " A revolutionary voting system that ensures transparency, security, and accessibility in elections using blockchain technology.",
    buttons = {
        primary: {
            text: "Cast Your Vote",
            url: "/auth/login",
        },
        secondary: {
            text: "Learn how it works",
            url: "/how-it-works",
        },
    },
}: HeroProps) => {
    return (
        <section>
            <div className="container max-w-screen-xl py-5 sm:py-10 px-4 mx-auto my-5 grid items-center gap-6 lg:grid-cols-2 lg:gap-20">
                <div className="mx-auto flex flex-col items-center text-center md:ml-auto lg:max-w-3xl lg:items-start lg:text-left">
                    <Badge className="bg-primary">
                        <Shield className="mr-1 h-7 w-7" />
                        Secure • Transparent • Trusted
                    </Badge>
                    <h1 className="my-6 text-pretty text-3xl font-montserrat font-bold lg:text-5xl xl:text-6xl">
                        {heading}
                    </h1>
                    <p className="text-muted-foreground mb-8 max-w-xl sm:text-xl text-lg font-poppins">
                        {description}
                    </p>
                    <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
                       
                        {buttons.primary && (
                            <Button asChild  className="w-full font-pt-serif sm:w-auto">
                                <Link to={buttons.primary.url}>
                                    <Vote className="mr-2 h-5 w-5" />
                                    {buttons.primary.text}
                                </Link>
                            </Button>
                        )}
                         {buttons.secondary && (
                            <Button asChild variant="outline" className="w-full font-pt-serif sm:w-auto">
                                <Link to={buttons.secondary.url}>{buttons.secondary.text}
                                    <ArrowDownRight className="ml-2 size-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="flex">
                    <img
                        src={heroImage}
                        alt="placeholder hero"
                        className="max-h-[600px] w-full rounded-md object-cover lg:max-h-[800px]"
                    />
                </div>
            </div>
        </section>
    );
};

export { Hero };
