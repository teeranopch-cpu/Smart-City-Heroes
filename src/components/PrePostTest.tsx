import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ArrowRight,
  ShieldCheck, 
  HelpCircle,
  Award
} from 'lucide-react';
import { 
  UserAccount, 
  PrePostQuestion, 
  AttributeKey, 
  INTEGRITY_ATTRIBUTES,
  GameRoom 
} from '../types';
import { StorageService } from '../storage';

interface PrePostTestProps {
  currentUser: UserAccount | null;
  activeRoom: GameRoom | null;
  initialTab?: 'pre' | 'post';
  onTestCompleted: (type: 'pre' | 'post', user: UserAccount) => void;
  onGoToNextStep: () => void; // pre -> game, post -> behavior_photos
  onBackToLobby?: () => void;
}

// 5 Standard Questions for the 5 Attributes of Integrity Schools
const DEFAULT_PREPOST_QUESTIONS: Array<{ attribute: AttributeKey; questionText: string; guideline: string }> = [
  {
    attribute: 'thinking',
    questionText: 'เมื่อท่านพบเห็นการจัดสรรงบประมาณโครงการที่อาจมีผลประโยชน์ทับซ้อน ท่านมีวิธีคิดวิเคราะห์เพื่อแยกแยะระหว่างประโยชน์ส่วนตนกับประโยชน์ส่วนรวมอย่างไร?',
    guideline: 'คำตอบควรสะท้อนการยึดถือประโยชน์สาธารณะเป็นหลักสำคัญ และมีเหตุผลในการตัดสินใจอย่างรอบคอบ'
  },
  {
    attribute: 'discipline',
    questionText: 'หากมีผู้เสนอผลประโยชน์หรือของกำนัลเพื่อแลกกับการปฏิบัติงานที่สะดวกขึ้น ท่านจะตัดสินใจอย่างไรเพื่อรักษาความซื่อสัตย์สุจริต?',
    guideline: 'คำตอบควรสะท้อนความซื่อตรง ยึดมั่นในความถูกต้องทั้งต่อหน้าและลับหลัง ไม่ยอมรับสินบนทุกรูปแบบ'
  },
  {
    attribute: 'honesty',
    questionText: 'ในการดำเนินชีวิตและการปฏิบัติหน้าที่ร่วมกับผู้อื่น ท่านยึดมั่นและปฏิบัติตามกฎระเบียบ กติกาข้อตกลงของสังคมอย่างไรให้สม่ำเสมอ?',
    guideline: 'คำตอบควรสะท้อนการมีวินัย เคารพกติกาของกลุ่ม ไม่เอาเปรียบ และปฏิบัติตามกฎหมาย'
  },
  {
    attribute: 'sufficiency',
    questionText: 'ท่านนำหลักปรัชญาของเศรษฐกิจพอเพียงมาปรับใช้ในการบริหารจัดการทรัพยากรและการใช้ชีวิตประจำวันเพื่อป้องกันความโลภอย่างไร?',
    guideline: 'คำตอบควรสะท้อนความพอประมาณ ความมีเหตุผล และการมีภูมิคุ้มกันในการดำเนินชีวิต'
  },
  {
    attribute: 'volunteer',
    questionText: 'เมื่อเมืองหรือชุมชนต้องการความร่วมมือในการพัฒนาและเฝ้าระวังความโปร่งใส ท่านพร้อมเสียสละและมีส่วนร่วมในการทำประโยชน์เพื่อส่วนรวมอย่างไร?',
    guideline: 'คำตอบควรสะท้อนจิตสาธารณะ ความพร้อมในการร่วมมือและเสียสละเพื่อส่วนรวม'
  }
];

export const PrePostTest: React.FC<PrePostTestProps> = ({
  currentUser,
  activeRoom,
  initialTab = 'pre',
  onTestCompleted,
  onGoToNextStep,
  onBackToLobby
}) => {
  const [activeTab, setActiveTab] = useState<'pre' | 'post'>(initialTab);
  const [questions, setQuestions] = useState<PrePostQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    loadQuestions();
    if (currentUser) {
      if (activeTab === 'pre' && currentUser.preTestAnswers) {
        setAnswers(currentUser.preTestAnswers);
      } else if (activeTab === 'post' && currentUser.postTestAnswers) {
        setAnswers(currentUser.postTestAnswers);
      }
    }
  }, [activeTab, currentUser, activeRoom]);

  const loadQuestions = () => {
    const kitCode = activeRoom?.mediaKitCode || currentUser?.mediaKitCode;
    const all = StorageService.getPrePostQuestions(kitCode);
    const filtered = all.filter((q) => q.type === activeTab || q.type === 'both');

    if (filtered.length > 0) {
      setQuestions(filtered);
    } else {
      // If admin hasn't created questions yet, supply the 5 standard questions so user CAN start & answer!
      const defaultQuestions: PrePostQuestion[] = DEFAULT_PREPOST_QUESTIONS.map((dq, idx) => ({
        id: `STD-${activeTab}-${idx + 1}`,
        attribute: dq.attribute,
        questionText: dq.questionText,
        guideline: dq.guideline,
        type: activeTab,
        points: 10
      }));
      setQuestions(defaultQuestions);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg('');

    // Check that all questions have an answer
    const unanswered = questions.filter((q) => !answers[q.id] || !answers[q.id].trim());
    if (unanswered.length > 0) {
      setErrorMsg(`กรุณาตอบคำถามให้ครบทุกข้อ (ยังเหลืออีก ${unanswered.length} ข้อ)`);
      return;
    }

    // Calculate score (10 points per answered question)
    const totalScore = questions.length * 10;

    const updatedUser: UserAccount = {
      ...currentUser,
      ...(activeTab === 'pre'
        ? {
            preTestCompleted: true,
            preTestAnswers: answers,
            preTestScore: totalScore
          }
        : {
            postTestCompleted: true,
            postTestAnswers: answers,
            postTestScore: totalScore
          })
    };

    StorageService.saveUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);

    setSavedSuccessMessage(
      activeTab === 'pre'
        ? 'บันทึกคำตอบแบบทดสอบก่อนเรียนสำเร็จเรียบร้อย! กำลังนำท่านเข้าสู่กระดานบอร์ดเกม...'
        : 'บันทึกคำตอบแบบทดสอบหลังเรียนสำเร็จเรียบร้อย! กำลังนำท่านสู่ขั้นตอนการถ่ายภาพภารกิจ 5 พฤติกรรม...'
    );

    setTimeout(() => {
      onTestCompleted(activeTab, updatedUser);
      onGoToNextStep();
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-['Prompt',sans-serif] animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#112240] to-[#1E3A8A]/50 border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-200 text-xs font-bold mb-2">
              <FileText className="w-4 h-4 text-blue-300" />
              การประเมินคุณลักษณะ 5 ประการ โรงเรียนสุจริต
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === 'pre' ? 'แบบทดสอบก่อนเรียน (Pre-test)' : 'แบบทดสอบหลังเรียน (Post-test)'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-light max-w-2xl leading-relaxed">
              {activeTab === 'pre'
                ? 'วัดระดับความรู้ ความเข้าใจ และกระบวนการคิดด้านความซื่อสัตย์สุจริตก่อนเริ่มกิจกรรมบอร์ดเกม'
                : 'วัดผลการเรียนรู้และคุณลักษณะสุจริต 5 ประการหลังเสร็จสิ้นกิจกรรมบอร์ดเกม'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {currentUser && (
              <div className="text-right text-xs bg-[#0A192F] p-3.5 rounded-2xl border border-[#233554]">
                <div className="text-slate-400">ผู้ทำแบบทดสอบ:</div>
                <div className="font-bold text-white text-sm mt-0.5">
                  {currentUser.prefix} {currentUser.fullName}
                </div>
                <div className="text-[11px] text-blue-300">
                  ชุดสื่อ: {activeRoom?.mediaKitCode || currentUser.mediaKitCode || 'มาตรฐาน'}
                </div>
              </div>
            )}

            {onBackToLobby && (
              <button
                type="button"
                onClick={onBackToLobby}
                className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-[#233554] transition-colors"
              >
                ← กลับสู่ห้องรับรอง
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mode Indicator */}
      <div className="flex border-b border-[#233554] mb-8 bg-[#112240]/40 rounded-2xl p-1.5">
        <button
          type="button"
          onClick={() => { setActiveTab('pre'); setSavedSuccessMessage(''); setErrorMsg(''); }}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pre'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>1. แบบทดสอบก่อนเรียน (Pre-test)</span>
          {currentUser?.preTestCompleted && (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('post'); setSavedSuccessMessage(''); setErrorMsg(''); }}
          className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'post'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>2. แบบทดสอบหลังเรียน (Post-test)</span>
          {currentUser?.postTestCompleted && (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          )}
        </button>
      </div>

      {/* Success and Error Alerts */}
      {savedSuccessMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-950/70 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#112240] border-2 border-[#233554] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span>ข้อสอบอัตนัยตามคุณลักษณะ 5 ประการ ({questions.length} ข้อ)</span>
            </h2>
            <span className="text-xs text-blue-300 bg-[#0A192F] px-3 py-1 rounded-full border border-[#233554]">
              {activeTab === 'pre' ? 'ก่อนเริ่มเล่นบอร์ดเกม' : 'หลังจบเกมบอร์ดเกม'}
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, qIndex) => {
              const attr = INTEGRITY_ATTRIBUTES[q.attribute];
              return (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0A192F] border-2 border-[#233554] hover:border-blue-500/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-900/50 text-blue-200 border border-blue-500/40 flex items-center gap-1.5 font-bold">
                      <span>{attr ? attr.icon : '📝'}</span>
                      <span>คุณลักษณะ: {attr ? attr.name : q.attribute}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      ข้อที่ {qIndex + 1} จาก {questions.length}
                    </span>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-white leading-relaxed pt-1">
                    {q.questionText}
                  </div>

                  {q.guideline && (
                    <div className="text-xs text-slate-300 italic bg-[#112240] p-3 rounded-xl border border-[#233554]">
                      💡 แนวทางการคิด/เกณฑ์พิจารณา: {q.guideline}
                    </div>
                  )}

                  <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      คำตอบเชิงคิดวิเคราะห์ของท่าน:
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder="พิมพ์คำตอบแสดงเหตุผลและการคิดวิเคราะห์ของท่านที่นี่..."
                      className="w-full px-4 py-3 bg-[#112240] border border-[#233554] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-[#233554] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              {activeTab === 'pre'
                ? 'เมื่อส่งแบบทดสอบก่อนเรียนแล้ว ระบบจะบันทึกผลและพร้อมเข้าสู่หน้าบอร์ดเกมทันที'
                : 'เมื่อส่งแบบทดสอบหลังเรียนแล้ว ระบบจะนำท่านไปสู่หน้าถ่ายภาพภารกิจ 5 พฤติกรรม'}
            </span>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl text-sm flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>
                {activeTab === 'pre'
                  ? 'ส่งแบบทดสอบก่อนเรียน & เข้าสู่บอร์ดเกม'
                  : 'ส่งแบบทดสอบหลังเรียน & ไปถ่ายภาพภารกิจ 5 พฤติกรรม'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </form>

    </div>
  );
};
