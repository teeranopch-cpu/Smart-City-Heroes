import React from 'react';
import { 
  X, 
  Target, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  User,
  Radio
} from 'lucide-react';
import { RoomPlayer, ROLES, RoleMission, RoleKey } from '../types';
import { StorageService } from '../storage';

interface RoleMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: RoomPlayer;
  mediaKitCode: string;
  onConfirmMissionCompleted: (playerId: string, step: number) => void;
}

// Fallback standard missions if the media kit doesn't have custom ones yet
const DEFAULT_ROLE_MISSIONS: Record<RoleKey, Array<{ step: 1 | 2 | 3; title: string; desc: string }>> = {
  government: [
    {
      step: 1,
      title: 'ตรวจสอบงบประมาณและโครงการพัฒนาเมือง',
      desc: 'ตรวจตราแผนจัดซื้อจัดจ้างภาครัฐ ให้มีความโปร่งใส ไม่มีการซอยงบหรือล็อกสเปก'
    },
    {
      step: 2,
      title: 'เปิดเผยข้อมูลสาธารณะผ่านระบบดิจิทัล (Open Government Data)',
      desc: 'เปิดเผยสัญญาและรายงานความคืบหน้าโครงการให้ประชาชนและสื่อมวลชนตรวจสอบได้ 100%'
    },
    {
      step: 3,
      title: 'ขับเคลื่อนนโยบายต่อต้านการทุจริตและธรรมาภิบาลภาครัฐ',
      desc: 'จัดทำกลไกคุ้มครองผู้ชี้เบาะแส และลงโทษผู้กระทำผิดทางวินัยอย่างเด็ดขาด'
    }
  ],
  business: [
    {
      step: 1,
      title: 'ปฏิเสธการจ่ายสินบนและเงินใต้โต๊ะ',
      desc: 'ยึดมั่นการขอใบอนุญาตและการประกอบการตามขั้นตอนกฎหมายโดยไม่จ่ายสินบนทุกกรณี'
    },
    {
      step: 2,
      title: 'นำระบบบรรษัทภิบาลและบัญชีเล่มเดียวมาใช้ในกิจการ',
      desc: 'ชำระภาษีอย่างถูกต้อง ตรงไปตรงมา และมีจรรยาบรรณทางการค้าที่เป็นธรรม'
    },
    {
      step: 3,
      title: 'สร้างเครือข่ายธุรกิจโปร่งใสและร่วมลงทุนพัฒนาชุมชน',
      desc: 'สนับสนุนสินค้าชุมชนและร่วมมือกับภาคีเครือข่ายไม่ร่วมทำธุรกิจกับบริษัทที่มีประวัติทุจริต'
    }
  ],
  journalist: [
    {
      step: 1,
      title: 'สืบสวนหาข้อเท็จจริงและเบาะแสความผิดปกติ',
      desc: 'ลงพื้นที่รวบรวมหลักฐาน สัมภาษณ์พยานบุคคลด้วยความเป็นกลางและรอบด้าน'
    },
    {
      step: 2,
      title: 'รายงานข่าวเจาะลึกเพื่อเปิดโปงการทุจริต',
      desc: 'ตีแผ่ความจริงอย่างมีจรรยาบรรณวิชาชีพ ไม่บิดเบือน ไม่รับสินบนเพื่อปิดข่าว'
    },
    {
      step: 3,
      title: 'สร้างความตระหนักรู้และเวทีตรวจสอบภาคประชาชน',
      desc: 'จัดเวทีเสวนาและสื่อสารให้ประชาชนตื่นรู้ ร่วมกันปกป้องผลประโยชน์ของเมือง'
    }
  ],
  civil_servant: [
    {
      step: 1,
      title: 'บริการประชาชนอย่างเท่าเทียมและซื่อสัตย์',
      desc: 'ไม่เลือกปฏิบัติ ไม่เรียกรับของขวัญหรือผลประโยชน์ตอบแทนในการอนุมัติเอกสาร'
    },
    {
      step: 2,
      title: 'ปรับปรุงขั้นตอนการทำงานให้กระชับและโปร่งใส',
      desc: 'ลดขั้นตอนที่ซ้ำซ้อนและเปิดให้ประชาชนติดตามสถานะการดำเนินงานได้ตลอดเวลา'
    },
    {
      step: 3,
      title: 'จัดตั้งศูนย์รับเรื่องร้องเรียนและคุ้มครองพลเมืองดี',
      desc: 'ประสานงานแก้ไขปัญหาทุจริตในพื้นที่อย่างจริงจังและรวดเร็ว'
    }
  ],
  police: [
    {
      step: 1,
      title: 'บังคับใช้กฎหมายอย่างเป็นธรรมและเสมอภาค',
      desc: 'ตรวจตราและดูแลความปลอดภัยโดยไม่เกรงกลัวอิทธิพล ไม่ละเว้นการปฏิบัติหน้าที่'
    },
    {
      step: 2,
      title: 'ปราบปรามขบวนการคอร์รัปชันและส่วย',
      desc: 'ดำเนินการจับกุมและดำเนินคดีผู้มีส่วนเกี่ยวข้องกับการทุจริตโดยตรงอย่างโปร่งใส'
    },
    {
      step: 3,
      title: 'สร้างเครือข่ายตำรวจชุมชนร่วมกับประชาชน',
      desc: 'เสริมสร้างความไว้เนื้อเชื่อใจระหว่างเจ้าหน้าที่รัฐกับชุมชนเพื่อความสงบสุขที่ยั่งยืน'
    }
  ],
  citizen: [
    {
      step: 1,
      title: 'ยึดมั่นความซื่อสัตย์สุจริตและเคารพกฎกติกา',
      desc: 'ไม่ลัดคิว ไม่ติดสินบนเจ้าหน้าที่ และดำเนินชีวิตด้วยความพอเพียงในชีวิตประจำวัน'
    },
    {
      step: 2,
      title: 'ตื่นรู้และไม่เพิกเฉยต่อการโกง',
      desc: 'สังเกตการณ์การใช้จ่ายงบประมาณในชุมชน และแจ้งเบาะแสเมื่อพบความไม่ชอบมาพากล'
    },
    {
      step: 3,
      title: 'รวมพลังสร้างชุมชนสุจริตเข้มแข็ง',
      desc: 'ร่วมกิจกรรมจิตอาสาพัฒนาเมือง และสร้างค่านิยมไม่ยอมรับคนโกงในสังคม'
    }
  ]
};

export const RoleMissionModal: React.FC<RoleMissionModalProps> = ({
  isOpen,
  onClose,
  player,
  mediaKitCode,
  onConfirmMissionCompleted
}) => {
  if (!isOpen) return null;

  const roleInfo = ROLES[player.role];
  const kitMissions = StorageService.getRoleMissions(mediaKitCode).filter((m) => m.role === player.role);
  const defaultMissions = DEFAULT_ROLE_MISSIONS[player.role] || [];

  // Current step to complete (1, 2, or 3)
  const currentStep = Math.min(3, player.missionStep + 1);
  const isAllCompleted = player.missionStep >= 3;

  const getMissionInfo = (stepNum: 1 | 2 | 3) => {
    const fromKit = kitMissions.find((m) => m.step === stepNum);
    if (fromKit) {
      return {
        title: fromKit.title,
        desc: fromKit.description,
        nfcCode: fromKit.nfcCode
      };
    }
    const fromDef = defaultMissions.find((m) => m.step === stepNum);
    return {
      title: fromDef?.title || `ภารกิจประจำบทบาทขั้นที่ ${stepNum}`,
      desc: fromDef?.desc || 'ปฏิบัติหน้าที่ด้วยความซื่อสัตย์สุจริตเพื่อประโยชน์ส่วนรวมของเมือง',
      nfcCode: `NFC-${player.role.toUpperCase()}-${stepNum}`
    };
  };

  const handleConfirm = (step: number) => {
    onConfirmMissionCompleted(player.id, step);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-['Prompt',sans-serif]">
      <div className="relative w-full max-w-2xl bg-[#112240] border-2 border-blue-500/50 rounded-3xl shadow-2xl p-6 sm:p-8 text-white max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-[#0A192F] border-2 border-blue-400/50 flex items-center justify-center text-3xl shadow-md">
              {roleInfo.badge}
            </div>
            <div>
              <div className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
                ภารกิจประจำบทบาทตัวละคร
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span>{player.fullName}</span>
                <span className="text-sm font-normal text-slate-300">
                  ({roleInfo.name})
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E3A8A]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Duty Summary */}
        <div className="my-4 p-4 rounded-2xl bg-[#0A192F] border border-[#233554] space-y-1.5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            เป้าหมายและหน้าที่ตามบทบาท:
          </div>
          <p className="text-sm text-blue-200 font-light leading-relaxed">
            {roleInfo.duty}
          </p>
          <div className="text-xs text-slate-400 pt-1">
            ความคืบหน้าปัจจุบัน: <strong className="text-emerald-400">{player.missionStep} จาก 3 ขั้น</strong> {isAllCompleted ? '(สำเร็จครบทุกขั้นแล้ว)' : ''}
          </div>
        </div>

        {/* 3 Mission Steps Cards */}
        <div className="space-y-3.5 my-5">
          {[1, 2, 3].map((stepNum) => {
            const step = stepNum as 1 | 2 | 3;
            const mission = getMissionInfo(step);
            const isCompleted = player.missionStep >= stepNum;
            const isCurrentTarget = !isCompleted && stepNum === currentStep;

            return (
              <div
                key={stepNum}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-100'
                    : isCurrentTarget
                    ? 'bg-blue-950/40 border-blue-400 ring-2 ring-blue-500/30'
                    : 'bg-[#0A192F]/60 border-[#233554] opacity-65'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrentTarget
                        ? 'bg-blue-600 text-white animate-pulse'
                        : 'bg-[#112240] text-slate-400'
                    }`}>
                      ภารกิจขั้นที่ {stepNum}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-white">
                      {mission.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        สำเร็จแล้ว
                      </span>
                    ) : (
                      <span className="font-mono text-slate-400 bg-[#0A192F] px-2 py-0.5 rounded border border-[#233554]">
                        รหัส NFC: {mission.nfcCode}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {mission.desc}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 text-xs text-slate-400">
                  <span className="text-emerald-300 font-semibold">
                    รางวัลเมื่อสำเร็จ: +1 แต้มชีวิตสุจริต & +1 แต้มดัชนีเมือง
                  </span>

                  {/* Confirmation button for this specific character and step */}
                  {isCurrentTarget && (
                    <button
                      type="button"
                      onClick={() => handleConfirm(stepNum)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ยืนยันทำภารกิจขั้นที่ {stepNum} สำเร็จ</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Confirmation button if current step is available */}
        {!isAllCompleted ? (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleConfirm(currentStep)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold rounded-2xl text-base shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>ยืนยันตัวละคร {player.fullName} ทำภารกิจสำเร็จ (ขั้นที่ {currentStep})</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-center text-emerald-200 text-sm font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>ตัวละครนี้สำเร็จภารกิจครบทั้ง 3 ขั้นอย่างสมบูรณ์แล้ว!</span>
          </div>
        )}

      </div>
    </div>
  );
};
