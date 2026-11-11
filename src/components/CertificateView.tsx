import React, { useState } from 'react';
import { 
  Printer, 
  Award, 
  Download, 
  CheckCircle, 
  ShieldCheck, 
  FileCheck,
  User,
  Sparkles
} from 'lucide-react';
import { UserAccount, CertificateConfig, GameRoom } from '../types';
import { StorageService } from '../storage';

interface CertificateViewProps {
  currentUser: UserAccount | null;
  activeRoom: GameRoom | null;
  onGoToPostTest: () => void;
  onGoToBehaviorPhotos?: () => void;
  onBackToLobby?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  currentUser,
  activeRoom,
  onGoToPostTest,
  onGoToBehaviorPhotos,
  onBackToLobby
}) => {
  const activeKitCode = activeRoom?.mediaKitCode || currentUser?.mediaKitCode;
  const [config, setConfig] = useState<CertificateConfig>(() => StorageService.getCertificateConfig(activeKitCode));
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(currentUser);
  const allUsers = StorageService.getUsers();

  const handlePrint = () => {
    window.print();
  };

  const certificateNumber = `${config.certificateNoPrefix}${selectedUser ? selectedUser.id.replace('USER-', '').slice(-6) : '889211'}`;
  const currentDateThai = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Certificate is strictly granted ONLY when 5 behavior photos are uploaded!
  const hasUploaded5Photos = Boolean(
    selectedUser?.behaviorImages && 
    selectedUser.behaviorImages.length === 5 && 
    selectedUser.behaviorImages.filter(Boolean).length === 5
  );
  const isEligible = hasUploaded5Photos;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Top Controller Bar */}
      <div className="bg-[#112240] border border-[#233554] rounded-2xl p-6 mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            ระบบออกเกียรติบัตรออนไลน์ (E-Certificate)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            เกียรติบัตรผ่านการอบรมบอร์ดเกม Smart Integrity City
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            นำชื่อ-นามสกุลไปแสดงบนเทมเพลตมาตรฐาน สามารถพิมพ์หรือบันทึกเป็นไฟล์ PDF ได้ทันที
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {allUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">เลือกผู้รับ:</span>
              <select
                value={selectedUser?.id || ''}
                onChange={(e) => {
                  const u = allUsers.find((item) => item.id === e.target.value);
                  if (u) setSelectedUser(u);
                }}
                className="px-3 py-1.5 bg-[#0A192F] border border-[#233554] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.prefix} {u.fullName} ({u.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 transition-all border border-amber-500/40"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ / บันทึก PDF (Print)
          </button>

          {onBackToLobby && (
            <button
              onClick={onBackToLobby}
              className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-semibold border border-[#233554] transition-colors"
            >
              ← กลับสู่ห้องรับรอง
            </button>
          )}
        </div>
      </div>

      {/* Eligibility Warning if not completed 5 behavior photos */}
      {!isEligible && (
        <div className="mb-6 p-5 rounded-2xl bg-amber-950/70 border-2 border-amber-600/50 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-white text-sm">
                🔒 การให้เกียรติบัตรจะให้ก็ต่อเมื่อทำภาพภารกิจ 5 พฤติกรรมคุณลักษณะสุจริตครบถ้วน
              </div>
              <div className="text-amber-200/90 text-xs mt-0.5 font-light">
                ผู้เรียนยังไม่ได้อัปโหลดภาพหลักฐานครบทั้ง 5 พฤติกรรม (ขณะนี้แสดงผลเกียรติบัตรในโหมดพรีวิวตัวอย่าง)
              </div>
            </div>
          </div>
          {onGoToBehaviorPhotos ? (
            <button
              onClick={onGoToBehaviorPhotos}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shadow-md transition-all active:scale-95"
            >
              📸 ไปถ่ายภาพภารกิจ 5 พฤติกรรม
            </button>
          ) : (
            <button
              onClick={onGoToPostTest}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shadow-md transition-all active:scale-95"
            >
              ทำแบบทดสอบและส่งภาพ
            </button>
          )}
        </div>
      )}

      {/* The Printable Certificate Container */}
      <div className="flex justify-center">
        <div
          id="certificate-print-area"
          className="relative w-full max-w-4xl aspect-[1.414/1] bg-[#FAF8F5] text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-14 border-8 border-[#1E3A8A] overflow-hidden flex flex-col justify-between"
          style={
            config.customBgUrl
              ? {
                  backgroundImage: `url(${config.customBgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }
              : undefined
          }
        >
          {/* Inner Decorative Gold/Navy Double Border */}
          <div className="absolute inset-3 border-2 border-[#C5A059] pointer-events-none rounded-lg" />
          <div className="absolute inset-4 border border-[#1E3A8A]/30 pointer-events-none rounded-md" />

          {/* Certificate Header */}
          <div className="text-center pt-2 relative z-10">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-[#1E3A8A] border-2 border-[#C5A059] flex items-center justify-center text-amber-300 shadow-md">
                <ShieldCheck className="w-8 h-8 text-[#C5A059]" />
              </div>
            </div>

            <h2 className="text-sm font-semibold tracking-widest text-[#1E3A8A] uppercase">
              {config.organizationName}
            </h2>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112240] tracking-tight mt-1 font-['Prompt']">
              {config.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-light mt-1 font-['Sarabun']">
              {config.subtitle}
            </p>
          </div>

          {/* Certificate Body & Recipient Name */}
          <div className="text-center my-6 relative z-10">
            <p className="text-xs sm:text-sm text-slate-600 font-['Sarabun']">
              เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
            </p>

            <div className="text-2xl sm:text-4xl font-extrabold text-[#1E3A8A] tracking-wide my-3 font-['Prompt'] border-b-2 border-[#C5A059]/60 pb-2 inline-block px-8 min-w-[280px]">
              {selectedUser ? `${selectedUser.prefix} ${selectedUser.fullName}` : 'ผู้เข้าร่วมกิจกรรมการเรียนรู้'}
            </div>

            <div className="text-xs text-slate-600 mt-1 font-['Sarabun']">
              สถานะ: {selectedUser?.status || 'นักเรียน'} | รหัสประจำชุดสื่อ: {selectedUser?.mediaKitCode || activeRoom?.mediaKitCode || 'KIT-001'}
            </div>

            <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed font-['Sarabun'] mt-4 px-4">
              {config.bodyTemplate}
            </p>
          </div>

          {/* 5 Attributes Badge Strip on Certificate */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 py-2 border-y border-[#C5A059]/30 relative z-10 text-[10px] sm:text-xs text-slate-700 font-['Sarabun'] font-medium">
            <span>🧠 คิดแยกแยะ</span>
            <span>•</span>
            <span>⚖️ ซื่อสัตย์สุจริต</span>
            <span>•</span>
            <span>📜 มีวินัย</span>
            <span>•</span>
            <span>🌱 อยู่อย่างพอเพียง</span>
            <span>•</span>
            <span>🤝 มีจิตสาธารณะ</span>
          </div>

          {/* Certificate Signatures & Seal */}
          <div className="grid grid-cols-3 items-end pt-4 relative z-10 text-slate-800 font-['Sarabun']">
            
            {/* Left: Cert No & Date */}
            <div className="text-left text-[11px] space-y-1">
              <div>เลขที่: <span className="font-mono font-semibold">{certificateNumber}</span></div>
              <div>ให้ไว้ ณ วันที่ {currentDateThai}</div>
              {activeRoom && (
                <div className="text-[10px] text-slate-500">ห้องปฏิบัติการ: {activeRoom.roomCode}</div>
              )}
            </div>

            {/* Center: Official Seal */}
            <div className="text-center flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-[#C5A059] flex flex-col items-center justify-center text-[8px] sm:text-[9px] font-bold text-[#1E3A8A] uppercase tracking-tighter bg-amber-50 shadow-inner">
                <span>★ ★ ★</span>
                <span className="text-center leading-tight mt-0.5">SMART CITY</span>
                <span>INTEGRITY</span>
              </div>
            </div>

            {/* Right: Signature & Title */}
            <div className="text-center text-[11px]">
              <div className="h-8 flex items-end justify-center">
                <span className="font-serif italic text-base text-[#1E3A8A] font-bold">
                  {config.directorName}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1 mt-1 font-semibold text-slate-800">
                ({config.directorName})
              </div>
              <div className="text-[10px] text-slate-600">
                {config.directorTitle}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
