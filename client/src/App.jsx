import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Dashboard from "./components/Dashboard";
import RoastSettings from "./components/RoastSettings";
import Auth from "./components/Auth";
import Footer from "./components/Footer";

function App() {
  const [currentView, setCurrentView] = useState("landing");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("zensprint_user"));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("zensprint_token"));

  // Handle unauthorized event
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setCurrentView("landing");
    };

    window.addEventListener("zensprint-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("zensprint-unauthorized", handleUnauthorized);
  }, []);

  const handleAuthSuccess = (authUser, authToken) => {
    setUser(authUser);
    setToken(authToken);
    // Continue to dashboard after login
    if (currentView === "landing") {
      setCurrentView("dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("zensprint_token");
    localStorage.removeItem("zensprint_user");
    setUser(null);
    setToken(null);
    setCurrentView("landing");
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar 
        currentView={currentView} 
        setCurrentView={handleNavigate} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <div className="flex-grow">
        {currentView === "landing" && (
          <Hero 
            onGetStarted={() => handleNavigate("dashboard")} 
            onSelectFeature={(view) => handleNavigate(view)} 
          />
        )}
        
        {user ? (
          <>
            <div style={{ display: currentView === "dashboard" ? "block" : "none" }}>
              <Dashboard />
            </div>
            <div style={{ display: currentView === "settings" ? "block" : "none" }}>
              <RoastSettings />
            </div>
          </>
        ) : (
          currentView !== "landing" && (
            <Auth onAuthSuccess={handleAuthSuccess} onClose={() => setCurrentView("landing")} />
          )
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default App;