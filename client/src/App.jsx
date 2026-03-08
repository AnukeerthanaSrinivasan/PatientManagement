import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import PatientDashboard from "./components/Dashboard/PatientDashboard";
import PractitionerDashboard from "./components/Dashboard/PractitionerDashboard";
import TherapyScheduling from "./components/TherapyScheduling";
import Notifications from "./components/Notifications";
import AdminPanel from './components/Admin/AdminPanel';
import Progress from "./components/Progress";
import PractitionerProgress from "./components/PractitionerProgress";
import Profile from "./components/Profile";
import PractitionerSearch from "./components/PractitionerSearch";
import Footer from "./components/Footer";
import AuthContainer from "./components/auth/AuthContainer";
import LandingPage from "./components/LandingPage";
import PractitionerHomePage from "./components/PractitionerHomePage";
import { useAppData } from "./hooks/useAppData";
import ChatbotWidget from "./components/Dashboard/ChatbotWidget"; // ✅ import chatbot
import { ToastProvider } from "./contexts/ToastContext.jsx";
import ToastContainer from "./components/Toast";
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [isMenuSticky, setIsMenuSticky] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showLanding, setShowLanding] = useState(true);

  const {
    notifications,
    setNotifications,
    therapySessions,
    patientProgress,
    feedbackData,
  } = useAppData();

  // ✅ Called after login/signup success
  const handleAuthSuccess = async (authData) => {
    // Determine token: prefer explicit token on authData, otherwise use what's in localStorage
    const tokenFromArg = authData?.token;
    const storedToken = localStorage.getItem('token');
    const tokenToUse = tokenFromArg || storedToken;

    if (tokenToUse) {
      localStorage.setItem('token', tokenToUse);
    }

    try {
      // Fetch full user profile using authFetch which will attach token from localStorage
      // import dynamically to avoid top-level changes
      // eslint-disable-next-line no-undef
      const authFetch = (await import('./utils/apiClient')).default;
      const response = await authFetch('http://localhost:5000/api/profile', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const fullUser = await response.json();
        setUser(fullUser);
        setIsAuthenticated(true);
        setShowLanding(false);
        console.log('App: user authenticated and profile fetched', fullUser);
      } else {
        // Fallback to basic data if profile fetch fails
        setUser({
          _id: authData._id || authData?._id || null,
          name: authData.name || authData?.name || null,
          email: authData.email || authData?.email || null,
          userType: authData.userType || authData?.userType || null,
        });
        setIsAuthenticated(true);
        setShowLanding(false);
      }
    } catch (error) {
      console.error('Error fetching full profile after login:', error);
      // Fallback to basic data on error
      setUser({
        _id: authData._id || authData?._id || null,
        name: authData.name || authData?.name || null,
        email: authData.email || authData?.email || null,
        userType: authData.userType || authData?.userType || null,
      });
      setIsAuthenticated(true);
      setShowLanding(false);
    }
  };
useEffect(() => {
  if (isAuthenticated && user?.userType === "practitioner" && !user.assignedPatients) {
    axios.get(`http://localhost:5000/api/dashboard/practitioner/${user._id}`)
      .then(res => {
        setUser(prev => ({ ...prev, assignedPatients: res.data.assignedPatients }));
      })
      .catch(err => console.error("Syncing patients failed", err));
  }
}, [isAuthenticated, user?._id]);
  // ✅ Handle Google OAuth success and tab navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const auth = urlParams.get('auth');
    const tab = urlParams.get('tab');
    
    if (token && userParam && auth === 'google' && !isAuthenticated) {
      try {
        // Decode user data
        const userData = JSON.parse(decodeURIComponent(userParam));
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Authenticate the user
        handleAuthSuccess(userData);
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Google OAuth success error:', error);
      }
    }
    
    // Handle tab navigation
    if (tab && isAuthenticated) {
      setActiveTab(tab);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [isAuthenticated]);

  // ✅ Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab("dashboard");
    setShowLanding(true);
  };

  // ✅ When "Get Started" is clicked on landing page
  const handleGetStarted = () => {
    setShowLanding(false);
  };

  // ✅ Utility: Get current role
  const getUserRole = () => {
    return user?.userType || "patient";
  };

  // ✅ Render tab contents
  const renderActiveTab = () => {
    const userRole = getUserRole();

    switch (activeTab) {
      case "dashboard":
        if (userRole === "practitioner") {
          return <PractitionerDashboard user={user} />;
        }
        return (
          <PatientDashboard
            patientProgress={patientProgress}
            notifications={notifications}
            user={user}
          />
        );

      // Inside App.jsx - Add this useEffect to sync practitioner data


// Inside renderActiveTab()
case "scheduling":
  return (
    <TherapyScheduling
      userRole={getUserRole()}
      user={user}
      therapySessions={therapySessions}
      assignedPatients={user?.assignedPatients || []} // Fixes empty dropdown
      isAuthenticated={isAuthenticated}              // Fixes ReferenceError
    />
  );

      case "notifications":
        return (
          <Notifications
            notifications={notifications}
            setNotifications={setNotifications}
            currentUserId={user?._id}
            currentUserEmail={user?.email}
            userType={user?.userType}
          />
        );

      case "progress":
        if (userRole === "practitioner") {
          return <PractitionerProgress key={`progress-${activeTab}`} user={user} />;
        }
        return <Progress user={user} />;

      case "profile":
        return <Profile user={user} />;

      case "practitioner-search":
        return <PractitionerSearch user={user} onAssignmentSuccess={(practitioner) => {
          // Update user state with assigned practitioner
          setUser(prev => ({ ...prev, assignedPractitioner: practitioner._id }));
        }} />;

      case 'admin-whatsapp':
      case 'admin-verification':
        return <AdminPanel user={user} />;

      default:
        if (userRole === "practitioner") {
          return <PractitionerDashboard user={user} />;
        }
        return (
          <PatientDashboard
            patientProgress={patientProgress}
            notifications={notifications}
            user={user}
          />
        );
    }
  };

  // Wrap whole UI in ToastProvider so landing and auth pages can use useToast()
  // Poll inbox for unread messages and push into notifications
  const seenInboxIdsRef = useRef(new Set());
  useEffect(() => {
    if (!isAuthenticated || !user?._id || !setNotifications) return;

    let stopped = false;

    const fetchInbox = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/messages/inbox', {
          params: { userId: user._id, unreadOnly: true }
        });
        const msgs = res.data || [];
        // filter new
        const newMsgs = msgs.filter(m => !seenInboxIdsRef.current.has(m._id));
        if (newMsgs.length) {
          // push into notifications
          setNotifications((prev) => {
            const next = [...(prev || [])];
            newMsgs.forEach(m => {
              seenInboxIdsRef.current.add(m._id);
              next.unshift({
                id: m._id,
                type: 'chat',
                title: `Message from ${m.from?.name || m.from?.email}`,
                message: m.text,
                time: m.createdAt || new Date().toISOString(),
              });
            });
            return next;
          });
          console.log('App: inbox added', newMsgs.map(m=>m._id));
        }
      } catch (err) {
        console.error('App: inbox fetch error', err);
      }
    };

    // initial fetch and interval
    fetchInbox();
    const iv = setInterval(() => { if (!stopped) fetchInbox(); }, 4000);
    return () => { stopped = true; clearInterval(iv); };
  }, [isAuthenticated, user?._id, setNotifications]);
  return (
    <ToastProvider>
      {/* Render Landing, Auth or Main app depending on state */}
      {showLanding ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : !isAuthenticated ? (
        <AuthContainer
          onAuthSuccess={handleAuthSuccess}
          onBackToLanding={() => setShowLanding(true)}
        />
      ) : (
  <ErrorBoundary>
  <div className="min-h-screen bg-[#FDF7E9]">
          <Header
            userRole={getUserRole()}
            notifications={notifications}
            setNotifications={setNotifications}
            setActiveTab={setActiveTab}
            user={user}
            onLogout={handleLogout}
          />

          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} userType={user?.userType} />

          <div className="w-full bg-[#FDF7E9]">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {renderActiveTab()}
            </main>
          </div>

          {/* ✅ Floating chatbot widget for logged-in users except practitioners */}
          {isAuthenticated && user?.userType !== "practitioner" && (
            <div className="fixed bottom-6 right-6 z-50">
              <ChatbotWidget user={user} />
            </div>
          )}

          <Footer />

  </div>
  </ErrorBoundary>
      )}

      {/* Toast container rendered once inside provider so toasts are visible on landing/auth */}
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;
