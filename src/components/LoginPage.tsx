import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { UserAccount } from '../types';
import { StorageService } from '../storage';

interface LoginPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  onAdminLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onAdminLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Registration form state
  const [prefix, setPrefix] = useState('นาย');
  const [customPrefix, setCustomPrefix] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('นักเรียน');
  const [customStatus, setCustomStatus] = useState('');

  // Login form state
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const finalPrefix = prefix === 'อื่นๆ' ? customPrefix.trim() : prefix;
    const finalStatus = status === 'อื่นๆ' ? customStatus.trim() : status;

    if (!finalPrefix) {
      setErrorMsg('กรุณาระบุคำนำหน้า');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (password.length < 5) {
      setErrorMsg('รหัสผ่านต้องมีอย่างน้อย 5 ตัวอักษร');
      return;
    }
    if (!finalStatus) {
      setErrorMsg('กรุณาเลือกหรือระบุสถานะ');
      return;
    }

    const newUser: UserAccount = {
      id: 'USER-' + Date.now().toString(),
      prefix: finalPrefix,
      fullName: fullName.trim(),
      password: password,
      status: finalStatus,
      mediaKitCode: '', // Will be selected upon creating/joining game room
      createdAt: new Date().toISOString(),
      behaviorImages: []
    };

    const res = StorageService.saveUser(newUser);
    if (res.success) {
      setSuccessMsg('สมัครสมาชิกสำเร็จเรียบร้อย! กำลังนำท่านเข้าสู่ระบบ...');
      StorageService.setCurrentUser(newUser);
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedName = loginName.trim();
    if (!trimmedName || !loginPass) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้งาน และรหัสผ่าน');
      return;
    }

    // Admin Login Check (integrated directly without separate tab or exposed hints)
    if (trimmedName === '00000' && loginPass === '00000') {
      StorageService.setAdminLoggedIn(true);
      setSuccessMsg('เข้าสู่ระบบผู้ดูแลระบบ (ครู) สำเร็จ');
      setTimeout(() => {
        onAdminLoginSuccess();
      }, 500);
      return;
    }

    // Regular Player Login Check
    const found = StorageService.findUserByNameAndPass(trimmedName, loginPass);
    if (found) {
      StorageService.setCurrentUser(found);
      setSuccessMsg(`ยินดีต้อนรับ ${found.prefix} ${found.fullName}`);
      setTimeout(() => {
        onLoginSuccess(found);
      }, 500);
    } else {
      setErrorMsg('ไม่พบบัญชีผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง (กรุณาตรวจสอบชื่อ หรือกดสมัครสมาชิก)');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Header Branding: Centered, Large Logo, No Pill Badge */}
      <div className="max-w-xl mx-auto w-full flex flex-col items-center justify-center text-center pt-2 pb-6">
        
        {/* Large Centered Logo */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#1E3A8A] to-[#112240] border-2 border-blue-400/40 shadow-2xl flex items-center justify-center mb-5 ring-4 ring-blue-500/10">
          <Building2 className="w-14 h-14 sm:w-16 sm:h-16 text-blue-200" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          Smart Integrity City
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-light mt-1.5 max-w-md mx-auto">
          บอร์ดเกมการศึกษาพลิกโฉมเมืองสุจริตอัจฉริยะ เพื่อเสริมสร้างคุณลักษณะ 5 ประการของโรงเรียนสุจริต
        </p>
      </div>

      {/* Main Login / Register Card */}
      <div className="max-w-lg mx-auto w-full bg-[#112240] border border-[#233554] rounded-3xl shadow-2xl p-6 sm:p-8">
        
        {/* Only 2 Tabs: Login & Register (No separate Admin tab) */}
        <div className="flex border-b border-[#233554] mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'login'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'register'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1) LOGIN FORM (Handles both regular user and admin seamlessly) */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ชื่อผู้ใช้งาน หรือ ชื่อ - นามสกุล
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้งาน หรือ ชื่อ-นามสกุล"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-[#0A192F] transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-3 border-t border-[#233554] text-xs text-slate-400">
              ยังไม่มีบัญชีผู้ใช้งาน?{' '}
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                className="text-blue-400 hover:underline font-semibold"
              >
                สมัครสมาชิกที่นี่
              </button>
            </div>
          </form>
        )}

        {/* 2) USER REGISTRATION FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fade-in max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  คำนำหน้า *
                </label>
                <select
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="นาย">นาย</option>
                  <option value="นาง">นาง</option>
                  <option value="นางสาว">นางสาว</option>
                  <option value="ด.ช.">ด.ช.</option>
                  <option value="ด.ญ.">ด.ญ.</option>
                  <option value="อาจารย์">อาจารย์</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
                {prefix === 'อื่นๆ' && (
                  <input
                    type="text"
                    placeholder="ระบุคำนำหน้า"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                    className="mt-1.5 w-full px-3 py-1.5 bg-[#0A192F] border border-[#233554] rounded-lg text-xs text-white"
                  />
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ชื่อ - นามสกุล *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น มานี มีวินัย"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                รหัสผ่าน (อย่างน้อย 5 ตัวอักษร) *
              </label>
              <input
                type="password"
                required
                minLength={5}
                placeholder="กรอกรหัสผ่าน 5 ตัวอักษรขึ้นไป"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                สถานะผู้ใช้งาน * (ไม่มีผลต่อการเข้าสู่ระบบแอดมิน)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="นักเรียน">นักเรียน</option>
                <option value="ครู">ครู</option>
                <option value="ผู้บริหาร">ผู้บริหาร</option>
                <option value="บุคคลทั่วไป">บุคคลทั่วไป</option>
                <option value="อื่นๆ">อื่นๆ (โปรดระบุ)</option>
              </select>
              {status === 'อื่นๆ' && (
                <input
                  type="text"
                  placeholder="ระบุสถานะ เช่น ผู้สังเกตการณ์"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  className="mt-1.5 w-full px-3 py-1.5 bg-[#0A192F] border border-[#233554] rounded-lg text-xs text-white"
                />
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-[#0A192F] transition-all text-sm mt-3"
            >
              ยืนยันการสมัครสมาชิก
            </button>
          </form>
        )}

      </div>

      {/* Footer Info */}
      <div className="max-w-xl mx-auto w-full text-center text-xs text-slate-400 pt-6">
        <span>โรงเรียนสุจริต • คุณลักษณะ 5 ประการ • ฐานข้อมูล LocalStorage</span>
      </div>

    </div>
  );
};
