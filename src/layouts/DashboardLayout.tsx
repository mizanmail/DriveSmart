import { Outlet, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Car, MapPin, DollarSign, Settings, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DashboardLayout() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-primary">DriveSmart</h1>
                    <p className="text-sm text-muted-foreground">Admin Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/dashboard">
                        <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2" size={18} />
                            Dashboard
                        </Button>
                    </Link>
                    <Link to="/dashboard/users">
                        <Button variant="ghost" className="w-full justify-start">
                            <Users className="mr-2" size={18} />
                            Users
                        </Button>
                    </Link>
                    <Link to="/dashboard/drivers">
                        <Button variant="ghost" className="w-full justify-start">
                            <Car className="mr-2" size={18} />
                            Drivers
                        </Button>
                    </Link>
                    <Link to="/dashboard/dispatch">
                        <Button variant="ghost" className="w-full justify-start">
                            <MapPin className="mr-2" size={18} />
                            Dispatch
                        </Button>
                    </Link>
                    <Link to="/dashboard/bookings">
                        <Button variant="ghost" className="w-full justify-start">
                            <MapPin className="mr-2" size={18} />
                            Bookings
                        </Button>
                    </Link>
                    <Link to="/dashboard/payments">
                        <Button variant="ghost" className="w-full justify-start">
                            <DollarSign className="mr-2" size={18} />
                            Payments
                        </Button>
                    </Link>
                    <Link to="/dashboard/settings">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2" size={18} />
                            Settings
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2" size={18} />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    )
}
