import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios-config";

const OTPVerificationDialog = ({
  isOpen,
  email,
  fullName,
  onSuccess,
  onCancel,
}) => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(100);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
      });

      toast.success(response.data.message);
      onSuccess(response.data.user);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to verify OTP"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await axiosInstance.post("/auth/resend-otp", {
        email,
      });

      toast.success(response.data.message);
      setOtp("");
      setTimeLeft(100);
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to resend OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  const isExpired = timeLeft <= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-base-content">Verify Email</h2>
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-base-content/70 mb-2">
            We've sent a 6-digit OTP to:
          </p>
          <p className="font-semibold text-base-content break-all">{email}</p>
          <p className="text-sm text-base-content/60 mt-2">
            Hi {fullName}, enter the OTP to complete your registration
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="label">
            <span className="label-text font-semibold">Enter OTP</span>
          </label>
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength="6"
            className="input input-bordered w-full text-center text-2xl tracking-widest font-mono"
            disabled={isExpired}
          />
        </div>

        {/* Timer */}
        <div className="mb-6 text-center">
          {isExpired ? (
            <p className="text-error font-semibold">⏱️ OTP Expired</p>
          ) : (
            <p
              className={`font-semibold ${
                timeLeft <= 30 ? "text-warning" : "text-info"
              }`}
            >
              ⏱️ Expires in {timeLeft} seconds
            </p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerifyOTP}
          disabled={isVerifying || isExpired || !otp.trim()}
          className="btn btn-primary w-full mb-3"
        >
          {isVerifying ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend OTP */}
        <div className="divider my-3">or</div>

        <button
          onClick={handleResendOTP}
          disabled={isResending || !isExpired}
          className="btn btn-outline w-full"
        >
          {isResending ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Sending...
            </>
          ) : isExpired ? (
            "Resend OTP"
          ) : (
            "Resend OTP (expires soon)"
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-info/10 border border-info rounded-lg">
          <p className="text-xs text-info font-semibold">🔒 Security Notice</p>
          <p className="text-xs text-info/80 mt-1">
            Never share your OTP with anyone. HireHub support will never ask for
            it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationDialog;
