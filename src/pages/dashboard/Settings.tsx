import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings as SettingsIcon, DollarSign, AlertCircle } from "lucide-react"

export default function Settings() {
    const [baseFare, setBaseFare] = useState("2.50")
    const [perKmPrice, setPerKmPrice] = useState("1.20")
    const [perMinPrice, setPerMinPrice] = useState("0.30")
    const [emergencyStop, setEmergencyStop] = useState(false)

    const handleSavePricing = () => {
        // TODO: Implement pricing config save to Supabase
        alert("Pricing configuration saved!")
    }

    const toggleEmergencyStop = () => {
        setEmergencyStop(!emergencyStop)
        // TODO: Implement emergency stop toggle
        alert(`Emergency stop ${!emergencyStop ? "activated" : "deactivated"}!`)
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Configure system settings and pricing</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            <CardTitle>Pricing Configuration</CardTitle>
                        </div>
                        <CardDescription>Set base fare and pricing rates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="baseFare">Base Fare ($)</Label>
                            <Input
                                id="baseFare"
                                type="number"
                                step="0.01"
                                value={baseFare}
                                onChange={(e) => setBaseFare(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Minimum charge for any ride</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="perKmPrice">Price per Kilometer ($)</Label>
                            <Input
                                id="perKmPrice"
                                type="number"
                                step="0.01"
                                value={perKmPrice}
                                onChange={(e) => setPerKmPrice(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Rate charged per kilometer traveled</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="perMinPrice">Price per Minute ($)</Label>
                            <Input
                                id="perMinPrice"
                                type="number"
                                step="0.01"
                                value={perMinPrice}
                                onChange={(e) => setPerMinPrice(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Rate charged per minute of ride time</p>
                        </div>

                        <Button onClick={handleSavePricing} className="w-full">
                            <SettingsIcon className="mr-2" size={16} />
                            Save Pricing
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <CardTitle>System Controls</CardTitle>
                        </div>
                        <CardDescription>Emergency and system-wide toggles</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Card className={`border-2 ${emergencyStop ? "border-red-500 bg-red-50" : "border-slate-200"}`}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1">Emergency Stop</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Pause all new bookings system-wide. Active rides will continue.
                                        </p>
                                        <p className={`text-sm font-medium ${emergencyStop ? "text-red-600" : "text-green-600"}`}>
                                            Status: {emergencyStop ? "⚠️ Bookings Paused" : "✅ System Active"}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant={emergencyStop ? "default" : "destructive"}
                                    className="w-full mt-4"
                                    onClick={toggleEmergencyStop}
                                >
                                    {emergencyStop ? "Resume Bookings" : "Activate Emergency Stop"}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold mb-2">Database Info</h3>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p><span className="font-medium">Supabase URL:</span> {import.meta.env.VITE_SUPABASE_URL}</p>
                                    <p><span className="font-medium">Environment:</span> Production</p>
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
