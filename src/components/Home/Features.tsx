import { Card } from "@/components/ui/card";
import { ShieldCheck, Binary, Signal, LockKeyhole } from "lucide-react";
import { motion } from "framer-motion";

const pillars = [
    {
        icon: ShieldCheck,
        title: "Provable trust",
        description:
            "Every ballot produces a cryptographic receipt so communities never have to blindly trust results again.",
    },
    {
        icon: Binary,
        title: "Programmable policy",
        description:
            "Modular smart-contracts let administrators codify eligibility, weighting, and escalation in minutes.",
    },
    {
        icon: Signal,
        title: "Real-time observability",
        description:
            "Live telemetry streams empower media houses and civil observers with the same data regulators rely on.",
    },
    {
        icon: LockKeyhole,
        title: "Resilience by design",
        description:
            "Guardian rotation, delayed execution, and circuit breakers keep elections safe even under coordinated attack.",
    },
];

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

const Features = () => {
    return (
        <section className="relative overflow-hidden py-16 sm:py-24">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]" />
            <div className="container relative mx-auto max-w-6xl px-6">
                <div className="text-center">
                    <p className="mx-auto w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-primary">
                        Designed for scale
                    </p>
                    <h2 className="mt-6 text-pretty text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
                        A digital election stack without trade-offs
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-400 sm:text-lg">
                        BlokVot unifies bulletproof infrastructure with thoughtful voter journeys, giving administrators and citizens equal confidence from registration to final audit.
                    </p>
                </div>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-80px" }}
                    className="mt-14 grid gap-6 md:grid-cols-2"
                >
                    {pillars.map(({ icon: Icon, title, description }) => (
                        <motion.div key={title} variants={itemVariants}>
                            <Card className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.04] p-6 shadow-[0_40px_90px_-45px_rgba(15,23,42,0.7)] backdrop-blur transition hover:border-primary/40 hover:bg-primary/5">
                                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold text-white">{title}</h3>
                                <p className="mt-3 text-sm text-neutral-400">{description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
