import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Brain, 
  Scale, 
  ScrollText, 
  Sprout, 
  HeartHandshake, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ArrowRight, 
  Send, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  RotateCcw,
  Play,
  ArrowLeft
} from 'lucide-react';
import { 
  GameRoom, 
  RoomPlayer, 
  RoleKey, 
  ROLES, 
  AttributeKey, 
  INTEGRITY_ATTRIBUTES, 
  PrePostQuestion,
  UserAccount 
} from '../types';
import { StorageService } from '../storage';

interface PreTestAssessmentProps {
  room: GameRoom;
  currentUser: UserAccount | null;
  onAllCompleted: (updatedRoom: GameRoom) => void;
  onBackToLobby?: () => void;
}

interface QuestionEvaluation {
  attribute: AttributeKey;
  questionText: string;
  answer: string;
  score: number; // 0 - 3 points
  feedback: string;
}

// 5 Anti-Corruption Simulation Scenarios (Reflecting the 5 Integrity Attributes)
const DEFAULT_SCENARIOS: Array<{
  attribute: AttributeKey;
  title: string;
  scenarioText: string;
  guideline: string;
  keywords: string[];
}> = [
  {
    attribute: 'thinking',
    title: '1. ทักษะกระบวนการคิด (คิดวิเคราะห์ แยกแยะประโยชน์ส่วนตนและประโยชน์ส่วนรวม)',
    scenarioText: 'สถานการณ์: คณะกรรมการจัดซื้อจัดจ้างกำลังพิจารณาโครงการปรับปรุงสวนสาธารณะในชุมชน โดยมีงบประมาณเหลือจ่าย 200,000 บาท หัวหน้าหน่วยงานเสนอให้นำงบที่เหลือไปจัดทริป "สัมมนาดูงานต่างจังหวัด" สำหรับทีมงานเพื่อเป็นรางวัลตอบแทน โดยอ้างว่าเป็นสวัสดิการ ในฐานะที่คุณเป็นหนึ่งในผู้ร่วมตัดสินใจ คุณจะมีกระบวนการคิดแยกแยะประโยชน์ส่วนตนกับประโยชน์ส่วนรวมในเรื่องนี้อย่างไร และจะตัดสินใจอย่างไร?',
    guideline: 'แนวคิด: วิเคราะห์ว่าเงินงบประมาณมาจากภาษีประชาชน ควรนำไปพัฒนาประโยชน์สาธารณะเพิ่มเติม หรือคืนคลัง ไม่ควรนำมาแปรเป็นผลประโยชน์ส่วนบุคคลของเจ้าหน้าที่',
    keywords: ['ประโยชน์ส่วนรวม', 'ภาษี', 'คืนคลัง', 'ส่วนตน', 'สาธารณะ', 'พัฒนา', 'ไม่เห็นด้วย', 'งบประมาณ', 'ผลประโยชน์ทับซ้อน']
  },
  {
    attribute: 'discipline',
    title: '2. มีวินัย (เคารพกฎหมาย กติกา ระเบียบสังคม และความรับผิดชอบ)',
    scenarioText: 'สถานการณ์: ในการยื่นซองประมูลโครงการก่อสร้างระบบระบายน้ำเพื่อป้องกันน้ำท่วมเมือง มีผู้รับเหมาซึ่งเป็นเพื่อนสนิทของคุณ ยื่นเอกสารไม่ครบตามกำหนดเวลาและขอร้องให้คุณช่วย "เปิดรับเอกสารย้อนหลัง 1 วัน" เพื่อไม่ให้เขาถูกตัดสิทธิ์ โดยสัญญาว่าจะทำงานให้อย่างมีคุณภาพที่สุด คุณจะยึดมั่นในระเบียบวินัยและกติกาอย่างไร?',
    guideline: 'แนวคิด: ยึดมั่นตามระเบียบและกรอบเวลาอย่างเคร่งครัด ไม่เลือกปฏิบัติเพื่อพวกพ้อง เพราะการละเว้นจะทำลายระบบความเสมอภาคและก่อให้เกิดการทุจริต',
    keywords: ['ระเบียบ', 'เสมอภาค', 'เท่าเทียม', 'ตัดสิทธิ์', 'ตรงเวลา', 'กติกา', 'ไม่เลือกปฏิบัติ', 'กฎเกณฑ์', 'หน้าที่']
  },
  {
    attribute: 'honesty',
    title: '3. ความซื่อสัตย์สุจริต (ความซื่อตรง โปร่งใส ปฏิเสธสินบนและการทุจริตทุกรูปแบบ)',
    scenarioText: 'สถานการณ์: ในช่วงเทศกาลปีใหม่ มีผู้ประกอบการรายใหญ่ในเมืองนำกระเช้าของขวัญราคาแพงและบัตรกำนัลมูลค่าสูงมามอบให้คุณที่ทำงาน พร้อมกล่าวขอบคุณและพูดเป็นนัยว่า "ฝากดูแลผลการตรวจสอบภาษีประจำปีที่จะถึงนี้ด้วย" คุณจะแสดงจุดยืนแห่งความซื่อสัตย์สุจริตและจัดการกับสถานการณ์นี้อย่างไร?',
    guideline: 'แนวคิด: ปฏิเสธการรับของขวัญหรือทรัพย์สินที่มีมูลค่าเกินเกณฑ์กฎหมายกำหนด และชี้แจงนโยบาย No Gift Policy พร้อมบันทึกรายงานอย่างโปร่งใส ตรวจสอบตามข้อเท็จจริง',
    keywords: ['ปฏิเสธ', 'no gift', 'คืน', 'ไม่รับ', 'สินบน', 'โปร่งใส', 'รายงาน', 'ตามกฎหมาย', 'ซื่อสัตย์', 'ตรวจสอบ']
  },
  {
    attribute: 'sufficiency',
    title: '4. อยู่อย่างพอเพียง (ความพอประมาณ ความมีเหตุผล และการสร้างภูมิคุ้มกัน)',
    scenarioText: 'สถานการณ์: หน่วยงานของคุณได้รับจัดสรรงบประมาณพัฒนาเมืองอัจฉริยะ โดยมีข้อเสนอให้จัดซื้อระบบคอมพิวเตอร์และเซิร์ฟเวอร์รุ่นหรูหรานำเข้าจากต่างประเทศที่ราคาสูงเกินความจำเป็นในการใช้งานจริง แต่ใช้งบประมาณหมดพอดี คุณจะนำหลักปรัชญาเศรษฐกิจพอเพียง (พอประมาณ มีเหตุผล มีภูมิคุ้มกัน) มาประยุกต์ใช้ในการตัดสินใจครั้งนี้อย่างไร?',
    guideline: 'แนวคิด: จัดซื้อตามความจำเป็น คุ้มค่า สมเหตุสมผล ไม่ฟุ่มเฟือย นำงบที่ประหยัดได้ไปจัดสรรเพื่อพัฒนาคุณภาพชีวิตด้านอื่นของประชาชน',
    keywords: ['พอประมาณ', 'คุ้มค่า', 'จำเป็น', 'สมเหตุสมผล', 'ภูมิคุ้มกัน', 'ประหยัด', 'ไม่ฟุ่มเฟือย', 'ประโยชน์สูงสุด', 'ประสิทธิภาพ']
  },
  {
    attribute: 'volunteer',
    title: '5. มีจิตสาธารณะ (จิตอาสา เสียสละเพื่อส่วนรวม และร่วมมือปกป้องสังคม)',
    scenarioText: 'สถานการณ์: ในช่วงวันหยุด คุณสังเกตเห็นท่อระบายน้ำสาธารณะริมถนนหลักของเมืองอุดตันจากขยะสะสม และเริ่มมีน้ำท่วมขังผิวถนน แม้จะไม่ใช่พื้นที่รับผิดชอบโดยตรงตามตำแหน่งของคุณ แต่หากปล่อยทิ้งไว้อาจเกิดอุบัติเหตุต่อผู้ใช้ทางและประชาชน คุณจะแสดงจิตสาธารณะเพื่อส่วนรวมและแก้ไขปัญหานี้อย่างไร?',
    guideline: 'แนวคิด: มีจิตอาสาร่วมแก้ไขปัญหาเบื้องต้น ประสานงานแจ้งหน่วยงานที่รับผิดชอบโดยไม่นิ่งดูดาย และรณรงค์ให้ชุมชนร่วมรักษาความสะอาด',
    keywords: ['จิตอาสา', 'ส่วนรวม', 'ช่วย', 'ประสานงาน', 'แจ้ง', 'ไม่นิ่งดูดาย', 'ปลอดภัย', 'ชุมชน', 'เสียสละ', 'แก้ปัญหา']
  }
];

export const PreTestAssessment: React.FC<PreTestAssessmentProps> = ({
  room,
  currentUser,
  onAllCompleted,
  onBackToLobby
}) => {
  // Mode: 'player_select' | 'testing' | 'player_summary' | 'all_done'
  const [viewMode, setViewMode] = useState<'player_select' | 'testing' | 'player_summary' | 'all_done'>('player_select');
  
  // Players state in room
  const [players, setPlayers] = useState<RoomPlayer[]>(() => {
    return room.players && room.players.length === 6 ? room.players : [];
  });

  // Current testing player index (0 to 5)
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);

  // Question testing state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30 seconds countdown
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluations, setCurrentEvaluations] = useState<QuestionEvaluation[]>([]);
  const [lastQuestionFeedback, setLastQuestionFeedback] = useState<{ score: number; feedback: string } | null>(null);

  const timerRef = useRef<any>(null);

  // Check if all players completed
  useEffect(() => {
    const allDone = players.length === 6 && players.every((p) => p.preTestCompleted);
    if (allDone && viewMode !== 'all_done') {
      setViewMode('all_done');
    }
  }, [players]);

  // Timer countdown hook for 30s
  useEffect(() => {
    if (viewMode === 'testing') {
      setTimeLeft(30);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Time out: auto submit
            handleAutoSubmitOnTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [viewMode, currentQuestionIndex]);

  // AI Assessment Scoring Function (0 - 3 points per question)
  const evaluateAnswer = (
    attribute: AttributeKey,
    answerText: string,
    scenario: typeof DEFAULT_SCENARIOS[0]
  ): { score: number; feedback: string } => {
    const text = answerText.trim();
    if (!text || text.length < 5) {
      return {
        score: 0,
        feedback: 'ไม่ได้ตอบหรือคำตอบสั้นเกินไป ไม่สามารถประเมินกระบวนการคิดต้านทุจริตได้ (0/3 คะแนน)'
      };
    }

    // Match keywords and ethical depth
    let matchCount = 0;
    for (const kw of scenario.keywords) {
      if (text.toLowerCase().includes(kw.toLowerCase())) {
        matchCount++;
      }
    }

    const length = text.length;

    // Criteria:
    // 3 points: Length >= 35 chars and at least 2 key ethical concepts matched (Deep ethical reflection)
    // 2 points: Length >= 20 chars and at least 1 keyword matched, or good reasoned thought
    // 1 point: Short answer or basic realization without thorough reasoning
    // 0 points: Irrelevant or unethical
    if (matchCount >= 2 && length >= 35) {
      return {
        score: 3,
        feedback: 'ยอดเยี่ยม (3/3 คะแนน): มีทักษะการคิดวิเคราะห์อย่างลึกซึ้ง ยึดมั่นประโยชน์ส่วนรวมและความโปร่งใสได้อย่างเด่นชัด'
      };
    } else if (matchCount >= 1 || length >= 25) {
      return {
        score: 2,
        feedback: 'ดี (2/3 คะแนน): มีความเข้าใจในคุณลักษณะสุจริตและมีเจตนารมณ์ที่ดีในการปฏิเสธการทุจริต'
      };
    } else {
      return {
        score: 1,
        feedback: 'พอใช้ (1/3 คะแนน): แสดงความตระหนักขั้นต้น แนะนำให้เพิ่มการวิเคราะห์เชิงเหตุผลเพื่อประโยชน์ส่วนรวม'
      };
    }
  };

  const handleAutoSubmitOnTimeOut = () => {
    handleSubmitQuestion(true);
  };

  const handleSubmitQuestion = (isTimeout: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const scenario = DEFAULT_SCENARIOS[currentQuestionIndex];
    const { score, feedback } = evaluateAnswer(scenario.attribute, currentAnswer, scenario);

    const newEval: QuestionEvaluation = {
      attribute: scenario.attribute,
      questionText: scenario.title,
      answer: currentAnswer.trim() || (isTimeout ? '(หมดเวลา 30 วินาที)' : ''),
      score,
      feedback
    };

    const updatedEvals = [...currentEvaluations, newEval];
    setCurrentEvaluations(updatedEvals);
    setLastQuestionFeedback({ score, feedback });

    // If more questions remain in the 5 questions
    if (currentQuestionIndex < 4) {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setCurrentQuestionIndex((prev) => prev + 1);
        setCurrentAnswer('');
        setLastQuestionFeedback(null);
      }, 1200);
    } else {
      // Completed all 5 questions for this player
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        finishPlayerTest(updatedEvals);
      }, 1200);
    }
  };

  const finishPlayerTest = (evaluations: QuestionEvaluation[]) => {
    const totalScore = evaluations.reduce((acc, curr) => acc + curr.score, 0); // Max 15 points

    const answersRecord: Record<string, string> = {};
    evaluations.forEach((ev) => {
      answersRecord[ev.attribute] = ev.answer;
    });

    const updatedPlayers = players.map((p, idx) => {
      if (idx !== activePlayerIndex) return p;
      return {
        ...p,
        preTestCompleted: true,
        preTestScore: totalScore,
        preTestAnswers: answersRecord,
        preTestEvaluations: evaluations
      };
    });

    setPlayers(updatedPlayers);

    // Save updated room to storage
    const updatedRoom: GameRoom = {
      ...room,
      players: updatedPlayers
    };
    StorageService.saveActiveGameRoom(updatedRoom);
    StorageService.saveRoom(updatedRoom);

    // Update currentUser if this player is currentUser
    const activePlayer = updatedPlayers[activePlayerIndex];
    if (currentUser && (activePlayer.userId === currentUser.id || activePlayer.fullName.trim() === currentUser.fullName.trim())) {
      StorageService.updateUser(currentUser.id, {
        preTestCompleted: true,
        preTestScore: totalScore,
        preTestAnswers: answersRecord
      });
    }

    setViewMode('player_summary');
  };

  const startTestForPlayer = (playerIndex: number) => {
    setActivePlayerIndex(playerIndex);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setCurrentEvaluations([]);
    setLastQuestionFeedback(null);
    setViewMode('testing');
  };

  const handleNextPlayerOrFinish = () => {
    // Check next incomplete player
    const nextIncompleteIndex = players.findIndex((p) => !p.preTestCompleted);
    if (nextIncompleteIndex >= 0) {
      startTestForPlayer(nextIncompleteIndex);
    } else {
      setViewMode('all_done');
    }
  };

  const handleProceedToGameBoard = () => {
    const updatedRoom: GameRoom = {
      ...room,
      players: players
    };
    StorageService.saveActiveGameRoom(updatedRoom);
    StorageService.saveRoom(updatedRoom);
    onAllCompleted(updatedRoom);
  };

  const activePlayer = players[activePlayerIndex] || players[0];
  const activeRole = activePlayer ? ROLES[activePlayer.role] : ROLES.government;
  const currentScenario = DEFAULT_SCENARIOS[currentQuestionIndex];

  // Calculate team total pre-test score (out of 90)
  const teamTotalScore = players.reduce((sum, p) => sum + (p.preTestScore || 0), 0);
  const teamAverageScore = (teamTotalScore / (players.length || 6)).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-['Prompt',sans-serif] space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              แบบทดสอบประเมินคุณลักษณะก่อนเล่น (Pre-Test AI Assessment)
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              สถานการณ์จำลองต้านทุจริต 5 ข้อ (อัตนัย • ข้อละ 30 วินาที • รวม 15 คะแนน)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-1 max-w-2xl">
              ประเมินคุณลักษณะ 5 ประการ (คิด, วินัย, ซื่อสัตย์, พอเพียง, จิตสาธารณะ) โดยผู้เล่นทั้ง 6 คนเลือกยืนยันบทบาทและทำแบบทดสอบทีละคนจนครบทุกคน
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-xs font-bold text-white bg-[#0A192F] px-3 py-1.5 rounded-xl border border-[#233554]">
              ห้อง: {room.roomCode}
            </span>
            {onBackToLobby && (
              <button
                type="button"
                onClick={onBackToLobby}
                className="px-3 py-1.5 bg-[#0A192F] hover:bg-[#1E3A8A] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-[#233554] transition-colors"
              >
                ← ออกสู่ล็อบบี้
              </button>
            )}
          </div>
        </div>

        {/* 6 Players Progress Pill */}
        <div className="mt-5 pt-4 border-t border-[#233554]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">
              สถานะความพร้อม: <strong className="text-white">{players.filter((p) => p.preTestCompleted).length} / 6 คน</strong>
            </span>
          </div>

          {/* Mini progress dots */}
          <div className="flex items-center gap-1.5">
            {players.map((p, idx) => {
              const r = ROLES[p.role];
              return (
                <div
                  key={idx}
                  title={`${r.name}: ${p.fullName} (${p.preTestCompleted ? 'ผ่านแล้ว ' + p.preTestScore + '/15' : 'รอทำ'})`}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border transition-all ${
                    p.preTestCompleted
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                      : idx === activePlayerIndex && viewMode === 'testing'
                      ? 'bg-blue-600 text-white border-blue-400 animate-pulse'
                      : 'bg-[#0A192F] text-slate-400 border-[#233554]'
                  }`}
                >
                  <span>{r.badge}</span>
                  <span className="hidden sm:inline">{r.name}</span>
                  {p.preTestCompleted && <span>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= VIEW 1: PLAYER ROLE SELECTION & CONFIRMATION ================= */}
      {viewMode === 'player_select' && (
        <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              เลือกบทบาทของคุณเพื่อยืนยันตัวตน และเริ่มทำแบบทดสอบ
            </h2>
            <p className="text-xs text-slate-300 font-light">
              ผู้เล่นทั้ง 6 คนจะสลับกันทำแบบทดสอบคนละ 5 ข้อ (ข้อละ 30 วินาที ข้อสอบข้อละ 3 คะแนน ประมวลผลรวม 15 คะแนน)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, idx) => {
              const roleInfo = ROLES[player.role];
              const isDone = !!player.preTestCompleted;
              const isCurrentUser = currentUser && (player.userId === currentUser.id || player.fullName.trim() === currentUser.fullName.trim());

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    isDone
                      ? 'bg-[#0A192F]/60 border-emerald-600/40'
                      : isCurrentUser
                      ? 'bg-[#0A192F] border-blue-500/60 ring-2 ring-blue-500/20'
                      : 'bg-[#0A192F] border-[#233554] hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#233554]/60">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#112240] border border-[#233554] flex items-center justify-center text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-xs text-white">
                          {roleInfo.badge} {roleInfo.name}
                        </span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isDone
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
                          : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                      }`}>
                        {isDone ? `ได้ ${player.preTestScore} / 15 คะแนน` : 'รอทำแบบทดสอบ'}
                      </span>
                    </div>

                    <div className="my-3 space-y-1">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{player.prefix} {player.fullName}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-blue-300 bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                            (คุณ)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {roleInfo.duty}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => startTestForPlayer(idx)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                      isDone
                        ? 'bg-[#112240] hover:bg-[#1E3A8A] text-slate-300 hover:text-white border border-[#233554]'
                        : 'bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ทำแบบทดสอบซ้ำ / ดูผล</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>ยืนยันตัวตนและเริ่มทำแบบทดสอบ</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* If all done button */}
          {players.every((p) => p.preTestCompleted) && (
            <div className="pt-4 border-t border-[#233554] flex justify-center">
              <button
                type="button"
                onClick={handleProceedToGameBoard}
                className="py-4 px-8 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl font-bold shadow-xl shadow-emerald-950 text-sm flex items-center gap-3 transition-all transform hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>ผู้เล่นครบทั้ง 6 คนแล้ว • เข้าสู่กระดานบอร์ดเกม</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: TESTING 5 QUESTIONS (30s TIMED) ================= */}
      {viewMode === 'testing' && (
        <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          
          {/* Header of Active Testing Player */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#233554] gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-inner"
                style={{ backgroundColor: `${activeRole.color}20`, borderColor: activeRole.color }}
              >
                {activeRole.badge}
              </div>
              <div>
                <div className="text-[11px] text-blue-300 font-semibold uppercase tracking-wider">
                  กำลังทำแบบทดสอบ (ผู้เล่นคนที่ {activePlayerIndex + 1}/6)
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{activePlayer.prefix} {activePlayer.fullName}</span>
                  <span className="text-xs font-normal text-slate-300">
                    (บทบาท: {activeRole.name})
                  </span>
                </h2>
              </div>
            </div>

            {/* Countdown Timer Display (30s per question) */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 font-mono font-bold text-base shadow-lg transition-all ${
                timeLeft <= 5
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500 animate-pulse'
                  : timeLeft <= 10
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                  : 'bg-[#0A192F] text-blue-300 border-blue-500/40'
              }`}>
                <Clock className="w-5 h-5" />
                <span>{timeLeft} วินาที</span>
              </div>
            </div>
          </div>

          {/* Question Progress Bar (1 to 5) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white">
                ข้อที่ {currentQuestionIndex + 1} จาก 5 ข้อ (ข้อสอบข้อละ 3 คะแนน)
              </span>
              <span>คะแนนสะสม: {currentEvaluations.reduce((acc, c) => acc + c.score, 0)} / 15 คะแนน</span>
            </div>
            <div className="w-full h-2 bg-[#0A192F] rounded-full overflow-hidden border border-[#233554]">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Scenario & Question Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0A192F] border border-[#233554] space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-500/30 text-blue-200 text-xs font-semibold">
              <Brain className="w-3.5 h-3.5 text-blue-300" />
              <span>{currentScenario.title}</span>
            </div>

            <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
              {currentScenario.scenarioText}
            </p>

            <div className="p-3 rounded-xl bg-[#112240]/80 border border-[#233554] text-xs text-slate-300 font-light italic">
              💡 {currentScenario.guideline}
            </div>

            {/* Answer Textarea */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                คำตอบอัตนัยของคุณ (วิเคราะห์และตัดสินใจอย่างสุจริต):
              </label>
              <textarea
                rows={4}
                autoFocus
                disabled={isEvaluating}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="พิมพ์การวิเคราะห์และการตัดสินใจของคุณที่นี่... (ระบบประเมิน 3 คะแนนเต็ม)"
                className="w-full px-4 py-3 bg-[#112240] border border-[#233554] rounded-2xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all leading-relaxed"
              />
            </div>

            {/* Instant AI Evaluation Feedback */}
            {lastQuestionFeedback && (
              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 text-xs flex items-start gap-2 animate-fade-in">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>ผลการประเมินข้อนี้: ได้รับ {lastQuestionFeedback.score} / 3 คะแนน</strong>
                  <p className="text-slate-300 mt-0.5">{lastQuestionFeedback.feedback}</p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-400">
                {timeLeft <= 5 ? '⚠️ เวลาใกล้หมดแล้ว ระบบจะส่งคำตอบโดยอัตโนมัติ' : 'ตอบเสร็จแล้วสามารถกดส่งเพื่อไปข้อถัดไปได้ทันที'}
              </div>

              <button
                type="button"
                disabled={isEvaluating}
                onClick={() => handleSubmitQuestion(false)}
                className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>
                  {currentQuestionIndex < 4 ? 'ส่งคำตอบและไปข้อถัดไป (3 คะแนน)' : 'ส่งคำตอบข้อสุดท้ายและประมวลผล (รวม 15 คะแนน)'}
                </span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ================= VIEW 3: SINGLE PLAYER SUMMARY SCORECARD ================= */}
      {viewMode === 'player_summary' && (
        <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-600 to-amber-900 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-xl text-3xl">
              🏆
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ทำแบบทดสอบประเมินคุณลักษณะสำเร็จ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activePlayer.prefix} {activePlayer.fullName}
            </h2>
            <p className="text-xs text-slate-300">
              บทบาท: <strong className="text-white">{activeRole.badge} {activeRole.name}</strong>
            </p>
          </div>

          {/* Big Score Display (Out of 15 points) */}
          <div className="bg-[#0A192F] border-2 border-blue-500/40 rounded-3xl p-6 text-center max-w-md mx-auto shadow-xl">
            <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
              คะแนนประเมินคุณลักษณะรวม (Pre-Test Score)
            </div>
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 my-2">
              {activePlayer.preTestScore || 0} <span className="text-lg text-slate-400 font-normal">/ 15 คะแนน</span>
            </div>
            <p className="text-xs text-blue-300">
              {(activePlayer.preTestScore || 0) >= 12 
                ? 'ระดับยอดเยี่ยม • พร้อมนำคุณลักษณะ 5 ประการไปปฏิบัติจริงในเกม' 
                : (activePlayer.preTestScore || 0) >= 9
                ? 'ระดับดีมาก • มีความเข้าใจและตระหนักรู้ในการต่อต้านการทุจริต'
                : 'ระดับมาตรฐาน • พร้อมร่วมมือพัฒนาเมืองสุจริต'}
            </p>
          </div>

          {/* 5 Questions Evaluation Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ผลการประเมินทั้ง 5 ข้อตามคุณลักษณะ 5 ประการ:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(activePlayer.preTestEvaluations || []).map((ev, i) => {
                const attrInfo = INTEGRITY_ATTRIBUTES[ev.attribute];
                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-[#0A192F] border border-[#233554] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <span>{attrInfo?.icon || '📝'}</span>
                        <span>{attrInfo?.name || ev.attribute}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 font-bold text-[11px] border border-blue-500/30">
                        {ev.score} / 3 แต้ม
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">
                      คำตอบ: "{ev.answer}"
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      ✓ {ev.feedback}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="pt-4 border-t border-[#233554] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewMode('player_select')}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#0A192F] hover:bg-[#112240] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-[#233554] transition-colors"
            >
              ← กลับไปหน้ารายชื่อผู้เล่น
            </button>

            <button
              type="button"
              onClick={handleNextPlayerOrFinish}
              className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>ส่งต่อให้ผู้เล่นคนถัดไป</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ================= VIEW 4: ALL 6 PLAYERS COMPLETED ================= */}
      {viewMode === 'all_done' && (
        <div className="bg-[#112240] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-fade-in">
          
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-2xl text-4xl">
            🏙️
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              ✓ ประเมินคุณลักษณะก่อนเล่นครบทั้ง 6 คนแล้ว
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ทีมผู้เล่นทั้ง 6 บทบาทพร้อมปฏิบัติภารกิจ!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-light">
              ผลการประเมินเฉลี่ยทีม: <strong className="text-amber-300 font-bold">{teamAverageScore} / 15 คะแนน</strong> (คะแนนรวมทีม {teamTotalScore} / 90 คะแนน)
            </p>
          </div>

          {/* 6 Players Final Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
            {players.map((p, idx) => {
              const r = ROLES[p.role];
              return (
                <div key={idx} className="p-3 rounded-2xl bg-[#0A192F] border border-emerald-600/40 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1 truncate">
                    <span>{r.badge}</span>
                    <span className="truncate">{p.fullName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{r.name}</div>
                  <div className="text-xs font-extrabold text-amber-300">
                    {p.preTestScore || 0} / 15 แต้ม
                  </div>
                </div>
              );
            })}
          </div>

          {/* Big Launch Game Board Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setViewMode('player_select')}
              className="px-5 py-3 bg-[#0A192F] hover:bg-[#112240] text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-[#233554] transition-colors"
            >
              ดูรายละเอียดคะแนนรายคน
            </button>

            <button
              type="button"
              onClick={handleProceedToGameBoard}
              className="py-4 px-10 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl font-black shadow-2xl text-sm sm:text-base flex items-center gap-3 transition-all transform hover:-translate-y-1"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>เข้าสู่กระดานบอร์ดเกม Smart Integrity City (เริ่มเล่นเกม)</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
