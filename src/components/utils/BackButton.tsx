
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BackButton = () => {
    return (
        <Link
            to="/"
            aria-label="Back to Home"
            className="group hidden sm:inline-block"
        >
            <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-6 px-3 text-xs font-semibold text-neutral-200 transition hover:border-primary/40 hover:bg-primary/10 hover:text-white"
            >
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                Back Home
            </Button>
        </Link>
    );
};

export default BackButton;
