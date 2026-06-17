import React, { useState, useEffect } from 'react';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { Mail, Lock, Phone, KeyRound, LogIn } from 'lucide-react';
import logo from '../assets/logo.svg';

const auth = getAuth();

const Login = () => {
  const [activeTab, setActiveTab] = useState('staff');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const formattedPhone = "+91" + mobile;
    try {
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      alert("OTP Sent!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleParentLogin = async (e) => {
    e.preventDefault();
    try {
      await confirmationResult.confirm(otp);
      alert("Login Successful!");
      window.location.href = "/parent-dashboard"; // Ya jahan tumhara dashboard hai
    } catch (err) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 bg-gradient-to-br from-rose-500 to-rose-900">
      <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6">Era Campus</h2>
        <div id="recaptcha-container"></div>
        {activeTab === 'parent' && (
          <form onSubmit={otpSent ? handleParentLogin : handleSendOtp}>
            <input type="tel" placeholder="Mobile Number" onChange={(e) => setMobile(e.target.value)} className="w-full p-3 border rounded-xl mb-4" />
            {otpSent && <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-xl mb-4" />}
            <button type="submit" className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold">
              {otpSent ? 'Verify & Login' : 'Request OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default Login;
