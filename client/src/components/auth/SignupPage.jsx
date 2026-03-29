import React, { useState } from "react";
import { useToast } from "../../contexts/ToastContext.jsx";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";

const SignupPage = ({ onSwitchToLogin, onSignupSuccess, onBackToLanding }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "patient", // default selection
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const { show } = useToast();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      show({
        title: "Missing fields",
        message: "Please fill in name, email and password",
        duration: 4000,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      show({
        title: "Password mismatch",
        message: "Passwords do not match",
        duration: 4000,
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (e) {
        data = { msg: await res.text().catch(() => "No response body") };
      }

      if (res.ok) {
        show({
          title: "Signup successful",
          message: data.msg || "Account created",
          duration: 4000,
        });
        if (onSignupSuccess)
          onSignupSuccess(
            data.user || { email: formData.email, password: formData.password }
          );
      } else {
        show({
          title: "Signup failed",
          message: data.msg || `Status ${res.status}`,
          duration: 6000,
        });
      }
    } catch (err) {
      console.error("Signup error", err);
      show({
        title: "Signup error",
        message: err.message || "Network error",
        duration: 6000,
      });
    }
  };

  const isPatient = formData.userType === "patient";
  const bgGradient = "from-[#8B4513]/20 via-[#CD853F]/15 to-[#DEB887]/20";
  const patternUrl = "/patterns/herbs-bg.svg";
  const accentCircle = "bg-[#8B4513]/30";
  const accentCircle2 = "bg-[#CD853F]/20";
  const accentCircle3 = "bg-[#DEB887]/20";

  return (
    <div className="h-screen w-full flex relative overflow-hidden bg-gradient-to-br from-ayurveda-chandana/30 via-ayurveda-haldi/20 to-ayurveda-kumkum/20">
      {/* Background Layers */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B4513]/20 via-[#CD853F]/15 to-[#DEB887]/20 animate-gradient-slow"></div>
        <div className="absolute inset-0 bg-[url('/patterns/mandala-bg.svg')] bg-repeat-x bg-center opacity-5 animate-spin-very-slow"></div>
        <div className="absolute top-1/2 left-1/2 w-[1200px] h-[1200px] bg-gradient-to-r from-[#8B4513]/10 to-[#CD853F]/10 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[url('/patterns/corner-mandala.svg')] bg-no-repeat bg-contain opacity-5"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[url('/patterns/corner-mandala.svg')] bg-no-repeat bg-contain opacity-5 rotate-180"></div>
        
        {/* Dynamic Visual Content */}
        <img
          src="/patterns/herbs-bg.svg"
          alt="Visual Decoration"
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none z-0"
        />
        <div className="absolute left-10 top-24 flex flex-col items-start z-10">
          <img
            src={isPatient ? "/patterns/lotus-bg.svg" : "/patterns/mandala-small.svg"}
            alt="Icon"
            className="w-16 h-16 mb-2 opacity-80"
          />
          <span className="text-2xl md:text-3xl font-bold text-[#8B4513] drop-shadow-sm">
            {isPatient ? "Nurture Your Wellness" : "Trusted Experts"}
          </span>
          <span className="text-base md:text-lg text-[#CD853F] mt-1 font-medium italic">
            {isPatient ? "Your journey to health begins here" : "Care, Compassion & Healing Wisdom"}
          </span>
        </div>

        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`}></div>
        <div className={`absolute inset-0 bg-[url('${patternUrl}')] bg-repeat opacity-20`}></div>
        
        {/* Floating Accents */}
        <div className={`absolute -top-40 -right-40 w-[600px] h-[600px] ${accentCircle} rounded-full filter blur-2xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-[600px] h-[600px] ${accentCircle2} rounded-full filter blur-2xl`}></div>
        <div className={`absolute top-1/2 right-1/2 w-[700px] h-[700px] ${accentCircle3} rounded-full filter blur-2xl translate-x-1/2 -translate-y-1/2`}></div>
      </div>

      {/* Navigation */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="fixed top-6 left-6 flex items-center text-gray-600 hover:text-ayurveda-brahmi font-medium transition-colors z-50"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </button>
      )}

      {/* Left Branding Panel */}
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
            Welcome to the Healing Center
          </p>
          <p className="text-xl text-gray-500/80 font-body italic">
            Welcome to the journey of balanced healing
          </p>

          <div className="mt-12 grid grid-cols-5 gap-6">
            <img src="/treatments/vamana.svg" alt="Treatment 1" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/virechana.svg" alt="Treatment 2" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/basti.svg" alt="Treatment 3" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/nasya.svg" alt="Treatment 4" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/treatments/raktamoksha.svg" alt="Treatment 5" className="w-12 h-12 opacity-60 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-2 relative">
        <div className="w-full max-w-md bg-[#FDF5E6]/90 backdrop-blur-lg rounded-2xl shadow-[0_8px_32px_rgba(139,69,19,0.15)] p-4 border border-[#DEB887]/30 hover:shadow-[0_8px_32px_rgba(139,69,19,0.25)] transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-br from-[#8B4513]/30 via-[#CD853F]/20 to-[#DEB887]/30 -z-10"></div>

          <h2 className="text-lg font-display text-dosha-kapha mb-3 text-center">
            Create Your Account
          </h2>

          <div className="flex justify-center mb-3">
            <div className="flex bg-ayurveda-chandana/10 rounded-full p-1 shadow-inner border border-ayurveda-chandana/20">
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 text-sm ${
                  formData.userType === "patient"
                    ? "bg-gradient-to-r from-ayurveda-brahmi to-ayurveda-neem text-white shadow-md scale-105"
                    : "text-ayurveda-brahmi hover:bg-ayurveda-brahmi/10"
                }`}
                onClick={() => setFormData({ ...formData, userType: "patient" })}
              >
                Patient
              </button>
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full font-medium transition-all duration-200 text-sm ${
                  formData.userType === "practitioner"
                    ? "bg-gradient-to-r from-ayurveda-kumkum to-ayurveda-haldi text-white shadow-md scale-105"
                    : "text-ayurveda-kumkum hover:bg-ayurveda-kumkum/10"
                }`}
                onClick={() => setFormData({ ...formData, userType: "practitioner" })}
              >
                Practitioner
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-gray-700">Full Name</label>
              <div className="relative group">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-hover:text-ayurveda-kumkum transition-colors" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl focus:border-ayurveda-kumkum text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-hover:text-ayurveda-kumkum transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl focus:border-ayurveda-kumkum text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-hover:text-ayurveda-kumkum transition-colors" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-3 py-2 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl focus:border-ayurveda-kumkum text-sm"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Password</label>
              <div className="relative group">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-hover:text-ayurveda-kumkum transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-9 py-2 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl focus:border-ayurveda-kumkum text-sm"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-hover:text-ayurveda-kumkum transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-9 py-2 bg-white/70 backdrop-blur-md border-2 border-gray-100 rounded-xl focus:border-ayurveda-kumkum text-sm"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            <button
              onClick={handleSignup}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#8B4513] to-[#CD853F] text-[#FDF5E6] px-6 py-3 rounded-xl font-medium group shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#CD853F] to-[#DEB887] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <span className="text-base font-display block">Sign Up Now</span>
                <span className="text-xs opacity-90">Create Your Account</span>
              </div>
            </button>

            {/* Visual Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#8B4513]/30 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-[#FDF5E6] px-4 py-1 rounded-full text-xs text-[#8B4513]/70 font-medium">
                  Purification
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center px-4 py-3 bg-white/70 border-2 border-gray-100 rounded-xl hover:shadow-lg transition-all text-sm"
              >
                <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" className="w-4 h-4 mr-2" />
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center px-4 py-3 bg-white/70 border-2 border-gray-100 rounded-xl hover:shadow-lg transition-all text-sm"
              >
                <span className="w-4 h-4 mr-2 bg-[#1877f2] rounded text-white text-[10px] flex items-center justify-center font-bold">f</span>
                <span>Facebook</span>
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-sm">
                <span className="text-gray-600">Already have an account?</span>
                <button
                  onClick={onSwitchToLogin}
                  className="text-ayurveda-kumkum font-semibold hover:underline"
                >
                  Log in here
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
        <div className="text-xs text-gray-500/70 backdrop-blur-sm bg-white/20 py-1.5 mx-auto inline-block px-4 rounded-full pointer-events-auto">
          By signing up, you agree to our{" "}
          <a href="#" className="text-ayurveda-kumkum font-medium">Terms of Service</a> and{" "}
          <a href="#" className="text-ayurveda-kumkum font-medium">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;