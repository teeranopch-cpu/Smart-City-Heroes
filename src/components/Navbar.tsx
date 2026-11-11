import React from 'react';
import { 
  Building2, 
  User, 
  LogOut, 
  ShieldCheck, 
  Award, 
  FileText, 
  Radio, 
  Gamepad2,
  Lock
} from 'lucide-react';
import { UserAccount, GameRoom } from '../types';

interface NavbarProps {
  currentUser: UserAccount | null;
  isAdmin: boolean;
  activeRoom: GameRoom | null;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onLogout: () => void;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  activeRoom,
  currentTab,
  onSelectTab,
  onOpenAuth,
  onLogout,
  onLogoutAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A192F]/95 backdrop-blur-md border-b border-[#233554] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div 
            onClick={() => onSelectTab('game')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#112240] border border-[#3B82F6]/40 flex items-center justify-center shadow-md shadow-[#0A192F]">
              <Building2 className="w-6 h-6 text-[#93C5FD]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg md:text-xl tracking-tight text-white group-hover:text-blue-200 transition-colors">
                  SMART INTEGRITY CITY
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-medium bg-[#1E3A8A]/50 text-blue-200 border border-blue-500/30 rounded-full">
                  NFC Enabled
                </span>
              </div>
              <p className="text-xs text-slate-300 font-light truncate max-w-xs sm:max-w-md">
                บอร์ดเกมการศึกษาพลิกโฉมเมืองสุจริตอัจฉริยะ (คุณลักษณะ 5 ประการ)
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('game')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'game' 
                  ? 'bg-[#1E3A8A] text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-[#112240]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              บอร์ดเกม & กระดานควบคุม
            </button>

            <button
              onClick={() => onSelectTab('prepost')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'prepost' 
                  ? 'bg-[#1E3A8A] text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-[#112240]'
              }`}
            >
              <FileText className="w-4 h-4" />
              แบบทดสอบ Pre / Post
            </button>

            <button
              onClick={() => onSelectTab('nfc_hub')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'nfc_hub' 
                  ? 'bg-[#1E3A8A] text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-[#112240]'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              แตะการ์ด NFC / ภารกิจ
            </button>

            <button
              onClick={() => onSelectTab('certificate')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'certificate' 
                  ? 'bg-[#1E3A8A] text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-[#112240]'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              เกียรติบัตร
            </button>

            <button
              onClick={() => {
                if (isAdmin) {
                  onSelectTab('admin');
                } else {
                  onOpenAuth('admin');
                }
              }}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentTab === 'admin' 
                  ? 'bg-amber-800/60 text-amber-100 border border-amber-600/50' 
                  : 'text-slate-300 hover:text-amber-200 hover:bg-[#112240]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {isAdmin ? 'แผงควบคุมครู (Admin)' : 'เข้าสู่ระบบครู'}
            </button>
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="flex items-center gap-3">
            {activeRoom && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#112240] border border-[#233554] rounded-lg text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">ห้อง:</span>
                <span className="font-semibold text-white tracking-wider">{activeRoom.roomCode}</span>
                <span className="text-slate-400">|</span>
                <span className="text-amber-300 font-medium">เมือง: {activeRoom.cityIntegrity} แต้ม</span>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-semibold text-white">
                    {currentUser.prefix} {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                    <span>{currentUser.status}</span>
                    <span>•</span>
                    <span className="text-blue-300">{currentUser.mediaKitCode}</span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบผู้ใช้"
                  className="p-2 rounded-lg bg-[#112240] hover:bg-[#1f3a60] border border-[#233554] text-slate-300 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#112240] hover:bg-[#1E3A8A] border border-[#233554] text-white transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                >
                  สมัครสมาชิก
                </button>
              </div>
            )}

            {isAdmin && (
              <button
                onClick={onLogoutAdmin}
                title="ออกจากระบบครู (Admin)"
                className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/50 text-amber-200 transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-[#233554] text-xs">
          <button
            onClick={() => onSelectTab('game')}
            className={`flex flex-col items-center gap-1 ${currentTab === 'game' ? 'text-blue-400 font-medium' : 'text-slate-400'}`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>กระดาน</span>
          </button>
          <button
            onClick={() => onSelectTab('prepost')}
            className={`flex flex-col items-center gap-1 ${currentTab === 'prepost' ? 'text-blue-400 font-medium' : 'text-slate-400'}`}
          >
            <FileText className="w-4 h-4" />
            <span>ข้อสอบ</span>
          </button>
          <button
            onClick={() => onSelectTab('nfc_hub')}
            className={`flex flex-col items-center gap-1 ${currentTab === 'nfc_hub' ? 'text-blue-400 font-medium' : 'text-slate-400'}`}
          >
            <Radio className="w-4 h-4" />
            <span>NFC/ภารกิจ</span>
          </button>
          <button
            onClick={() => onSelectTab('certificate')}
            className={`flex flex-col items-center gap-1 ${currentTab === 'certificate' ? 'text-blue-400 font-medium' : 'text-slate-400'}`}
          >
            <Award className="w-4 h-4" />
            <span>เกียรติบัตร</span>
          </button>
          <button
            onClick={() => {
              if (isAdmin) onSelectTab('admin');
              else onOpenAuth('admin');
            }}
            className={`flex flex-col items-center gap-1 ${currentTab === 'admin' ? 'text-amber-400 font-medium' : 'text-slate-400'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ครู</span>
          </button>
        </div>

      </div>
    </header>
  );
};
