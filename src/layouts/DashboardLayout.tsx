import { useState } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Users,
    Car,
    MapPin,
    DollarSign,
    Settings,
    LogOut,
    Bell,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/dashboard/users", label: "Users", icon: Users },
        { path: "/dashboard/drivers", label: "Drivers", icon: Car },
        { path: "/dashboard/dispatch", label: "Dispatch", icon: MapPin },
        { path: "/dashboard/bookings", label: "Bookings", icon: Calendar },
        { path: "/dashboard/payments", label: "Payments", icon: DollarSign },
        { path: "/dashboard/settings", label: "Settings", icon: Settings },
    ]

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={{ width: 256 }}
                animate={{ width: collapsed ? 80 : 256 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                className="bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl relative"
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 text-slate-500 z-50"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Logo */}
                <div className="p-6 flex items-center h-20 border-b border-slate-100">
                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <Car className="text-white" size={20} />
                        </div>
                        <motion.div
                            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                            className="flex flex-col"
                        >
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                DriveSmart
                            </h1>
                            <p className="text-xs text-slate-500">Admin Portal</p>
                        </motion.div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== "/dashboard" && location.pathname.startsWith(item.path))

                        return (
                            <Link key={item.path} to={item.path}>
                                <div className="relative">
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-blue-50 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start h-12 relative z-10 ${isActive ? "text-blue-600 font-medium" : "text-slate-600 hover:text-slate-900"
                                            } ${collapsed ? "px-0 justify-center" : "px-4"}`}
                                    >
                                        <item.icon className={`${collapsed ? "mr-0" : "mr-3"} ${isActive ? "text-blue-600" : "text-slate-500"}`} size={20} />
                                        {!collapsed && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </Button>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        className={`w-full ${collapsed ? "justify-center px-0" : "justify-start px-2"} text-red-500 hover:text-red-600 hover:bg-red-50`}
                        onClick={handleLogout}
                    >
                        <LogOut className={`${collapsed ? "mr-0" : "mr-2"}`} size={20} />
                        {!collapsed && <span>Logout</span>}
                    </Button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50/50">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-slate-800 capitalize">
                            {location.pathname.split("/").pop() || "Dashboard"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all w-64">
                            <Search size={18} className="text-slate-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {/* User Avatar */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-slate-900">Admin User</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-slate-100 cursor-pointer">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8 scroll-smooth">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-7xl mx-auto pb-10"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    )
}
