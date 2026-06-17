import React, { useState, useEffect } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Mail, Lock, Phone, KeyRound, LogIn, Sparkles } from 'lucide-react';
import logo from '../assets/logo.svg';

const auth = getAuth();

const Login = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // reCAPTCHA initialize
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formattedPhone = "+91" + mobile;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err) {
      setError("OTP bhejne mein error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      window.location.href = "/parent-dashboard";
    } catch (err) {
      setError("Galat OTP! Fir se try karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-500 to-rose-900 p-4">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold text-slate-800">Era Campus</h2>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <button onClick={() => setActiveTab('staff')} className={`flex-1 py-2 rounded-lg font-semibold ${activeTab === 'staff' ? 'bg-white shadow' : ''}`}>Staff</button>
          <button onClick={() => setActiveTab('parent')} className={`flex-1 py-2 rounded-lg font-semibold ${activeTab === 'parent' ? 'bg-white shadow' : ''}`}>Parent</button>
        </div>

        {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded mb-4">{error}</div>}

        <div id="recaptcha-container"></div>

        {activeTab === 'parent' ? (
          <form onSubmit={otpSent ? handleParentLogin : handleSendOtp} className="space-y-4">
            {!otpSent ? (
              <input type="tel" maxLength="10" placeholder="Mobile Number" onChange={(e) => setMobile(e.target.value)} className="w-full p-3 border rounded-xl" required />
            ) : (
              <input type="text" maxLength="6" placeholder="Enter 6 digit OTP" onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-xl" required />
            )}
            <button type="submit" disabled={loading} className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700">
              {loading ? 'Processing...' : (otpSent ? 'Verify & Login' : 'Request OTP')}
            </button>
          </form>
        ) : (
          <p className="text-center text-slate-500">Staff Login (Email/Password logic yahan rakho)</p>
        )}
      </div>
    </div>
  );
};
export default Login;
