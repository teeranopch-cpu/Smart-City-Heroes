import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  Timer, 
  CheckCircle, 
  AlertTriangle, 
  Scale, 
  Play,
  FileQuestion,
  UserCheck
} from 'lucide-react';
import { GameRoom } from '../types';

interface CorruptionCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: GameRoom;
  onApplyInvestigationResult: (
    playerId: string,
    purityPercent: number,
    cityDelta: number,
    personalDelta: number,
    reason: string
  ) => void;
}

export const CorruptionCheckModal: React.FC<CorruptionCheckModalProps> = ({
  isOpen,
  onClose,
  activeRoom,
  onApplyInvestigationResult
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [hasStartedExam, setHasStartedExam] = useState<boolean>(false);

  const [investigationScenario] = useState<{
    title: string;
    description: string;
    question: string;
  }>({
    title: 'การตรวจสอบทรัพย์สินและผลประโยชน์ทับซ้อนในโครงการสาธารณะ',
    description: 'มีข้อร้องเรียนจากภาคีเครือข่ายความโปร่งใสเกี่ยวกับการจัดสรรงบประมาณและการรับของกำนัลในโครงการพัฒนาเมือง ผู้เล่นต้องแสดงความโปร่งใส ชี้แจงข้อเท็จจริง และยึดมั่นในคุณลักษณะ 5 ประการของโรงเรียนสุจริต',
    question: 'ท่านมีหลักฐานความบริสุทธิ์และแนวทางชี้แจงความโปร่งใสอย่างไร เพื่อพิสูจน์ว่าไม่มีการทุจริตหรือผลประโยชน์ทับซ้อน?'
  });

  const [statementText, setStatementText] = useState<string>('');
  const [evidenceProvided, setEvidenceProvided] = useState<boolean>(false);
  const [transparencyDeclared, setTransparencyDeclared] = useState<boolean>(true);
  const [resultEvaluated, setResultEvaluated] = useState<{
    purityPercent: number;
    verdict: string;
    cityDelta: number;
    personalDelta: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSecondsLeft(30);
      setTimerActive(false);
      setHasStartedExam(false);
      setStatementText('');
      setEvidenceProvided(false);
      setTransparencyDeclared(true);
      setResultEvaluated(null);
      if (activeRoom.players.length > 0) {
        setSelectedPlayerId(activeRoom.players[0].id);
      }
    } else {
      setTimerActive(false);
      setHasStartedExam(false);
    }
  }, [isOpen, activeRoom]);

  // 30 seconds countdown - only runs when hasStartedExam and timerActive are true
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsLeft === 0 && timerActive) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, secondsLeft]);

  if (!isOpen) return null;

  const targetPlayer = activeRoom.players.find((p) => p.id === selectedPlayerId) || activeRoom.players[0];

  const handleStartExam = () => {
    setHasStartedExam(true);
    setTimerActive(true);
    setSecondsLeft(30);
  };

  const handleEvaluatePurity = () => {
    setTimerActive(false);

    // Dynamic purity algorithm based on speed, evidence, and declared statement
    let purity = 50; // base

    if (secondsLeft > 15) purity += 20; // fast confident response
    else if (secondsLeft > 5) purity += 10;

    if (evidenceProvided) purity += 20;
    if (transparencyDeclared) purity += 10;
    if (statementText.trim().length > 10) purity += 10;

    // Cap between 0 and 100
    purity = Math.min(100, Math.max(20, purity));

    let verdict = '';
    // Rules: point adjustments must always be +1 or -1 point at a time!
    let cityDelta = 1;
    let personalDelta = 1;

    if (purity >= 75) {
      verdict = 'บริสุทธิ์โปร่งใส ชี้แจงครบถ้วน ตรวจสอบได้ชัดเจน ไม่พบข้อพิรุธ (+1 แต้มเมือง, +1 แต้มชีวิตสุจริต)';
      cityDelta = 1;
      personalDelta = 1;
    } else if (purity >= 50) {
      verdict = 'ผ่านเกณฑ์ตรวจสอบ แต่ต้องเฝ้าระวังขั้นตอนเอกสาร (+1 แต้มชีวิตสุจริต)';
      cityDelta = 0;
      personalDelta = 1;
    } else {
      verdict = 'ไม่สามารถชี้แจงความโปร่งใสได้ชัดเจน หรือหมดเวลาชี้แจง (-1 แต้มเมือง, -1 แต้มชีวิตสุจริต)';
      cityDelta = -1;
      personalDelta = -1;
    }

    setResultEvaluated({
      purityPercent: purity,
      verdict,
      cityDelta,
      personalDelta
    });
  };

  const handleConfirmResult = () => {
    if (!resultEvaluated || !targetPlayer) return;
    onApplyInvestigationResult(
      targetPlayer.id,
      resultEvaluated.purityPercent,
      resultEvaluated.cityDelta,
      resultEvaluated.personalDelta,
      `ผลการตรวจสอบการทุจริต (${resultEvaluated.purityPercent}% ความบริสุทธิ์): ${resultEvaluated.verdict}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-['Prompt',sans-serif]">
      <div className="relative w-full max-w-xl bg-[#112240] border-2 border-amber-500/50 rounded-3xl shadow-2xl p-6 sm:p-7 text-white overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-300 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-white">
                การ์ดตรวจสอบการทุจริต (Anti-Corruption Check)
              </h3>
              <p className="text-xs text-amber-300">
                อ่านคำถามให้เข้าใจก่อนเริ่มทำข้อสอบและนับเวลา 30 วินาที
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E3A8A]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Selector */}
        <div className="mt-4 flex items-center justify-between gap-3 bg-[#0A192F] p-3.5 rounded-2xl border border-[#233554]">
          <span className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-400" />
            ตัวละครที่ถูกตรวจสอบ:
          </span>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            disabled={hasStartedExam || resultEvaluated !== null}
            className="px-4 py-2 bg-[#112240] border border-[#233554] rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-amber-500"
          >
            {activeRoom.players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.role})
              </option>
            ))}
          </select>
        </div>

        {/* STEP 1: READING STAGE (User reads question first before starting exam and timer!) */}
        {!hasStartedExam && !resultEvaluated && (
          <div className="my-5 space-y-4 animate-fade-in">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border-2 border-amber-600/40 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/60 text-amber-200 text-xs font-bold border border-amber-500/30">
                <FileQuestion className="w-4 h-4" />
                สถานการณ์ตรวจสอบ
              </div>
              
              <h4 className="text-base sm:text-lg font-bold text-white">
                {investigationScenario.title}
              </h4>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {investigationScenario.description}
              </p>

              <div className="pt-3 border-t border-amber-700/40">
                <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
                  คำถามที่ต้องตอบ:
                </div>
                <div className="text-sm sm:text-base font-semibold text-amber-100 bg-[#0A192F]/80 p-3.5 rounded-xl border border-amber-600/30">
                  "{investigationScenario.question}"
                </div>
              </div>
            </div>

            <div className="bg-[#0A192F] p-4 rounded-2xl border border-[#233554] text-center space-y-3">
              <p className="text-xs sm:text-sm text-slate-300">
                📖 <strong>ให้ผู้เล่นอ่านคำถามและทำความเข้าใจสถานการณ์ให้พร้อม</strong><br />
                เมื่อพร้อมแล้ว ให้กดปุ่มด้านล่างเพื่อเริ่มทำข้อสอบและระบบจะเริ่มนับถอยหลัง 30 วินาที
              </p>

              <button
                type="button"
                onClick={handleStartExam}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-2xl text-base shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>เริ่มทำข้อสอบ และเริ่มนับเวลา (30 วินาที)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ANSWERING & 30-SECOND COUNTDOWN (After clicking Start Exam) */}
        {hasStartedExam && !resultEvaluated && (
          <div className="my-5 space-y-4 animate-fade-in">
            {/* Countdown Timer Display */}
            <div className="bg-[#0A192F] p-4 rounded-2xl border border-[#233554] text-center shadow-inner">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Timer className={`w-5 h-5 ${secondsLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  เวลากำลังนับถอยหลังในการตอบข้อสอบ
                </span>
              </div>

              <div className={`text-5xl font-black font-mono tracking-tight my-2 ${
                secondsLeft <= 5 ? 'text-rose-400 animate-bounce' : 'text-amber-300'
              }`}>
                00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
              </div>

              <div className="w-full bg-[#112240] h-3 rounded-full overflow-hidden border border-[#233554]">
                <div
                  className={`h-full transition-all duration-1000 ${
                    secondsLeft > 10 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(secondsLeft / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Question reminder */}
            <div className="p-3 bg-[#0A192F] rounded-xl border border-[#233554] text-xs text-amber-200">
              <strong>คำถาม:</strong> {investigationScenario.question}
            </div>

            {/* Answer Input */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-300 block mb-1.5">
                คำชี้แจงหรือหลักฐานการตัดสินใจของผู้เล่น:
              </label>
              <textarea
                rows={3}
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
                placeholder="ระบุข้อเท็จจริง หรือพูดชี้แจงในวงบอร์ดเกมแล้วสรุปสั้นๆ..."
                className="w-full px-4 py-3 bg-[#0A192F] border border-[#233554] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0A192F] border border-[#233554] cursor-pointer hover:border-slate-500">
                <input
                  type="checkbox"
                  checked={evidenceProvided}
                  onChange={(e) => setEvidenceProvided(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <span>มีเอกสาร / พยานอ้างอิงชัดเจน</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#0A192F] border border-[#233554] cursor-pointer hover:border-slate-500">
                <input
                  type="checkbox"
                  checked={transparencyDeclared}
                  onChange={(e) => setTransparencyDeclared(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <span>พร้อมเปิดเผยข้อมูลสู่สาธารณะ</span>
              </label>
            </div>

            {/* Submit & Evaluate Button */}
            <button
              type="button"
              onClick={handleEvaluatePurity}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-2xl text-base shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Scale className="w-5 h-5" />
              <span>ส่งคำชี้แจงและประมวลผล % ความบริสุทธิ์</span>
            </button>
          </div>
        )}

        {/* STEP 3: RESULT & SCORE APPLICATION */}
        {resultEvaluated && (
          <div className="my-5 space-y-4 animate-fade-in">
            <div className="p-5 rounded-2xl bg-[#0A192F] border border-[#233554] text-center space-y-3">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                ระดับความบริสุทธิ์โปร่งใส
              </div>
              
              <div className="text-5xl font-black text-white">
                <span className={resultEvaluated.purityPercent >= 70 ? 'text-emerald-400' : resultEvaluated.purityPercent >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                  {resultEvaluated.purityPercent}%
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                {resultEvaluated.verdict}
              </p>

              {/* Point impacts - always +1 or -1 point */}
              <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-[#233554] text-sm">
                <div>
                  <span className="text-slate-400">ดัชนีเมือง: </span>
                  <span className={`font-bold text-base ${resultEvaluated.cityDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {resultEvaluated.cityDelta >= 0 ? `+${resultEvaluated.cityDelta}` : resultEvaluated.cityDelta} แต้ม
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">ดัชนีชีวิตสุจริต: </span>
                  <span className={`font-bold text-base ${resultEvaluated.personalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {resultEvaluated.personalDelta >= 0 ? `+${resultEvaluated.personalDelta}` : resultEvaluated.personalDelta} แต้ม
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmResult}
              className="w-full py-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl text-base shadow-xl transition-all active:scale-95"
            >
              บันทึกผลการตรวจสอบลงกระดานเกม
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
