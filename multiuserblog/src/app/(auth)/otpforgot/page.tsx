'use client'
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/api/axios";

function OtpContent() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpSuccess, setOptSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email')

  useEffect(() => {
    const sendMail = async () => {
      try {
        await api.post('/auth/send-mail', { email })
      }
      catch (error) {
        alert('error sending mail')
      }
    }
    sendMail();
  }, []);

  // Verify OTP
  const verifyOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data.success) {
        router.push(`/reset?email=${email}`);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError('Something went wrong');
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
        setMessage(res.data.message);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError('Something went wrong');
    }
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-2">
          Verify OTP
        </h2>

        <p className="text-gray-500 text-center mb-6 text-sm">
          Enter OTP sent to <span className="font-medium">{email}</span>
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
          className="w-full text-center tracking-widest text-lg border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
        )}

        {message && (
          <p className="text-green-500 text-sm mt-2 text-center">{message}</p>
        )}

        <button
          onClick={verifyOtp}
          disabled={loading || otp.length < 6}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Didnt receive OTP?{" "}
          <span
            onClick={resendLoading ? undefined : resendOtp}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            {resendLoading ? "Sending..." : "Resend"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default function Otpforgot() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <OtpContent />
    </Suspense>
  );
}
