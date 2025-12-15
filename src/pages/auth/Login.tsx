import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Mail, Lock, Loader2, Car } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        setLoading(false)

        if (error) {
            toast.error(error.message || "Login failed. Please try again.")
            return
        }

        if (data.user) {
            toast.success("Welcome back!")
            setTimeout(() => {
                navigate("/dashboard")
            }, 500)
        }
    }

    return (
        <>
            <Toaster position="top-center" />
            <div className="min-h-screen flex">
                {/* Left Side - Branding with Animated Gradient */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 relative overflow-hidden"
                >
                    {/* Animated Background Circles */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [90, 0, 90],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mb-8"
                        >
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                                <Car size={48} className="text-white" />
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl font-bold mb-4 text-center"
                        >
                            Welcome to DriveSmart
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-white/90 text-center max-w-md mb-12"
                        >
                            Manage your ride-hailing platform with powerful tools and real-time insights.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="grid grid-cols-3 gap-8 text-center"
                        >
                            <div>
                                <div className="text-4xl font-bold mb-2">10K+</div>
                                <div className="text-white/80">Active Riders</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">500+</div>
                                <div className="text-white/80">Drivers</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold mb-2">98%</div>
                                <div className="text-white/80">Satisfaction</div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                                <Car size={32} className="text-white" />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-slate-100">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                                <p className="text-slate-600">Sign in to your admin dashboard</p>
                            </div>

                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email Field */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="email" className="text-slate-700 font-medium">
                                        Email Address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@drivesmart.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-12 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                            required
                                        />
                                    </div>
                                </motion.div>

                                {/* Password Field */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="password" className="text-slate-700 font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-12 pr-12 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Remember Me & Forgot Password */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center justify-between"
                                >
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-600">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>
                                </motion.div>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-500">Or</span>
                                </div>
                            </div>

                            {/* Sign Up Link */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <p className="text-slate-600">
                                    Don't have an account?{" "}
                                    <button
                                        onClick={() => navigate("/signup")}
                                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                    >
                                        Sign Up
                                    </button>
                                </p>
                            </motion.div>
                        </div>

                        {/* Footer */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-center text-sm text-slate-500 mt-8"
                        >
                            © 2025 DriveSmart. All rights reserved.
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </>
    )
}
