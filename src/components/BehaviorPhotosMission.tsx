import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Award, 
  ArrowRight,
  ShieldCheck,
  Brain,
  Scale,
  ScrollText,
  Sprout,
  HeartHandshake,
  Trash2,
  Lock
} from 'lucide-react';
import { UserAccount, GameRoom, AttributeKey, INTEGRITY_ATTRIBUTES } from '../types';
import { StorageService } from '../storage';

interface BehaviorPhotosMissionProps {
  currentUser: UserAccount | null;
  activeRoom: GameRoom | null;
  onPhotosCompleted: (updatedUser: UserAccount) => void;
  onBackToPostTest?: () => void;
}

interface BehaviorSlot {
  index: number;
  attributeKey: AttributeKey;
  title: string;
  sub: string;
  guide: string;
}

const BEHAVIOR_SLOTS: BehaviorSlot[] = [
  {
    index: 0,
    attributeKey: 'thinking',
    title: 'พฤติกรรมที่ 1: ทักษะกระบวนการคิด',
    sub: 'ภาพถ่ายกิจกรรมการคิดวิเคราะห์ แยกแยะประโยชน์ส่วนตนและประโยชน์ส่วนรวม',
    guide: 'เช่น ภาพขณะผู้เล่นกำลังวิเคราะห์สถานการณ์บอร์ดเกม หรือร่วมกันจำแนกข้อเท็จจริง'
  },
  {
    index: 1,
    attributeKey: 'discipline',
    title: 'พฤติกรรมที่ 2: ความซื่อสัตย์สุจริต',
    sub: 'ภาพถ่ายกิจกรรมการปฏิบัติงานอย่างซื่อตรง ไม่ทุจริต ไม่เอื้อประโยชน์ตนเอง',
    guide: 'เช่น ภาพการตรวจนับแต้มอย่างตรงไปตรงมา หรือการปฏิเสธข้อเสนอที่ไม่ถูกต้องในเกม'
  },
  {
    index: 2,
    attributeKey: 'honesty',
    title: 'พฤติกรรมที่ 3: มีวินัย',
    sub: 'ภาพถ่ายการเคารพกฎกติกาการเล่นบอร์ดเกมและข้อตกลงของสังคม',
    guide: 'เช่น ภาพการปฏิบัติตามกติกาอย่างเคร่งครัด เคารพสิทธิและเวลาของผู้ร่วมกิจกรรม'
  },
  {
    index: 3,
    attributeKey: 'sufficiency',
    title: 'พฤติกรรมที่ 4: อยู่อย่างพอเพียง',
    sub: 'ภาพถ่ายการบริหารจัดการทรัพยากรอย่างคุ้มค่า พอประมาณ และมีเหตุผล',
    guide: 'เช่น ภาพการใช้เบี้ยและงบประมาณอย่างสมเหตุสมผล ไม่โลภ ไม่สร้างหนี้สิน'
  },
  {
    index: 4,
    attributeKey: 'volunteer',
    title: 'พฤติกรรมที่ 5: มีจิตสาธารณะ',
    sub: 'ภาพถ่ายการช่วยเหลือผู้อื่นและการร่วมมือฟื้นฟูเมืองสุจริต',
    guide: 'เช่น ภาพการร่วมมือทำภารกิจร่วมกันเพื่อกอบกู้ดัชนีเมืองสุจริตให้พ้นวิกฤติ'
  }
];

export const BehaviorPhotosMission: React.FC<BehaviorPhotosMissionProps> = ({
  currentUser,
  activeRoom,
  onPhotosCompleted,
  onBackToPostTest
}) => {
  const [images, setImages] = useState<string[]>(['', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (currentUser?.behaviorImages && currentUser.behaviorImages.length === 5) {
      setImages(currentUser.behaviorImages);
    }
  }, [currentUser]);

  const uploadedCount = images.filter((img) => Boolean(img)).length;
  const isAllUploaded = uploadedCount === 5;

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const nextImages = [...images];
      nextImages[index] = dataUrl;
      setImages(nextImages);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = [...images];
    nextImages[index] = '';
    setImages(nextImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!isAllUploaded) {
      setErrorMsg('กรุณาอัปโหลดภาพถ่ายหลักฐานให้ครบทั้ง 5 พฤติกรรมคุณลักษณะสุจริต เพื่อขอรับเกียรติบัตร');
      return;
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      behaviorImages: images,
      certificateIssued: true
    };

    StorageService.saveUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);
    setSuccessMsg('บันทึกภาพถ่ายภารกิจ 5 พฤติกรรมสำเร็จเรียบร้อย! ระบบกำลังนำท่านสู่หน้าเกียรติบัตร...');

    setTimeout(() => {
      onPhotosCompleted(updatedUser);
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-['Prompt',sans-serif] animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#112240] to-blue-950/70 border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-200 text-xs font-bold mb-2">
              <Camera className="w-4 h-4 text-blue-300" />
              ภารกิจขั้นบังคับก่อนรับเกียรติบัตร
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              การถ่ายภาพภารกิจ 5 พฤติกรรมคุณลักษณะสุจริต
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light max-w-2xl leading-relaxed">
              อัปโหลดภาพถ่ายหลักฐานการปฏิบัติจริงในบอร์ดเกมตามคุณลักษณะ 5 ประการของโรงเรียนสุจริตให้ครบถ้วนทั้ง 5 ภาพ เพื่อปลดล็อกสิทธิ์การออกเกียรติบัตร
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 bg-[#0A192F] p-4 rounded-2xl border border-[#233554] text-right">
            <span className="text-xs text-slate-400">สถานะการส่งภาพ:</span>
            <div className="text-xl sm:text-2xl font-black text-amber-300">
              {uploadedCount} / 5 ภาพ
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isAllUploaded ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50' : 'bg-amber-950 text-amber-300 border border-amber-600/50'
            }`}>
              {isAllUploaded ? '✓ ครบ 5 พฤติกรรมแล้ว' : 'ยังไม่ครบ 5 ภาพ'}
            </span>
          </div>
        </div>

        {onBackToPostTest && (
          <div className="mt-4 pt-4 border-t border-[#233554] flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={onBackToPostTest}
              className="text-blue-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              ← ย้อนกลับไปดูข้อสอบหลังเรียน (Post-test)
            </button>
            <span className="text-slate-400">
              ผู้เรียน: {currentUser?.prefix} {currentUser?.fullName}
            </span>
          </div>
        )}
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form with 5 Photo Upload Slots */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BEHAVIOR_SLOTS.map((slot) => {
            const currentImg = images[slot.index];
            const isUploaded = Boolean(currentImg);

            return (
              <div
                key={slot.index}
                className={`bg-[#112240] border-2 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-all ${
                  isUploaded 
                    ? 'border-emerald-500/60 ring-2 ring-emerald-500/20' 
                    : 'border-[#233554] hover:border-blue-400/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {slot.attributeKey === 'thinking' && '🧠'}
                      {slot.attributeKey === 'discipline' && '⚖️'}
                      {slot.attributeKey === 'honesty' && '📜'}
                      {slot.attributeKey === 'sufficiency' && '🌱'}
                      {slot.attributeKey === 'volunteer' && '🤝'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      isUploaded
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-[#0A192F] text-slate-400 border-[#233554]'
                    }`}>
                      {isUploaded ? '✓ อัปโหลดแล้ว' : 'รอภาพถ่าย'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base mb-1">
                    {slot.title}
                  </h3>
                  <p className="text-xs text-blue-200 font-light mb-2">
                    {slot.sub}
                  </p>
                  <p className="text-[11px] text-slate-400 italic mb-4 bg-[#0A192F] p-2.5 rounded-xl border border-[#233554]">
                    💡 ตัวอย่าง: {slot.guide}
                  </p>
                </div>

                {/* Upload or Preview Box */}
                <div>
                  {currentImg ? (
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-emerald-500/40 aspect-[4/3] bg-black/60 shadow-inner">
                      <img
                        src={currentImg}
                        alt={slot.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(slot.index)}
                          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ลบ / เปลี่ยนภาพนี้</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#233554] hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all aspect-[4/3] flex flex-col items-center justify-center gap-2.5 bg-[#0A192F] hover:bg-[#1E3A8A]/20 group">
                      <div className="p-3 rounded-2xl bg-[#112240] border border-[#233554] group-hover:scale-110 transition-transform">
                        <Camera className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-xs text-slate-200 font-bold">
                        ถ่ายภาพ หรือ เลือกไฟล์รูปภาพ
                      </span>
                      <span className="text-[10px] text-slate-400">
                        รองรับ .jpg, .png, .jpeg (สูงสุด 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(slot.index, e)}
                      />
                    </label>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Submit & Go To Certificate Button */}
        <div className="bg-[#112240] border-2 border-[#233554] rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>เงื่อนไขการรับเกียรติบัตร:</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isAllUploaded
                ? '✅ อัปโหลดภาพครบทั้ง 5 พฤติกรรมแล้ว สามารถกดยืนยันเพื่อรับเกียรติบัตรได้ทันที'
                : '⚠️ ยังอัปโหลดภาพไม่ครบ 5 พฤติกรรม (ขาดอีก ' + (5 - uploadedCount) + ' ภาพ)'}
            </p>
          </div>

          <button
            type="submit"
            disabled={!isAllUploaded}
            className={`py-4 px-8 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl transition-all ${
              isAllUploaded
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isAllUploaded ? (
              <>
                <Award className="w-5 h-5 text-amber-300" />
                <span>ยืนยันส่งภาพครบ 5 พฤติกรรม & ออกเกียรติบัตร</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>ต้องอัปโหลดครบ 5 ภาพก่อนจึงจะกดได้ ({uploadedCount}/5)</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
