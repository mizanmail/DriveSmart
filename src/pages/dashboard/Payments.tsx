import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { DollarSign, RefreshCw } from "lucide-react"

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

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")

    useEffect(() => {
        fetchPayments()
    }, [filter])

    const fetchPayments = async () => {
        setLoading(true)
        let query = supabase
            .from("payments")
            .select(`
        *,
        booking:booking_id (id, pickup_address, drop_address)
      `)
            .order("created_at", { ascending: false })

        if (filter !== "all") {
            query = query.eq("status", filter)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching payments:", error)
        } else {
            setPayments(data || [])
        }
        setLoading(false)
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: "bg-yellow-100 text-yellow-800",
            paid: "bg-green-100 text-green-800",
            refunded: "bg-blue-100 text-blue-800",
            failed: "bg-red-100 text-red-800",
        }
        return colors[status] || "bg-gray-100 text-gray-800"
    }

    const totalRevenue = payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0)

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Payments & Finance</h1>
                <p className="text-muted-foreground">Track and manage payment transactions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">All paid transactions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payments.length}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {payments.filter((p) => p.status === "pending").length}
                        </div>
                        <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-4 flex gap-2">
                {["all", "pending", "paid", "refunded", "failed"].map((status) => (
                    <Button
                        key={status}
                        size="sm"
                        variant={filter === status ? "default" : "outline"}
                        onClick={() => setFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History ({payments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Transaction ID</th>
                                    <th className="text-left py-3 px-4">Amount</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Method</th>
                                    <th className="text-left py-3 px-4">Booking ID</th>
                                    <th className="text-left py-3 px-4">Date</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4 font-mono text-sm">{payment.transaction_id || payment.id.slice(0, 12)}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1 font-semibold">
                                                <DollarSign className="h-4 w-4" />
                                                {payment.amount.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 capitalize">{payment.payment_method || "N/A"}</td>
                                        <td className="py-3 px-4 font-mono text-xs">{payment.booking?.id.slice(0, 8) || "-"}</td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            {payment.status === "paid" && (
                                                <Button size="sm" variant="outline">
                                                    <RefreshCw className="mr-1" size={14} />
                                                    Refund
                                                </Button>
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
