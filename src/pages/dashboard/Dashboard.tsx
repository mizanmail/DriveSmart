import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    Users,
    Car,
    MapPin,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    ArrowRight,
    Clock,
    CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts"

// Mock data for charts (since we might not have enough history yet)
const revenueData = [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 },
]

const bookingsData = [
    { name: 'Mon', completed: 20, cancelled: 2 },
    { name: 'Tue', completed: 15, cancelled: 5 },
    { name: 'Wed', completed: 30, cancelled: 1 },
    { name: 'Thu', completed: 40, cancelled: 3 },
    { name: 'Fri', completed: 35, cancelled: 2 },
    { name: 'Sat', completed: 50, cancelled: 0 },
    { name: 'Sun', completed: 45, cancelled: 4 },
]

export default function Dashboard() {
    const [stats, setStats] = useState({
        users: 0,
        drivers: 0,
        bookings: 0,
        revenue: 0,
        activeDrivers: 0 // Drivers currently online
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)

        // Run all count queries in parallel
        const [
            { count: userCount },
            { count: driverCount },
            { count: bookingCount },
            { data: revenueData },
            { count: activeDriverCount }
        ] = await Promise.all([
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("drivers").select("*", { count: "exact", head: true }).eq('status', 'approved'),
            supabase.from("bookings").select("*", { count: "exact", head: true }),
            supabase.from("payments").select("amount"),
            supabase.from("drivers").select("*", { count: "exact", head: true }).eq('is_online', true)
        ])

        const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

        setStats({
            users: userCount || 0,
            drivers: driverCount || 0,
            bookings: bookingCount || 0,
            revenue: totalRevenue,
            activeDrivers: activeDriverCount || 0
        })
        setLoading(false)
    }

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

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time platform insights and performance metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 bg-white">
                        <Clock size={16} />
                        Last 7 Days
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200">
                        <Activity size={16} />
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`$${stats.revenue.toLocaleString()}`}
                    icon={DollarSign}
                    trend="+12.5%"
                    trendUp={true}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="Total Bookings"
                    value={stats.bookings.toString()}
                    icon={MapPin}
                    trend="+8.2%"
                    trendUp={true}
                    color="purple"
                    loading={loading}
                />
                <StatsCard
                    title="Active Drivers"
                    value={stats.activeDrivers.toString()}
                    subValue={`of ${stats.drivers} approved`}
                    icon={Car}
                    trend="-2.1%"
                    trendUp={false}
                    color="green"
                    loading={loading}
                />
                <StatsCard
                    title="Total Users"
                    value={stats.users.toString()}
                    icon={Users}
                    trend="+5.4%"
                    trendUp={true}
                    color="orange"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                            <CardTitle>Revenue Overview</CardTitle>
                            <CardDescription>Daily earnings for the past week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity / Bookings Chart */}
                <motion.div variants={item} className="lg:col-span-1">
                    <Card className="border-slate-100 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                        <CardHeader>
                            <CardTitle>Trip Status</CardTitle>
                            <CardDescription>Completed vs Cancelled</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bookingsData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions & Recent */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
                <motion.div variants={item}>
                    <Card className="border-slate-100 shadow-md hover:shadow-lg transition-all h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Activity</CardTitle>
                            <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">New Booking Completed</p>
                                                <p className="text-xs text-slate-500">2 minutes ago</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-slate-700">+$24.50</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-slate-100 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-slate-900 to-slate-800 text-white h-full relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity size={120} />
                        </div>

                        <CardHeader>
                            <CardTitle className="text-white">Quick Actions</CardTitle>
                            <CardDescription className="text-slate-300">Common administrative tasks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 relative z-10">
                            <Button className="w-full justify-between bg-white/10 hover:bg-white/20 border-none text-white h-12">
                                Approve Pending Drivers
                                <ArrowRight size={16} />
                            </Button>
                            <Button className="w-full justify-between bg-white/10 hover:bg-white/20 border-none text-white h-12">
                                Review Recent Reports
                                <ArrowRight size={16} />
                            </Button>
                            <Button className="w-full justify-between bg-white/10 hover:bg-white/20 border-none text-white h-12">
                                Update Pricing Settings
                                <ArrowRight size={16} />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    )
}

// Reusable Stats Card Component
function StatsCard({
    title,
    value,
    subValue,
    icon: Icon,
    trend,
    trendUp,
    color,
    loading
}: {
    title: string,
    value: string,
    subValue?: string,
    icon: any,
    trend: string,
    trendUp: boolean,
    color: "blue" | "purple" | "green" | "orange",
    loading: boolean
}) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
    }

    return (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <Card className="border-slate-100 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
                            <Icon size={24} />
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {trend}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                        {loading ? (
                            <div className="h-8 w-24 bg-slate-200 rounded animate-pulse" />
                        ) : (
                            <div className="text-3xl font-bold text-slate-900">{value}</div>
                        )}
                        {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
