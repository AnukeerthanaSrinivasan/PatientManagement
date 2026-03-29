import React, { useState, useEffect } from "react";
import { Leaf, Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useToast } from "../../contexts/ToastContext.jsx";

const LoginPage = ({
  onSwitchToSignup,
  onAuthSuccess,
  onBackToLanding,
  prefillEmail = "",
  prefillPassword = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Prefill credentials if passed from SignupPage
  useEffect(() => {
    if (prefillEmail || prefillPassword) {
      setFormData({
        email: prefillEmail,
        password: prefillPassword,
        rememberMe: false,
      });
    }
  }, [prefillEmail, prefillPassword]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const { show } = useToast();

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      show({
        title: "Missing Fields",
        message: "Please fill in all fields",
        duration: 4000,
      });
      return;
    }

    if (!formData.email.includes("@")) {
      show({
        title: "Invalid Email",
        message: "Please enter a valid email address",
        duration: 4000,
      });
      return;
    }

    if (formData.password.length < 6) {
      show({
        title: "Invalid Password",
        message: "Password must be at least 6 characters",
        duration: 4000,
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok) {
        show({
          title: "Success",
          message: "Login successful ✅",
          duration: 4000,
        });

        if (onAuthSuccess) {
          if (data.token) localStorage.setItem("token", data.token);
          const userObj = {
            _id: data._id,
            name: data.name,
            email: data.email,
            userType: data.userType,
          };
          localStorage.setItem("user", JSON.stringify(userObj));
          onAuthSuccess(userObj);
        }
      } else {
        show({
          title: "Login Failed",
          message: data.msg || "Login failed ❌",
          duration: 4000,
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      show({
        title: "Error",
        message: "Something went wrong. Please try again.",
        duration: 4000,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-gradient-to-br from-ayurveda-chandana/30 via-ayurveda-haldi/20 to-ayurveda-kumkum/20">
      {/* Background Layers */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513]/20 via-[#CD853F]/15 to-[#DEB887]/20 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-[url('/patterns/mandala-bg.svg')] bg-repeat-x bg-center opacity-5 animate-spin-very-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-[#8B4513]/10 to-[#CD853F]/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[url('/patterns/corner-mandala.svg')] bg-no-repeat bg-contain opacity-5"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[url('/patterns/corner-mandala.svg')] bg-no-repeat bg-contain opacity-5 rotate-180"></div>
      </div>

      {/* Back Button */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="fixed top-6 left-6 flex items-center text-gray-600 hover:text-ayurveda-brahmi font-medium transition-colors z-50"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
      )}

      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <img
              src="/logo/om-symbol.svg"
              alt="Logo Symbol"
              className="w-32 h-32 mx-auto animate-float-slow"
            />
          </div>
          <h1 className="text-7xl font-display text-dosha-kapha mb-6 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-[#8B4513] via-[#CD853F] to-[#DEB887] bg-clip-text text-transparent">
              AyurSutra
            </span>
          </h1>
          <p className="text-2xl text-gray-600/90 font-body tracking-wide mb-3">
            Welcome to Your Healing Center
          </p>
          <p className="text-xl text-gray-500/80 font-body italic">
            Welcome to the journey of balanced healing
          </p>

          {/* Treatment Icons */}
          <div className="mt-12 grid grid-cols-5 gap-6">
            <img src="/treatments/vamana.svg" alt="Emesis" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/virechana.svg" alt="Purgation" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/basti.svg" alt="Enema" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/nasya.svg" alt="Nasal" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/raktamoksha.svg" alt="Purification" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/patterns/herbs-bg.svg')] bg-repeat opacity-5"></div>
          <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white/10 to-transparent"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-xl bg-[#FDF5E6]/90 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_rgba(139,69,19,0.15)] p-8 border border-[#DEB887]/30 hover:shadow-[0_8px_32px_rgba(139,69,19,0.25)] transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-[#8B4513]/30 via-[#CD853F]/20 to-[#DEB887]/30 -z-10"></div>

          <h2 className="text-2xl font-display text-dosha-kapha mb-8 text-center">
            Welcome Back
          </h2>

          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 tracking-wide">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-ayurveda-kumkum transition-colors group-focus-within:text-ayurveda-kumkum" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-ayurveda-kumkum/20 focus:border-ayurveda-kumkum hover:border-ayurveda-kumkum/50 transition-all duration-200 placeholder:text-gray-400 text-gray-700"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 tracking-wide">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-ayurveda-kumkum transition-colors group-focus-within:text-ayurveda-kumkum" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-12 py-3.5 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-ayurveda-kumkum/20 focus:border-ayurveda-kumkum hover:border-ayurveda-kumkum/50 transition-all duration-200 placeholder:text-gray-400 text-gray-700"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#8B4513] to-[#CD853F] text-[#FDF5E6] px-6 py-4 rounded-xl font-medium group shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#CD853F] to-[#DEB887] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <span className="text-lg font-display block mb-1">
                  Login to Account
                </span>
                <span className="text-sm opacity-90">
                  Begin Your Healing Journey
                </span>
              </div>
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8B4513]/30 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-[#FDF5E6] px-6 py-2 rounded-full">
                  <div className="text-center">
                    <p className="text-xs text-[#8B4513]/70 font-decorative uppercase tracking-widest">
                      Purification
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center px-4 py-3 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl hover:border-ayurveda-kumkum/50 hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors font-medium">
                  Continue with Google
                </span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-600 text-base">
                Don't have an account?
              </span>
              <button
                onClick={onSwitchToSignup}
                className="text-ayurveda-kumkum hover:text-ayurveda-brahmi font-semibold transition-colors text-base underline-offset-4 hover:underline"
              >
                Sign up here
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
        <div className="text-xs text-gray-500/70 backdrop-blur-sm bg-white/20 py-1.5 mx-auto inline-block px-4 rounded-full shadow-sm pointer-events-auto">
          By signing in, you agree to our{" "}
          <a href="#" className="text-ayurveda-kumkum hover:text-ayurveda-brahmi transition-colors font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-ayurveda-kumkum hover:text-ayurveda-brahmi transition-colors font-medium">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;