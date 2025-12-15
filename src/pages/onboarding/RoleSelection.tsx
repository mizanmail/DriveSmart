import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Car, Briefcase } from "lucide-react"

export default function RoleSelection() {
    const navigate = useNavigate()

    const selectRole = (role: string) => {
        // TODO: Update user profile with role
        console.log("Selected role:", role)
        navigate("/dashboard")
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-4xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Choose Your Path</CardTitle>
                    <CardDescription>How do you want to use DriveSmart?</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-2 hover:border-primary" onClick={() => selectRole('customer')}>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                <User size={32} />
                            </div>
                            <h3 className="font-semibold text-lg">Customer</h3>
                            <p className="text-sm text-muted-foreground">I want to request rides.</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-2 hover:border-primary" onClick={() => selectRole('driver')}>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                            <div className="p-4 bg-green-100 rounded-full text-green-600">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="font-semibold text-lg">Driver (Job Seeker)</h3>
                            <p className="text-sm text-muted-foreground">I want to drive but need a vehicle.</p>
                        </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:bg-slate-50 transition-colors border-2 hover:border-primary" onClick={() => selectRole('vehicle_owner')}>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                            <div className="p-4 bg-purple-100 rounded-full text-purple-600">
                                <Car size={32} />
                            </div>
                            <h3 className="font-semibold text-lg">Vehicle Owner</h3>
                            <p className="text-sm text-muted-foreground">I have a vehicle to rent or drive.</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}
