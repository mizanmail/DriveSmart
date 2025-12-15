import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { MapPin, Clock, DollarSign } from "lucide-react"

interface Booking {
    id: string
    status: string
    pickup_address: string | null
    drop_address: string | null
    fare_amount: number | null
    distance_km: number | null
    created_at: string
    customer_id: string | null
    driver_id: string | null
    customer: {
        email: string
        full_name: string | null
    } | null
    driver: {
        profiles: {
            email: string
            full_name: string | null
        }
    } | null
}

export default function Bookings() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")

    useEffect(() => {
        fetchBookings()
    }, [filter])

    const fetchBookings = async () => {
        setLoading(true)
        let query = supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false })

        if (filter !== "all") {
            query = query.eq("status", filter)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching bookings:", error)
            setBookings([])
        } else {
            // Fetch related data separately to avoid ambiguous relationships
            const bookingsWithData = await Promise.all(
                (data || []).map(async (booking) => {
                    const [customerData, driverData] = await Promise.all([
                        booking.customer_id
                            ? supabase.from("profiles").select("email, full_name").eq("id", booking.customer_id).single()
                            : Promise.resolve({ data: null }),
                        booking.driver_id
                            ? supabase.from("profiles").select("email, full_name").eq("id", booking.driver_id).single()
                            : Promise.resolve({ data: null }),
                    ])

                    return {
                        ...booking,
                        customer: customerData.data,
                        driver: driverData.data ? { profiles: driverData.data } : null,
                    }
                })
            )
            setBookings(bookingsWithData)
        }
        setLoading(false)
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            requested: "bg-blue-100 text-blue-800",
            searching: "bg-yellow-100 text-yellow-800",
            assigned: "bg-purple-100 text-purple-800",
            arrived: "bg-indigo-100 text-indigo-800",
            in_progress: "bg-orange-100 text-orange-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        }
        return colors[status] || "bg-gray-100 text-gray-800"
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Bookings Management</h1>
                <p className="text-muted-foreground">Monitor and manage all ride bookings</p>
            </div>

            <div className="mb-4 flex gap-2 flex-wrap">
                {["all", "requested", "searching", "assigned", "in_progress", "completed", "cancelled"].map((status) => (
                    <Button
                        key={status}
                        size="sm"
                        variant={filter === status ? "default" : "outline"}
                        onClick={() => setFilter(status)}
                    >
                        {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {bookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-sm font-medium">
                                    Booking #{booking.id.slice(0, 8)}
                                </CardTitle>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status.replace("_", " ")}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-green-600">Pickup</p>
                                    <p className="text-muted-foreground">{booking.pickup_address || "Address not set"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-medium text-red-600">Drop-off</p>
                                    <p className="text-muted-foreground">{booking.drop_address || "Address not set"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                <div className="flex items-center gap-1 text-sm">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">${booking.fare_amount?.toFixed(2) || "0.00"}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{booking.distance_km?.toFixed(1) || "0"} km</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
                                <p><span className="font-medium">Customer:</span> {booking.customer?.full_name || booking.customer?.email || "N/A"}</p>
                                <p><span className="font-medium">Driver:</span> {booking.driver?.profiles?.full_name || booking.driver?.profiles?.email || "Not assigned"}</p>
                                <p><span className="font-medium">Created:</span> {new Date(booking.created_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {bookings.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No bookings found for the selected filter.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
