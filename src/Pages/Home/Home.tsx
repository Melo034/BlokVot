import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCheck, Fingerprint, ShieldCheck, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/utils/Navbar";
import { Footer } from "@/components/utils/Footer";
import { Hero } from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import { useReadContract, useActiveAccount } from "thirdweb/react";
import { contract } from "@/client";
import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

const insightConfig = [
    { key: 0, label: "Total polls", suffix: "", highlight: "from municipal to national" },
    { key: 4, label: "Active polls", suffix: "", highlight: "currently receiving ballots" },
    { key: 2, label: "Registered voters", suffix: "+", highlight: "citizens onboarded securely" },
    { key: 1, label: "Accredited candidates", suffix: "", highlight: "vetted across ballots" },
];

const journeySteps = [
    {
        icon: UserCheck,
        title: "Verify",
        body: "Citizens onboard with wallet-backed identity, optional KBA, and real-time eligibility sync.",
    },
    {
        icon: Fingerprint,
        title: "Vote",
        body: "Accessible ballots adapt to device, language, and any adjudication logic your constitution requires.",
    },
    {
        icon: ShieldCheck,
        title: "Anchor",
        body: "Encrypted payloads are sequenced on-chain with guardian oversight and delayed execution failsafes.",
    },
    {
        icon: BarChart3,
        title: "Audit",
        body: "Public dashboards, APIs, and exportable proofs keep observers and courts in complete alignment.",
    },
];

const buildTrend = (base: number) => {
    const safeBase = Math.max(base, 10);
    return Array.from({ length: 6 }, (_, idx) => {
        const growth = Math.sin(idx / 2.2) * 0.08 * safeBase;
        const wobble = (Math.random() - 0.5) * 0.05 * safeBase;
        return { point: idx, value: Math.max(safeBase * 0.5, safeBase + growth + wobble) };
    });
};

const Home = () => {
    const account = useActiveAccount();
    const addr = account?.address; // Safely access address, will be undefined if no account
    const { data: stats, isPending: isStatsPending } = useReadContract({
        contract,
        method: "function getSystemStats() view returns (uint256 totalPolls, uint256 totalCandidates, uint256 totalVoters, uint256 totalVotes, uint256 activePolls)",
        params: [],
    }) as { data: [bigint, bigint, bigint, bigint, bigint] | undefined; isPending: boolean };

    const insightData = useMemo(() => {
        if (!stats) {
            return insightConfig.map((entry) => ({ ...entry, value: 0, trend: buildTrend(0) }));
        }
        return insightConfig.map((entry) => {
            const raw = Number(stats[entry.key] ?? 0n);
            return {
                ...entry,
                value: raw,
                trend: buildTrend(raw || 24),
            };
        });
    }, [stats]);

    const { data: isSuperAdmin, isPending: isSuperAdminPending } = useReadContract({
        contract,
        method: "function isSuperAdmin(address addr) view returns (bool)",
        params: [addr!], // Non-null assertion since query is disabled when addr is undefined
        queryOptions: {
            enabled: !!addr,
        },
    });

    const { data: isAdmin, isPending: isAdminPending } = useReadContract({
        contract,
        method: "function isAdmin(address addr) view returns (bool)",
        params: [addr!], // Non-null assertion since query is disabled when addr is undefined
        queryOptions: {
            enabled: !!addr,
        },
    });

    // Show dashboard button only if user is admin or superadmin and address is defined
    const showDashboardButton =
        addr && !isSuperAdminPending && !isAdminPending && (isSuperAdmin || isAdmin);

    return (
        <div className="min-h-screen bg-neutral-950 text-white">
            <Navbar />
            <main className="space-y-0">
                <Hero />
                <Features />

                <section className="relative overflow-hidden pb-16 pt-10 sm:pb-24">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_60%)]" />
                    <div className="container relative mx-auto max-w-6xl px-6">
                        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 sm:p-12 shadow-[0_40px_90px_-50px_rgba(37,99,235,0.5)] backdrop-blur">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <Badge className="bg-primary/15 text-primary">System intelligence</Badge>
                                    <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Operational at national scale</h2>
                                </div>
                                <p className="max-w-xl text-sm text-neutral-400">
                                    Real-time instrument panels keep administrators, observers, and citizens aligned on what is happening
                                    across every ballot.
                                </p>
                            </div>
                            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {insightData.map(({ label, suffix, highlight, value, trend }) => (
                                    <div
                                        key={label}
                                        className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6 transition hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">{label}</p>
                                        <div className="mt-4 flex items-end justify-between gap-3">
                                            {isStatsPending ? (
                                                <Skeleton className="h-8 w-24 rounded-md bg-neutral-800" />
                                            ) : (
                                                <p className="text-3xl font-semibold text-white">
                                                    {value.toLocaleString()}
                                                    {suffix}
                                                </p>
                                            )}
                                            {!isStatsPending && (
                                                <div className="h-12 w-20">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={trend}>
                                                            <Area
                                                                type="monotone"
                                                                dataKey="value"
                                                                stroke="hsl(215, 82%, 65%)"
                                                                strokeWidth={2}
                                                                fill="url(#insightSparkline)"
                                                                fillOpacity={0.35}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-neutral-400">{highlight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <svg width="0" height="0">
                            <defs>
                                <linearGradient id="insightSparkline" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(215, 82%, 65%)" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="hsl(215, 82%, 65%)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </section>

                <section className="container mx-auto max-w-6xl px-6 pb-20">
                    <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                        <div className="space-y-4">
                            <p className="w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-primary">
                                Voter journey
                            </p>
                            <h2 className="text-3xl font-semibold sm:text-4xl">
                                Seamless voting experiences backed by uncompromising governance controls
                            </h2>
                            <p className="text-neutral-400">
                                From onboarding to final certification, BlokVot guides every participant through a human-centered flow while
                                preserving legal and cryptographic rigor behind the scenes.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Button asChild className="rounded-full px-6">
                                    <Link to="/how-it-works">Walk the full workflow</Link>
                                </Button>
                                {showDashboardButton && (
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="rounded-full px-6 text-white bg-neutral-900/30 hover:bg-neutral-900/50 hover:text-white transition hover:-translate-y-0.5"
                                    >
                                        <Link to="/admin-dashboard">Explore admin console</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/10 bg-white/[0.02]" />
                            <div className="relative grid gap-6 p-6">
                                {journeySteps.map(({ icon: Icon, title, body }, index) => (
                                    <div
                                        key={title}
                                        className="group flex gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-primary/40 hover:bg-primary/5"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-primary/80">{String(index + 1).padStart(2, "0")}</span>
                                                <p className="text-lg font-semibold text-white">{title}</p>
                                            </div>
                                            <p className="mt-2 text-sm text-neutral-400">{body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative overflow-hidden pb-24">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)]" />
                    <div className="container relative mx-auto max-w-6xl px-6">
                        <div className="overflow-hidden rounded-[34px] border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-sky-500/10 p-[1px]">
                            <div className="rounded-[32px] bg-neutral-950/95 px-8 py-12 shadow-[0_80px_120px_-60px_rgba(30,64,175,0.4)] backdrop-blur">
                                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="max-w-xl">
                                        <p className="uppercase tracking-[0.35em] text-sm text-primary/70">Deploy in weeks</p>
                                        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
                                            Ready to modernize your election infrastructure?
                                        </h2>
                                        <p className="mt-4 text-neutral-300">
                                            Partner with our government success team to orchestrate pilots, migrate legacy voter rolls, and launch
                                            credible nationwide elections on BlokVot.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        {showDashboardButton && (
                                            <Button asChild size="lg" className="rounded-full px-6">
                                                <Link to="/admin-dashboard">Launch admin workspace</Link>
                                            </Button>
                                        )}
                                        <Button asChild size="lg" variant="outline" className="rounded-full border-white/30 px-6 text-white bg-neutral-900/30 hover:bg-neutral-900/50 hover:text-white">
                                            <Link to="/polls">Review live results</Link>
                                        </Button>
                                    </div>
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

export default Home;
