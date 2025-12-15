import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Car, MapPin, Activity } from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface Driver {
    id: string
    is_online: boolean
    status: string
    rating: number
    current_location: {
        coordinates: [number, number]
    } | null
    profiles: {
        email: string
        full_name: string | null
    }
}

interface Booking {
    id: string
    status: string
    pickup_lat: number
    pickup_lng: number
    pickup_address: string | null
}

export default function DispatchConsole() {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [center] = useState<[number, number]>([37.7749, -122.4194]) // Default to San Francisco

    useEffect(() => {
        fetchData()
        // Set up real-time subscriptions
        const driversChannel = supabase
            .channel("drivers-changes")
            .on("postgres_changes", { event: "*", schema: "public", table: "drivers" }, () => {
                fetchData()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(driversChannel)
        }
    }, [])

    const fetchData = async () => {
        setLoading(true)

        // Fetch online drivers with locations
        const { data: driversData } = await supabase
            .from("drivers")
            .select(`
        *,
        profiles:id (email, full_name)
      `)
            .eq("is_online", true)
            .not("current_location", "is", null)

        // Fetch unassigned bookings
        const { data: bookingsData } = await supabase
            .from("bookings")
            .select("*")
            .in("status", ["requested", "searching"])

        setDrivers(driversData || [])
        setBookings(bookingsData || [])
        setLoading(false)
    }

    const onlineDriversCount = drivers.filter((d) => d.is_online).length
    const availableDriversCount = drivers.filter((d) => d.status === "approved" && d.is_online).length
    const unassignedBookingsCount = bookings.length

    return (
        <div className="h-full flex flex-col">
            {/* Header Stats */}
            <div className="p-4 bg-white border-b">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Live Dispatch Console</h1>
                        <p className="text-sm text-muted-foreground">Real-time driver tracking and assignment</p>
                    </div>
                    <Button onClick={fetchData}>
                        <Activity className="mr-2" size={16} />
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-green-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Online Drivers</p>
                                    <p className="text-2xl font-bold text-green-600">{onlineDriversCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Available</p>
                                    <p className="text-2xl font-bold text-blue-600">{availableDriversCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-yellow-600" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Unassigned Rides</p>
                                    <p className="text-2xl font-bold text-yellow-600">{unassignedBookingsCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 p-4">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Live Map</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <p>Loading map...</p>
                            </div>
                        ) : (
                            <MapContainer
                                center={center}
                                zoom={13}
                                className="h-full w-full rounded-md"
                                style={{ minHeight: "500px" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {/* Driver Markers */}
                                {drivers.map((driver) => {
                                    if (!driver.current_location?.coordinates) return null
                                    const [lng, lat] = driver.current_location.coordinates

                                    return (
                                        <Marker key={driver.id} position={[lat, lng]}>
                                            <Popup>
                                                <div className="p-2">
                                                    <p className="font-semibold">{driver.profiles?.full_name || "Driver"}</p>
                                                    <p className="text-xs text-muted-foreground">{driver.profiles?.email}</p>
                                                    <p className="text-xs mt-1">
                                                        Status: <span className="font-medium text-green-600">{driver.status}</span>
                                                    </p>
                                                    <p className="text-xs">Rating: {driver.rating.toFixed(1)} ⭐</p>
                                                </div>
                                            </Popup>
                                            <Circle center={[lat, lng]} radius={500} color="green" fillColor="green" fillOpacity={0.1} />
                                        </Marker>
                                    )
                                })}

                                {/* Booking Markers */}
                                {bookings.map((booking) => (
                                    <Marker key={booking.id} position={[booking.pickup_lat, booking.pickup_lng]}>
                                        <Popup>
                                            <div className="p-2">
                                                <p className="font-semibold">Pickup Request</p>
                                                <p className="text-xs">{booking.pickup_address || "Address not set"}</p>
                                                <p className="text-xs mt-1">
                                                    Status: <span className="font-medium text-yellow-600">{booking.status}</span>
                                                </p>
                                            </div>
                                        </Popup>
                                        <Circle
                                            center={[booking.pickup_lat, booking.pickup_lng]}
                                            radius={300}
                                            color="yellow"
                                            fillColor="yellow"
                                            fillOpacity={0.2}
                                        />
                                    </Marker>
                                ))}
                            </MapContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
