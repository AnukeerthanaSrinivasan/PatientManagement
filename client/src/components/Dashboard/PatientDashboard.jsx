import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, MapPin, Phone, Calendar, ArrowRight, 
  CheckCircle, AlertCircle, Loader2 
} from "lucide-react";
import NotificationsPanel from "../NotificationsPanel";

const cornerMandala = "/patterns/corner-mandala.svg";
const lotusBackground = "/patterns/lotus-bg.svg";
const mandalaBackground = "/patterns/mandala-bg.svg";
const herbsBackground = "/patterns/herbs-bg.svg";

const PatientDashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/dashboard/patient/${user._id}`);
        setData(response.data);
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?._id]);

  const formatDate = (dateString) => {
    if (!dateString) return "No Upcoming Session";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FDF7E9] flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 text-amber-600 animate-spin mb-2" />
      <p className="text-amber-900 font-medium italic">Aligning your energies...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#FDF7E9] flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-md border border-red-100 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF7E9] w-full pb-10">
      <img src={cornerMandala} alt="" className="fixed top-0 right-0 w-32 h-32 opacity-10 pointer-events-none" />
      <img src={lotusBackground} alt="" className="fixed bottom-0 left-0 w-64 h-64 opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-6">
        
        {/* 1. Welcome Card - Progress now strictly from data.progress */}
        <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-amber-900">Namaste, {user?.name}</h2>
              <p className="text-amber-700 mt-2 max-w-md">
                {data?.customMessage || "Welcome back to your healing journey."}
              </p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-amber-200 text-center min-w-[140px]">
              <span className="text-4xl font-black text-amber-600">{data?.progress || 0}%</span>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-1">Overall Progress</p>
            </div>
          </div>
        </div>

        {/* 2. Practitioner Status */}
        {!data?.hasPractitioner ? (
          <div className="bg-white border-2 border-dashed border-amber-300 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full"><User className="text-amber-600" /></div>
              <div>
                <h3 className="font-bold text-amber-900">No Practitioner Assigned</h3>
                <p className="text-sm text-amber-700">Find a specialist to begin your tailored therapy.</p>
              </div>
            </div>
            <button onClick={() => window.location.href = '/practitioners'} className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 flex items-center gap-2">
              Find Practitioner <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-full"><CheckCircle className="text-emerald-600" /></div>
              <div>
                <h3 className="font-bold text-emerald-900">Dr. {data.assignedPractitioner?.name}</h3>
                <p className="text-sm text-emerald-700 flex items-center gap-1">
                  <MapPin size={14} /> {data.assignedPractitioner?.practiceLocation?.city || "Location not set"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Next Session", val: formatDate(data?.nextSession), icon: <Calendar className="w-4 h-4" /> },
            { label: "Completed", val: `${data?.completed || 0}/${data?.total || 0}`, icon: <CheckCircle className="w-4 h-4" /> },
            { label: "Wellness Score", val: `${data?.wellnessScore || 0}/10`, icon: <User className="w-4 h-4" /> },
            { label: "Unread Updates", val: data?.notifications?.filter(n => !n.read).length || 0, icon: <Phone className="w-4 h-4" /> }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-amber-100">
              <div className="flex items-center gap-2 text-amber-600 mb-1">{stat.icon} <span className="text-xs font-bold uppercase">{stat.label}</span></div>
              <p className="text-lg font-bold text-amber-900">{stat.val}</p>
            </div>
          ))}
        </div>

        {/* 4. Journey & Doshas - Cleaned of all "Placeholder" text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Milestones</h3>
            <div className="relative h-4 bg-amber-50 rounded-full overflow-hidden mb-6">
              <div className="absolute top-0 left-0 h-full bg-amber-400 transition-all duration-1000" style={{ width: `${data?.progress || 0}%` }} />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-lg">
                <span className="text-sm font-medium text-amber-800">Current Phase</span>
                <span className="text-sm font-bold text-amber-900">{data?.currentPhase || "Pending Evaluation"}</span>
              </div>
              <div className="flex justify-between items-center p-3 border border-dashed border-amber-200 rounded-lg">
                <span className="text-sm font-medium text-amber-800">Next Milestone</span>
                <span className="text-sm font-bold text-amber-600">{data?.nextMilestone || "Awaiting Update"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Current Dosha Balance</h3>
            <div className="space-y-5">
              {data?.doshas && Object.keys(data.doshas).length > 0 ? Object.entries(data.doshas).map(([name, value]) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-bold text-amber-800">{name}</span>
                    <span className="text-amber-600 font-bold">{value}%</span>
                  </div>
                  <div className="h-2 bg-amber-50 rounded-full">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${value}%` }} />
                  </div>
                </div>
              )) : (
                <div className="text-center py-6">
                  <p className="text-sm text-amber-600 italic">No Dosha data available.</p>
                  <p className="text-xs text-amber-500">Complete your initial assessment to see your balance.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <NotificationsPanel userEmail={user?.email} currentUserId={user?._id} userType={user?.userType} />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;