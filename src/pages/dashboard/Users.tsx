import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Ban, CheckCircle } from "lucide-react"

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
            console.error("Error fetching profiles:", error)
        } else {
            setProfiles(data || [])
        }
        setLoading(false)
    }

    const toggleBlock = async (userId: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("profiles")
            .update({ is_blocked: !currentStatus })
            .eq("id", userId)

        if (error) {
            console.error("Error updating user:", error)
        } else {
            fetchProfiles()
        }
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage all registered users</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({profiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">Name</th>
                                    <th className="text-left py-3 px-4">Role</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-left py-3 px-4">Created</th>
                                    <th className="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map((profile) => (
                                    <tr key={profile.id} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4">{profile.email}</td>
                                        <td className="py-3 px-4">{profile.full_name || "-"}</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {profile.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {profile.is_blocked ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Blocked
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-muted-foreground">
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Button
                                                size="sm"
                                                variant={profile.is_blocked ? "default" : "destructive"}
                                                onClick={() => toggleBlock(profile.id, profile.is_blocked)}
                                            >
                                                {profile.is_blocked ? (
                                                    <>
                                                        <CheckCircle className="mr-1" size={14} />
                                                        Unblock
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban className="mr-1" size={14} />
                                                        Block
                                                    </>
                                                )}
                                            </Button>
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
