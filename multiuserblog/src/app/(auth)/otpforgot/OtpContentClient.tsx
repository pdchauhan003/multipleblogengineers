'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Lock, ShieldCheck } from "lucide-react";
import api from "@/api/axios";

type Step = "otp" | "reset" | "success";

interface Props {
  email?: string;
  initialError?: string;
  initialMessage?: string;
}

export default function OtpContentClient({ email, initialError, initialMessage }: Props) {
  const [step, setStep] = useState<Step>("otp");
  const [otp, setOtp] = useState('');

  // Password Reset fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [message, setMessage] = useState(initialMessage || '');

  // Verify OTP
  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        setStep("reset");
      } else {
        setError(res.data.message || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  // Handle password change
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email, newPassword });
      if (res.data.success) {
        setStep("success");
      } else {
        setError(res.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  // Resend OTP
  const resendOtp = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/send-mail', { email });
      if (res.data.success) {
        setMessage(res.data.message || 'OTP resent successfully');
      } else {
        setError(res.data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">

        {/* Back Link */}
        {step !== "success" && (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={15} />
            Back to login
          </Link>
        )}

        {/* ── STEP 1: Verify OTP ── */}
        {step === "otp" && (
          <div>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <KeyRound className="text-indigo-400" size={22} />
              </div>
              <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
              <p className="text-gray-400 mt-1 text-sm">
                Enter the OTP sent to <span className="text-indigo-400 font-medium">{email}</span>
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center tracking-widest text-lg bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm text-center">
                  {message}
                </div>
              )}

              <button
                onClick={verifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-600/20"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Didn&apos;t receive OTP?{" "}
                <button
                  type="button"
                  onClick={resendLoading ? undefined : resendOtp}
                  className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline focus:outline-none"
                >
                  {resendLoading ? "Sending..." : "Resend"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Enter New Password ── */}
        {step === "reset" && (
          <div>
            <div className="mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                <Lock className="text-indigo-400" size={22} />
              </div>
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-gray-400 mt-1 text-sm">
                Choose a strong new password for your account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="New password"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-600/20"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 3: Success Screen ── */}
        {step === "success" && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="text-green-400" size={30} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-gray-400 text-sm mb-8">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] transition text-white font-medium py-3 px-8 rounded-lg shadow-lg shadow-indigo-600/20"
            >
              Back to Sign In
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
