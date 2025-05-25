import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Logo from "@/assets/blockchain_logo.png"

const Login = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)
    const [userType, setUserType] = useState<"voter" | "admin">("voter")
    const [voterId, setVoterId] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setAuthError(null)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)

            // Simulate authentication success/failure
            if (voterId && password) {
                if (userType === "admin") {
                    navigate("/admin")
                } else {
                    navigate("/polls")
                }
            } else {
                setAuthError("Authentication failed. Please check your credentials.")
            }
        }, 1500)
    }

    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link to="/" className="absolute left-4 top-4 md:left-8 md:top-8 ">
                <Button variant="ghost" className="flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="h-5 w-5 text-primary" />
                    <span className="font-lora">Back</span>
                </Button>
            </Link>
            <div className="mx-auto max-w-7xl flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
                <div className="flex items-center justify-center">
                    <img src={Logo} alt="Logo" className="h-20 w-24 object-contain" />
                </div>
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-primary">User Authentication</h1>
                    <p className="text-sm text-muted-foreground">Login as a voter or administrator to access the platform</p>
                </div>

                <div className="flex justify-center">
                    <div className="w-full max-w-sm">
                        <Tabs defaultValue="voter" onValueChange={(value) => setUserType(value as "voter" | "admin")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="voter">Voter</TabsTrigger>
                                <TabsTrigger value="admin">Administrator</TabsTrigger>
                            </TabsList>

                            <div className="mt-4">
                                <Card>
                                    <form onSubmit={handleLogin}>
                                        <CardHeader>
                                            <CardTitle className="text-center text-primary">
                                                {userType === "voter" ? "Voter Login" : "Administrator Login"}
                                            </CardTitle>
                                            <CardDescription className="text-center text-xs text-muted-foreground my-3">
                                                {userType === "voter"
                                                    ? "Enter your voter credentials to access the voting system"
                                                    : "Enter your admin credentials to access the management panel"}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {authError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>Authentication Error</AlertTitle>
                                                    <AlertDescription>{authError}</AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="voter-id">{userType === "voter" ? "Voter ID" : "Admin ID"}</Label>
                                                <Input
                                                    id="voter-id"
                                                    placeholder={userType === "voter" ? "Enter your voter ID" : "Enter your admin ID"}
                                                    value={voterId}
                                                    onChange={(e) => setVoterId(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password">Password</Label>
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </CardContent>

                                        <CardFooter>
                                            <Button type="submit" className="w-full bg-primary" disabled={isLoading}>
                                                {isLoading ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>Authenticating</span>
                                                        <Progress value={65} className="w-16 h-2" />
                                                    </div>
                                                ) : (
                                                    "Login"
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            </div>
                        </Tabs>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <p className="px-8 text-center text-xs text-muted-foreground">
                        Your connection is secure and your data is encrypted
                    </p>
                </div>
            </div>
        </div>
    )
}


export default Login
