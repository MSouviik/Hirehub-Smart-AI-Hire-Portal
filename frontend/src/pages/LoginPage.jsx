import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessagesSquare,
  BriefcaseBusiness,
} from "lucide-react";
import { Link } from "react-router-dom";
import GridBoxPattern from "../components/GridBoxPattern";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isHR: false,
  });
  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    const validateEmailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim("")) return toast.error("Email is mandatory!");
    if (!validateEmailRegex.test(formData.email))
      return toast.error("Invalid Email Address.");
    if (!formData.password) return toast.error("Password is mandatory!");
    if (formData.password.length < 8)
      return toast.error("Password must contain at least 8 characters.");

    return true; //incase all the fields are valid
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidForm = validateForm();
    if (isValidForm === true) login(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side form impl*/}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <BriefcaseBusiness className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
              <p className="text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>

                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">
                  Are you part of HR? Tap the box to proceed to HR login.
                </span>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={formData.isHR}
                  onChange={(e) =>
                    setFormData({ ...formData, isHR: e.target.checked })
                  }
                />
              </label>
            </div>

            <button className="btn btn-primary w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account ?{" "}
              <Link to="/signup" className="link link-primary">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* left side form impl*/}
      <GridBoxPattern
        title="Join Our Talent Network"
        subtitle="Discover opportunities that match your skills and grow your career."
      />
    </div>
  );
};
export default LoginPage;
