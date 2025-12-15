import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import {
    Ban,
    CheckCircle,
    Search,
    Mail,
    Shield
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import toast from "react-hot-toast"
import { format } from "date-fns"

interface Profile {
    id: string
    email: string
    full_name: string | null
    role: string
    is_blocked: boolean
    created_at: string
}

export default function Users() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [roleFilter, setRoleFilter] = useState<string>("all")

    useEffect(() => {
        fetchProfiles()
    }, [])

    const fetchProfiles = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            toast.error("Failed to fetch users")
            console.error("Error fetching profiles:", error)
        } else {
            setProfiles(data || [])
        }
        setLoading(false)
    }

    const toggleBlock = async (userId: string, currentStatus: boolean, name: string) => {
        const { error } = await supabase
            .from("profiles")
            .update({ is_blocked: !currentStatus })
            .eq("id", userId)

        if (error) {
            toast.error("Failed to update user status")
            console.error("Error updating user:", error)
        } else {
            toast.success(`${currentStatus ? 'Unblocked' : 'Blocked'} ${name || 'user'}`)
            fetchProfiles()
        }
    }

    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch =
            profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || "")

        const matchesRole = roleFilter === "all" || profile.role === roleFilter

        return matchesSearch && matchesRole
    })

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 mt-1">View, search, and manage user accounts</p>
                </div>
                <Button onClick={fetchProfiles} variant="outline" className="gap-2">
                    Refresh List
                </Button>
            </div>

            <Card className="border-slate-100 shadow-lg">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <CardTitle>All Users ({filteredProfiles.length})</CardTitle>

                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-10 w-full md:w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={roleFilter === "all" ? "default" : "outline"}
                                    onClick={() => setRoleFilter("all")}
                                    size="sm"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={roleFilter === "driver" ? "default" : "outline"}
                                    onClick={() => setRoleFilter("driver")}
                                    size="sm"
                                >
                                    Drivers
                                </Button>
                                <Button
                                    variant={roleFilter === "customer" ? "default" : "outline"}
                                    onClick={() => setRoleFilter("customer")}
                                    size="sm"
                                >
                                    Customers
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="py-4 px-6">User</th>
                                    <th className="py-4 px-6">Role</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Joined</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td className="py-4 px-6"><div className="h-10 w-40 bg-slate-100 rounded-full" /></td>
                                                <td className="py-4 px-6"><div className="h-6 w-20 bg-slate-100 rounded-full" /></td>
                                                <td className="py-4 px-6"><div className="h-6 w-20 bg-slate-100 rounded-full" /></td>
                                                <td className="py-4 px-6"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                                                <td className="py-4 px-6"><div className="h-8 w-8 ml-auto bg-slate-100 rounded" /></td>
                                            </tr>
                                        ))
                                    ) : filteredProfiles.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-500">
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProfiles.map((profile) => (
                                            <motion.tr
                                                key={profile.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-50/80 transition-colors group"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name || profile.email}`} />
                                                            <AvatarFallback>{profile.email[0].toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{profile.full_name || "Unknown Name"}</p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Mail size={10} />
                                                                {profile.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${profile.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                        profile.role === 'driver' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                            "bg-slate-50 text-slate-700 border-slate-200"
                                                        }`}>
                                                        {profile.role === 'admin' ? <Shield size={10} className="mr-1" /> : null}
                                                        {profile.role === 'driver' ? <CheckCircle size={10} className="mr-1" /> : null}
                                                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {profile.is_blocked ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                            <Ban size={10} className="mr-1" />
                                                            Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                            <CheckCircle size={10} className="mr-1" />
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-500">
                                                    {format(new Date(profile.created_at), 'MMM d, yyyy')}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant={profile.is_blocked ? "default" : "ghost"}
                                                        className={profile.is_blocked ? "bg-green-600 hover:bg-green-700" : "text-slate-400 hover:text-red-600 hover:bg-red-50"}
                                                        onClick={() => toggleBlock(profile.id, profile.is_blocked, profile.full_name || profile.email)}
                                                    >
                                                        {profile.is_blocked ? "Unblock" : "Block"}
                                                    </Button>
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
