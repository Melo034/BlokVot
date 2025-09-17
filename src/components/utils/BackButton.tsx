
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const BackButton = () => {
    return (
        <div className=" hidden sm:block">
            <Link to="/" aria-label="Back to Home">
                <Button  size="lg" 
                    className="items-center text-sm transition-colors sm:inline-flex py-6 px-2 font-semibold">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back Home
                </Button>
            </Link>
        </div>
    )
}

export default BackButton