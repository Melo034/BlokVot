import { Footer } from "@/components/utils/Footer";
import { Navbar } from "@/components/utils/Navbar";
import { WalletMinimal, Vote, Lock, ShieldCheck, Sigma, ServerCog, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const stages = [
    {
        title: "Authenticate",
        description:
            "Voters link a verified wallet or government-issued identity. Eligibility lists sync automatically with the registrar.",
        icon: WalletMinimal,
    },
    {
        title: "Select",
        description:
            "Accessible ballots guide voters through candidate choices, referenda, or weighted council votes with built-in validation.",
        icon: Vote,
    },
    {
        title: "Anchor",
        description:
            "Encrypted payloads are written to the BlokVot chain with guardian co-signatures and delayed execution failsafes.",
        icon: Lock,
    },
    {
        title: "Verify",
        description:
            "Citizens, auditors, and courts review cryptographic receipts, tamper logs, and real-time dashboards in a single pane.",
        icon: ShieldCheck,
    },
];

const safeguards = [
    {
        icon: Sigma,
        title: "Risk analytics",
        body: "Machine learning models signal anomalies in turnout or device fingerprints seconds after they emerge.",
    },
    {
        icon: ServerCog,
        title: "Redundant infrastructure",
        body: "Multi-region nodes and guardian rotation safeguard continuity even during regional outages.",
    },
    {
        icon: FileSearch,
        title: "Auditable every step",
        body: "Immutable logs, exportable proofs, and open APIs let observers perform independent verification instantly.",
    },
];

const lineVariants = {
    hidden: { opacity: 0, y: 24 },
    show: (index: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, delay: index * 0.1 },
    }),
};

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />
            <main className="space-y-0">
                <section className="relative overflow-hidden bg-neutral-950">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_55%)]" />
                    <div className="container relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">
                        <p className="mx-auto w-fit rounded-full border border-primary/20 bg-primary/10 px-5 py-1 text-xs uppercase tracking-[0.35em] text-primary">
                            How BlokVot works
                        </p>
                        <h1 className="mt-6 text-pretty text-4xl font-semibold leading-tight sm:text-5xl">
                            End-to-end transparency for every stakeholder in the election ecosystem
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-neutral-400">
                            We designed BlokVot so administrators, observers, and citizens share the same trustworthy source of truth at
                            every stage�from onboarding to final certification.
                        </p>
                    </div>
                </section>

                <section className="container mx-auto max-w-5xl px-6 pb-24">
                    <div className="relative">
                        <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/60 via-white/10 to-transparent md:block" />
                        <div className="grid gap-14">
                            {stages.map(({ title, description, icon: Icon }, index) => (
                                <motion.div
                                    key={title}
                                    custom={index}
                                    variants={lineVariants}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{ once: true, margin: "-120px" }}
                                    className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center"
                                >
                                    <div className="relative flex justify-center md:justify-center">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                                        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/30 bg-primary/10 text-primary shadow-lg shadow-primary/30">
                                            <Icon className="h-7 w-7" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 text-left md:pl-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-primary/70">{String(index + 1).padStart(2, "0")}</span>
                                            <h3 className="text-2xl font-semibold text-white">{title}</h3>
                                        </div>
                                        <p className="text-neutral-400 md:max-w-xl">{description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden pb-24">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(244,114,182,0.12),_transparent_60%)]" />
                    <div className="container relative mx-auto max-w-5xl px-6">
                        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur">
                            <div className="text-center">
                                <p className="text-sm uppercase tracking-[0.35em] text-primary/70">Safety net</p>
                                <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Controls built for auditors, courts, and citizens</h2>
                                <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
                                    A modern democracy demands resilient guardrails. BlokVot layers defence-in-depth mechanisms so that no
                                    single actor can compromise legitimacy.
                                </p>
                            </div>
                            <div className="mt-12 grid gap-6 md:grid-cols-3">
                                {safeguards.map(({ icon: Icon, title, body }, index) => (
                                    <motion.div
                                        key={title}
                                        custom={index}
                                        variants={lineVariants}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: "-120px" }}
                                        className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6 text-left shadow-[0_30px_70px_-45px_rgba(30,64,175,0.5)] transition hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                                        <p className="mt-3 text-sm text-neutral-400">{body}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden pb-32">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_65%)]" />
                    <div className="container relative mx-auto max-w-5xl px-6">
                        <div className="overflow-hidden rounded-[32px] border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-sky-500/10 p-[1px]">
                            <div className="rounded-[30px] bg-neutral-950/95 px-8 py-12 text-center shadow-[0_80px_120px_-60px_rgba(30,64,175,0.4)]">
                                <h2 className="text-3xl font-semibold sm:text-4xl">Spin up your next election on BlokVot</h2>
                                <p className="mx-auto mt-4 max-w-2xl text-neutral-300">
                                    Our deployment specialists will guide your team through pilots, data migration, compliance reviews, and
                                    live launch within weeks�not months.
                                </p>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                    <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 px-6 text-white bg-neutral-900/30 hover:bg-neutral-900/50 hover:text-white">
                                        <Link to="/polls">Review live election data</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default HowItWorks;
