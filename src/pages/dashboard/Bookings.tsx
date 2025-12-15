import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import {
    Car,
    Calendar,
    MoreHorizontal
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"
import { format } from "date-fns"

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

const STATUS_CONFIG: Record<string, { color: string, label: string }> = {
    requested: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Requested" },
    searching: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Searching" },
    assigned: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Driver Assigned" },
    arrived: { color: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Driver Arrived" },
    in_progress: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "In Progress" },
    completed: { color: "bg-green-50 text-green-700 border-green-200", label: "Completed" },
    cancelled: { color: "bg-red-50 text-red-700 border-red-200", label: "Cancelled" },
}

export default function Bookings() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to fetch bookings")
        } else {
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

    const filteredBookings = bookings.filter(b => filter === "all" || b.status === filter)

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }



    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bookings</h1>
                    <p className="text-slate-500 mt-1">Track and manage ride requests in real-time</p>
                </div>
                <Button onClick={fetchBookings} variant="outline" className="gap-2">
                    Refresh
                </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {["all", "requested", "assigned", "in_progress", "completed", "cancelled"].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? "default" : "outline"}
                        onClick={() => setFilter(status)}
                        className={`capitalize whitespace-nowrap ${filter === status ? 'bg-slate-900' : ''}`}
                        size="sm"
                    >
                        {status.replace("_", " ")}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                        ))
                    ) : filteredBookings.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200"
                        >
                            <Car size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No bookings found matching this filter.</p>
                        </motion.div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

function BookingCard({ booking }: { booking: Booking }) {
    const status = STATUS_CONFIG[booking.status] || { color: "bg-slate-100", label: booking.status }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-mono text-slate-400">ID: #{booking.id.slice(0, 8)}</span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border w-fit ${status.color}`}>
                                {status.label}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={12} />
                            {format(new Date(booking.created_at), 'MMM d, HH:mm')}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                    <div className="relative pl-4 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {/* Pickup */}
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-slate-400 bg-white" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pickup</p>
                                <p className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">
                                    {booking.pickup_address || "Location not set"}
                                </p>
                            </div>
                        </div>

                        {/* Dropoff */}
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-slate-900 bg-slate-900" />
                            <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dropoff</p>
                                <p className="text-sm font-medium text-slate-900 leading-snug line-clamp-2">
                                    {booking.drop_address || "Location not set"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex -space-x-2">
                            {/* Customer Avatar */}
                            <div className="relative group/tooltip">
                                <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-slate-100">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.customer?.full_name}`} />
                                    <AvatarFallback>C</AvatarFallback>
                                </Avatar>
                            </div>
                            {/* Driver Avatar */}
                            {booking.driver && (
                                <div className="relative group/tooltip">
                                    <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-slate-100">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.driver.profiles?.full_name}`} />
                                        <AvatarFallback>D</AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                        </div>

                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                                ${booking.fare_amount?.toFixed(2) || "0.00"}
                            </p>
                            <p className="text-xs text-slate-500">{booking.distance_km?.toFixed(1) || 0} km</p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-slate-50 p-3 flex justify-between items-center border-t border-slate-100">
                    <Button size="sm" variant="ghost" className="text-slate-500 h-8 text-xs hover:text-slate-900">
                        View Details
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
