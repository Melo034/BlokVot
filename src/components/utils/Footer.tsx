import { Button } from "@/components/ui/button";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/client";
import { darkTheme } from "thirdweb/react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const socialLinks = [
    { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
    { href: "https://github.com", icon: Github, label: "GitHub" },
    { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
];

const Footer = () => {
    return (
        <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-neutral-950/80 py-16 supports-[backdrop-filter]:backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(37,99,235,0.2),_transparent_60%)]" />
            <div className="container relative mx-auto flex max-w-6xl flex-col gap-12 px-6">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-xl space-y-4">
                        <p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-primary">
                            BlokVot
                        </p>
                        <h2 className="text-3xl font-semibold text-white">
                            Building verifiable elections for every nation
                        </h2>
                        <p className="text-sm text-neutral-400">
                            Our team partners with governments and observer coalitions to deliver transparent, resilient and inclusive
                            civic participation.
                        </p>
                        <div className="flex items-center gap-3 text-neutral-400">
                            {socialLinks.map(({ href, icon: Icon, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-neutral-200 transition hover:border-primary/40 hover:text-primary"
                                >
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <Button asChild size="lg" className="rounded-full px-6">
                            <Link to="/how-it-works">See how BlokVot works</Link>
                        </Button>
                        <ConnectButton
                            client={client}
                            theme={darkTheme({
                                colors: {
                                    accentText: "hsl(216, 100%, 60%)",
                                    borderColor: "hsl(229, 13%, 17%)",
                                    primaryText: "hsl(240, 6%, 94%)",
                                    secondaryIconColor: "hsl(251, 4%, 50%)",
                                },
                            })}
                            appMetadata={{
                                name: "BlokVot",
                                url: "https://blokvot.example",
                            }}
                        />
                    </div>
                </div>

                <div className="grid gap-8 border-t border-white/10 pt-8 text-sm text-neutral-300 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Platform</p>
                        <ul className="space-y-2">
                            <li><Link to="/polls" className="transition hover:text-primary">Live polls</Link></li>
                            <li><Link to="/results" className="transition hover:text-primary">Results dashboard</Link></li>
                            <li><Link to="/how-it-works" className="transition hover:text-primary">Technology overview</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Governance</p>
                        <ul className="space-y-2">
                            <li><a href="#" className="transition hover:text-primary">Compliance &amp; policy</a></li>
                            <li><a href="#" className="transition hover:text-primary">Security disclosures</a></li>
                            <li><a href="#" className="transition hover:text-primary">Observer toolkit</a></li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">Need help?</p>
                        <ul className="space-y-2">
                            <li><a href="#" className="transition hover:text-primary">Contact support</a></li>
                            <li><a href="#" className="transition hover:text-primary">Deployment guides</a></li>
                            <li><a href="#" className="transition hover:text-primary">Status page</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} BlokVot. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="transition hover:text-primary">Privacy policy</a>
                        <a href="#" className="transition hover:text-primary">Terms of service</a>
                        <a href="#" className="transition hover:text-primary">Accessibility</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export { Footer };
