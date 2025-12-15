import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle } from "lucide-react"

interface Driver {
    id: string
    license_number: string | null
    status: string
    rating: number
    is_online: boolean
    total_rides: number
    profiles: {
        email: string
        full_name: string | null
    } | null
}

export default function Drivers() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")

    useEffect(() => {
        fetchDrivers()
    }, [filter])

    const fetchDrivers = async () => {
        setLoading(true)
        let query = supabase
            .from("drivers")
            .select("*")
            .order("created_at", { ascending: false })

        if (filter !== "all") {
            query = query.eq("status", filter)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching drivers:", error)
            setDrivers([])
        } else {
            // Fetch profiles separately to avoid ambiguous relationship error
            const driversWithProfiles = await Promise.all(
                (data || []).map(async (driver) => {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("email, full_name")
                        .eq("id", driver.id)
                        .single()

                    return { ...driver, profiles: profile }
                })
            )
            setDrivers(driversWithProfiles)
        }
        setLoading(false)
    }

    const updateDriverStatus = async (driverId: string, status: string) => {
        const { error } = await supabase
            .from("drivers")
            .update({ status })
            .eq("id", driverId)

        if (error) {
            console.error("Error updating driver:", error)
        } else {
            fetchDrivers()
        }
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Driver Management</h1>
                <p className="text-muted-foreground">Review and approve driver applications</p>
            </div>

            <div className="mb-4 flex gap-2">
                {["all", "pending", "approved", "rejected"].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? "default" : "outline"}
                        onClick={() => setFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Drivers ({drivers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Name</th>
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">License</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Rating</th>
                                    <th className="text-left py-3 px-4">Rides</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drivers.map((driver) => (
                                    <tr key={driver.id} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4">{driver.profiles?.full_name || "-"}</td>
                                        <td className="py-3 px-4">{driver.profiles?.email || "-"}</td>
                                        <td className="py-3 px-4">{driver.license_number || "-"}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${driver.status === "approved" ? "bg-green-100 text-green-800" :
                                                    driver.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-red-100 text-red-800"
                                                }`}>
                                                {driver.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{driver.rating.toFixed(1)} ⭐</td>
                                        <td className="py-3 px-4">{driver.total_rides}</td>
                                        <td className="py-3 px-4">
                                            {driver.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => updateDriverStatus(driver.id, "approved")}
                                                    >
                                                        <CheckCircle className="mr-1" size={14} />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => updateDriverStatus(driver.id, "rejected")}
                                                    >
                                                        <XCircle className="mr-1" size={14} />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
