import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import {
    CheckCircle,
    XCircle,
    Search,
    Car,
    Star,
    Activity,
    Clock
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"

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
    const [search, setSearch] = useState("")
    const [stats, setStats] = useState({ total: 0, pending: 0, online: 0, avgRating: 0 })

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("drivers")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to fetch drivers")
            setDrivers([])
        } else {
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

            // Calculate Stats
            const total = driversWithProfiles.length
            const pending = driversWithProfiles.filter(d => d.status === 'pending').length
            const online = driversWithProfiles.filter(d => d.is_online).length
            const avgRating = total > 0
                ? driversWithProfiles.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total
                : 0

            setStats({ total, pending, online, avgRating })
        }
        setLoading(false)
    }

    const updateDriverStatus = async (driverId: string, status: string, name: string) => {
        const { error } = await supabase
            .from("drivers")
            .update({ status })
            .eq("id", driverId)

        if (error) {
            toast.error("Failed to update status")
        } else {
            toast.success(`Driver ${name} ${status}`)
            fetchDrivers()
        }
    }

    const filteredDrivers = drivers.filter(driver => {
        const matchesStatus = filter === "all" || driver.status === filter
        const matchesSearch =
            driver.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            driver.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
            driver.license_number?.toLowerCase().includes(search.toLowerCase())

        return matchesStatus && (matchesSearch || false)
    })

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Driver Management</h1>
                    <p className="text-slate-500 mt-1">Review applications and monitor fleet performance</p>
                </div>
                <Button onClick={fetchDrivers} variant="outline" className="gap-2">
                    Refresh Data
                </Button>
            </div>

            {/* Driver Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard icon={Car} label="Total Drivers" value={stats.total.toString()} color="blue" />
                <StatsCard icon={Clock} label="Pending Approval" value={stats.pending.toString()} color="yellow" />
                <StatsCard icon={Activity} label="Online Now" value={stats.online.toString()} color="green" />
                <StatsCard icon={Star} label="Avg Rating" value={stats.avgRating.toFixed(1)} color="purple" suffix="⭐" />
            </div>

            <Card className="border-slate-100 shadow-lg overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                        <div className="flex gap-2">
                            {["all", "pending", "approved", "rejected"].map((status) => (
                                <Button
                                    key={status}
                                    variant={filter === status ? "default" : "outline"}
                                    onClick={() => setFilter(status)}
                                    size="sm"
                                    className={`capitalize ${filter === status ? 'bg-slate-900' : 'bg-white'}`}
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Search drivers..."
                                className="pl-10 bg-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="py-4 px-6">Driver</th>
                                    <th className="py-4 px-6">License / Status</th>
                                    <th className="py-4 px-6">Performance</th>
                                    <th className="py-4 px-6">Activity</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="py-6 px-6">
                                                    <div className="h-2 bg-slate-100 rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredDrivers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500">
                                                No drivers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDrivers.map((driver) => (
                                            <motion.tr
                                                key={driver.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-50/50 transition-colors"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.profiles?.full_name}`} />
                                                            <AvatarFallback>{driver.profiles?.email[0].toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{driver.profiles?.full_name || "Unknown"}</p>
                                                            <p className="text-xs text-slate-500">{driver.profiles?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-mono text-xs text-slate-500">{driver.license_number || "No License"}</span>
                                                        <StatusBadge status={driver.status} />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-slate-400">Rating</span>
                                                            <div className="flex items-center font-medium text-slate-700">
                                                                <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                                                                {driver.rating.toFixed(1)}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-slate-400">Rides</span>
                                                            <span className="font-medium text-slate-700">{driver.total_rides}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {driver.is_online ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                                            Online
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                            Offline
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-end gap-2">
                                                        {driver.status === "pending" ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 h-8"
                                                                    onClick={() => updateDriverStatus(driver.id, "approved", driver.profiles?.full_name || "")}
                                                                >
                                                                    <CheckCircle size={14} className="mr-1" /> Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-8"
                                                                    onClick={() => updateDriverStatus(driver.id, "rejected", driver.profiles?.full_name || "")}
                                                                >
                                                                    <XCircle size={14} className="mr-1" /> Reject
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button size="sm" variant="ghost" className="text-slate-400">
                                                                View Details
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        approved: "bg-green-50 text-green-700 border-green-200",
        pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        suspended: "bg-slate-100 text-slate-700 border-slate-200"
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize w-fit ${styles[status as keyof typeof styles] || styles.suspended}`}>
            {status}
        </span>
    )
}

function StatsCard({ icon: Icon, label, value, color, suffix }: any) {
    const colors = {
        blue: "text-blue-600 bg-blue-50",
        yellow: "text-yellow-600 bg-yellow-50",
        green: "text-green-600 bg-green-50",
        purple: "text-purple-600 bg-purple-50"
    }

    return (
        <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-sm text-slate-500 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}{suffix}</p>
                </div>
            </CardContent>
        </Card>
    )
}
