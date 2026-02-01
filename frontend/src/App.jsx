import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import CandidateOnboardingForm from "./pages/CandidateOnboardingForm";
import HROnboardingForm from "./pages/HROnboardingForm";
import { useAuthStore } from "./store/useAuthStore";

import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuthentication, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  console.log(authUser);

  if (isCheckingAuth && !authUser)
    //showing busy indicator
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  // If user is authenticated but profile is not completed, redirect to onboarding
  if (authUser && !authUser.profileCompleted) {
    return (
      <div className="overflow-auto" data-theme={theme}>
        <Routes>
          <Route
            path="/onboarding-candidate"
            element={<CandidateOnboardingForm />}
          />
          <Route path="/onboarding-hr" element={<HROnboardingForm />} />
          <Route
            path="*"
            element={
              authUser.isHR ? (
                <Navigate to="/onboarding-hr" />
              ) : (
                <Navigate to="/onboarding-candidate" />
              )
            }
          />
        </Routes>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="overflow-auto" data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
