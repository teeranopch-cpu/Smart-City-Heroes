import React from 'react';
import { 
  Trophy, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Award, 
  RotateCcw, 
  Download, 
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { GameRoom, ROLES, INTEGRITY_ATTRIBUTES, AttributeKey } from '../types';
import { StorageService } from '../storage';

interface GameSummaryModalProps {
  room: GameRoom;
  onClose: () => void;
  onGoToPostTest: () => void;
  onRestartNewRoom: () => void;
}

export const GameSummaryModal: React.FC<GameSummaryModalProps> = ({
  room,
  onClose,
  onGoToPostTest,
  onRestartNewRoom
}) => {
  // Check if City Passed
  const isCitySaved = room.cityIntegrity >= 100;

  // Calculate scores for each player
  // Total Score = (missionStep * 20) + coopPoints + personalIntegrity
  const rankedPlayers = [...room.players]
    .map((p) => {
      const missionPoints = p.missionStep * 20;
      const totalScore = missionPoints + p.coopPoints + p.personalIntegrity;
      return {
        ...p,
        missionPoints,
        totalScore
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const winner = rankedPlayers[0];

  // Archive game room into history on load
  React.useEffect(() => {
    StorageService.archiveGameRoom(room);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#112240] border border-[#233554] rounded-3xl shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Top Header Badge */}
        <div className="text-center pb-6 border-b border-[#233554]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-200 text-xs font-semibold mb-3">
            <span>หมายเลขห้อง: {room.roomCode}</span>
            <span>•</span>
            <span>ชุดสื่อการสอน: {room.mediaKitCode}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            สรุปผลการปฏิบัติการ Smart Integrity City
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {room.gameOverReason || 'สรุปคะแนนและประเมินคุณลักษณะ 5 ประการของโรงเรียนสุจริต'}
          </p>
        </div>

        {/* 1) City Integrity Index Outcome: Passed or Collective Loss */}
        <div className={`mt-6 p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isCitySaved 
            ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200' 
            : 'bg-rose-950/40 border-rose-600/50 text-rose-200'
        }`}>
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className={`p-3 rounded-2xl ${isCitySaved ? 'bg-emerald-900/60' : 'bg-rose-900/60'}`}>
              {isCitySaved ? (
                <ShieldCheck className="w-8 h-8 text-emerald-300" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider">
                {isCitySaved ? 'ดัชนีเมืองสุจริต: ผ่านเกณฑ์ความยั่งยืน' : 'ดัชนีเมืองสุจริต: เมืองล่มสลายจากคอร์รัปชัน (แพ้ร่วมกัน)'}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {isCitySaved
                  ? `เมืองมีความโปร่งใสสูงด้วยคะแนนคงเหลือ ${room.cityIntegrity} แต้ม (เกณฑ์ขั้นต่ำ 100 แต้ม) พลเมืองทุกคนชนะร่วมกัน!`
                  : `ดัชนีเมืองคงเหลือ ${room.cityIntegrity} แต้ม ซึ่งต่ำกว่าเกณฑ์ 100 แต้ม ส่งผลให้เกิดความเสียหายและแพ้ร่วมกันทั้งหมด`}
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right flex-shrink-0">
            <div className="text-3xl font-black">{room.cityIntegrity}</div>
            <div className="text-[11px] text-slate-300">แต้มดัชนีเมืองสุจริต</div>
          </div>
        </div>

        {/* 2) Winner Announcement Card */}
        {winner && isCitySaved && (
          <div className="mt-6 bg-gradient-to-r from-amber-950/50 via-[#1E3A8A]/40 to-amber-950/50 border border-amber-500/40 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 shadow-md">
                <Trophy className="w-8 h-8 text-amber-300" />
              </div>
            </div>
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-widest mb-1">
              ผู้ชนะเลิศผู้นำคุณธรรมสุจริตอันดับ 1
            </div>
            <div className="text-2xl font-black text-white">
              {winner.fullName}
            </div>
            <div className="text-xs text-blue-200 mt-1">
              บทบาท: {ROLES[winner.role].name} ({ROLES[winner.role].nameEn})
            </div>
            <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-bold">
              คะแนนรวมสูงสุด: {winner.totalScore} แต้ม
            </div>
          </div>
        )}

        {/* 3) Player Leaderboard & Score Breakdown */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-300" />
              สรุปคะแนนรวมของผู้เล่นแต่ละคน (4 องค์ประกอบ)
            </div>
            <span>{room.players.length} บทบาท</span>
          </div>

          <div className="space-y-2">
            {rankedPlayers.map((player, rank) => {
              const roleInfo = ROLES[player.role];
              return (
                <div
                  key={player.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
                    rank === 0 && isCitySaved
                      ? 'bg-[#1E3A8A]/30 border-amber-500/50 shadow-md'
                      : 'bg-[#0A192F] border-[#233554]'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      rank === 0 ? 'bg-amber-400 text-slate-900 font-extrabold' : 'bg-[#112240] text-slate-400'
                    }`}>
                      {rank + 1}
                    </span>
                    <span className="text-2xl">{roleInfo.badge}</span>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {player.fullName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {roleInfo.name} ({roleInfo.nameEn})
                      </div>
                    </div>
                  </div>

                  {/* 4 Score Breakdown Items */}
                  <div className="flex flex-wrap items-center justify-around sm:justify-end gap-4 w-full sm:w-auto text-xs">
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-slate-400">ภารกิจ 3 ขั้น</div>
                      <div className="font-semibold text-blue-300">{player.missionStep}/3 ({player.missionPoints} แต้ม)</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-slate-400">แต้มร่วมมือ</div>
                      <div className="font-semibold text-emerald-400">{player.coopPoints} แต้ม</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-slate-400">ดัชนีชีวิต</div>
                      <div className="font-semibold text-sky-300">{player.personalIntegrity} แต้ม</div>
                    </div>
                    <div className="text-center sm:text-right border-l border-[#233554] pl-4">
                      <div className="text-[10px] text-amber-300 font-medium">คะแนนรวม</div>
                      <div className="font-bold text-base text-amber-300">{player.totalScore}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4) 5 Integrity Attributes Evaluation Summary */}
        <div className="mt-8 p-5 bg-[#0A192F] border border-[#233554] rounded-2xl">
          <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
            สรุปผลการประเมินคุณลักษณะความสุจริต 5 ประการประจำห้อง {room.roomCode}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            {(Object.keys(INTEGRITY_ATTRIBUTES) as AttributeKey[]).map((key) => {
              const attr = INTEGRITY_ATTRIBUTES[key];
              return (
                <div key={key} className="p-3 bg-[#112240] rounded-xl border border-[#233554]">
                  <div className="text-xl mb-1">{attr.icon}</div>
                  <div className="text-xs font-bold text-white truncate">{attr.name}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                    ระดับดีเยี่ยม
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-[#233554] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onRestartNewRoom}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            เริ่มเล่นห้องใหม่
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#112240] border border-[#233554] text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              ปิดหน้าต่างสรุป
            </button>
            <button
              onClick={onGoToPostTest}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>ทำแบบทดสอบหลังเรียน & รับเกียรติบัตร</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
