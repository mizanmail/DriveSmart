import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import {
    DollarSign,
    CreditCard,
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    MoreHorizontal
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"
import { format } from "date-fns"
import toast from "react-hot-toast"

interface Payment {
    id: string
    amount: number
    status: string
    payment_method: string | null
    transaction_id: string | null
    created_at: string
    booking: {
        id: string
        pickup_address: string | null
        drop_address: string | null
    } | null
}

const STATUS_CONFIG: Record<string, { color: string, label: string }> = {
    pending: { color: "bg-yellow-50 text-yellow-700", label: "Pending" },
    paid: { color: "bg-green-50 text-green-700", label: "Paid" },
    refunded: { color: "bg-slate-50 text-slate-700", label: "Refunded" },
    failed: { color: "bg-red-50 text-red-700", label: "Failed" },
}

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [filter, setFilter] = useState("all")
    const [revenueData, setRevenueData] = useState<any[]>([])

    useEffect(() => {
        fetchPayments()
    }, [])

    const fetchPayments = async () => {
        const { data, error } = await supabase
            .from("payments")
            .select(`
        *,
        booking:booking_id (id, pickup_address, drop_address)
      `)
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to fetch payments")
        } else {
            setPayments(data || [])

            // Process data for Chart (Last 7 days)
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - i)
                return format(d, 'MMM dd')
            }).reverse()

            const chartData = last7Days.map(date => {
                const dayTotal = (data || [])
                    .filter(p => format(new Date(p.created_at), 'MMM dd') === date && p.status === 'paid')
                    .reduce((sum, p) => sum + p.amount, 0)
                return { name: date, total: dayTotal }
            })
            setRevenueData(chartData)
        }
    }

    const filteredPayments = payments.filter(p => filter === "all" || p.status === filter)
    const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Payments & Finance</h1>
                    <p className="text-slate-500 mt-1">Manage transactions, refunds, and revenue reports</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter size={16} /> Filter
                    </Button>
                    <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                        <Download size={16} /> Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpRight size={12} className="mr-1" />
                            +12.5% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Pending Settlements</CardTitle>
                        <ClockIcon className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">${pendingAmount.toFixed(2)}</div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center">
                            Across {payments.filter(p => p.status === 'pending').length} transactions
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{payments.length}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Success rate: {((payments.filter(p => p.status === 'paid').length / payments.length || 0) * 100).toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Daily transaction volume for the past 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="px-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions List */}
                <Card className="border-slate-100 shadow-sm lg:col-span-1 h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto pr-2">
                        <div className="space-y-6">
                            {filteredPayments.slice(0, 5).map(payment => (
                                <div key={payment.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${payment.status === 'paid' ? 'bg-green-50 text-green-600' :
                                            payment.status === 'failed' ? 'bg-red-50 text-red-600' :
                                                'bg-slate-50 text-slate-600'
                                            }`}>
                                            {payment.status === 'paid' ? <ArrowDownLeft size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {payment.booking?.pickup_address ? 'Ride Payment' : 'Wallet Top-up'}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {format(new Date(payment.created_at), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${payment.status === 'paid' ? 'text-green-600' : 'text-slate-900'
                                            }`}>
                                            {payment.status === 'paid' ? '+' : ''}${payment.amount.toFixed(2)}
                                        </p>
                                        <p className="text-[10px] uppercase text-slate-400 font-medium">{payment.status}</p>
                                    </div>
                                </div>
                            ))}
                            {filteredPayments.length === 0 && (
                                <p className="text-center text-slate-400 py-4">No transactions found.</p>
                            )}
                        </div>
                    </CardContent>
                    <div className="p-4 border-t border-slate-50">
                        <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            View All Transactions
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Detailed Table for when they want to see everything */}
            <Card className="border-slate-100 shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Transactions</CardTitle>
                        <div className="flex gap-2">
                            {['all', 'paid', 'pending', 'failed'].map(s => (
                                <Button
                                    key={s}
                                    variant={filter === s ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setFilter(s)}
                                    className="capitalize"
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Description</th>
                                    <th className="py-3 px-4">Method</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Amount</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-slate-50/50">
                                        <td className="py-3 px-4 text-slate-500">
                                            {format(new Date(payment.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-slate-900">
                                                {payment.booking?.pickup_address?.split(',')[0] || 'System Transaction'}
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono">{payment.transaction_id || payment.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="py-3 px-4 capitalize text-slate-600">
                                            {payment.payment_method || 'Wallet'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[payment.status]?.color || 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {STATUS_CONFIG[payment.status]?.label || payment.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                                            ${payment.amount.toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                                                <MoreHorizontal size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}
