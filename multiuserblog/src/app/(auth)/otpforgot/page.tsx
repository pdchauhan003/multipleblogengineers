import { Suspense } from 'react';
import api from '@/api/axios';
import OtpContentClient from './OtpContentClient';

// Runs on the server — sends the initial OTP email before the page is rendered
async function sendInitialOtp(email: string): Promise<{ error?: string; message?: string }> {
  try {
    const res = await api.post('/auth/send-mail', { email });
    return { message: res.data?.message || 'OTP sent to your email' };
  } catch (err: any) {
    return { error: err.response?.data?.message || 'Error sending OTP email' };
  }
}

export default async function OtpForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  let initialError: string | undefined;
  let initialMessage: string | undefined;

  if (!email) {
    initialError = 'No email address provided. Please return to login.';
  } else {
    const result = await sendInitialOtp(email);
    initialError = result.error;
    initialMessage = result.message;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        </div>
      }
    >
      <OtpContentClient
        email={email}
        initialError={initialError}
        initialMessage={initialMessage}
      />
    </Suspense>
  );
}
