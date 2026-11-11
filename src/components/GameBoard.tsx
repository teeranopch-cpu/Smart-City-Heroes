import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Clock, 
  Play, 
  Pause, 
  Users, 
  ShieldAlert, 
  Award, 
  CheckCircle2, 
  History,
  Target,
  Sparkles,
  Plus,
  Minus,
  HelpCircle,
  Eye,
  Radio
} from 'lucide-react';
import { GameRoom, RoomPlayer, ROLES, RoleMission, CooperationMission } from '../types';
import { StorageService } from '../storage';
import { CorruptionCheckModal } from './CorruptionCheckModal';
import { RoleMissionModal } from './RoleMissionModal';

interface GameBoardProps {
  room: GameRoom;
  onUpdateRoom: (updated: GameRoom) => void;
  onEndGame: (finalRoom: GameRoom) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  room,
  onUpdateRoom,
  onEndGame
}) => {
  // Modal states
  const [isCorruptionModalOpen, setIsCorruptionModalOpen] = useState<boolean>(false);
  const [selectedPlayerForMission, setSelectedPlayerForMission] = useState<RoomPlayer | null>(null);

  // Keep a fresh reference to room so the timer NEVER overwrites player scores!
  const roomRef = useRef<GameRoom>(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  // Timer tick: uses roomRef to prevent stale closure from resetting scores!
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!room.isPaused && !room.isGameOver && room.timeRemainingSeconds > 0) {
      interval = setInterval(() => {
        const latest = roomRef.current;
        if (!latest.isPaused && !latest.isGameOver && latest.timeRemainingSeconds > 0) {
          const updated: GameRoom = {
            ...latest,
            timeRemainingSeconds: Math.max(0, latest.timeRemainingSeconds - 1)
          };
          roomRef.current = updated;
          onUpdateRoom(updated);
        }
      }, 1000);
    } else if (room.timeRemainingSeconds === 0 && !room.isGameOver) {
      handleTriggerGameOver('หมดเวลาการเล่นบอร์ดเกม');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [room.isPaused, room.isGameOver]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePause = () => {
    const latest = roomRef.current;
    const updated: GameRoom = {
      ...latest,
      isPaused: !latest.isPaused,
      logs: [
        {
          id: 'LOG-PAUSE-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: latest.isPaused ? 'เริ่มจับเวลาเกมต่อ' : 'หยุดเวลาเกมชั่วคราว',
          type: 'system'
        },
        ...latest.logs
      ]
    };
    roomRef.current = updated;
    StorageService.saveActiveGameRoom(updated);
    onUpdateRoom(updated);
  };

  const addTime5Mins = () => {
    const latest = roomRef.current;
    const updated: GameRoom = {
      ...latest,
      timeRemainingSeconds: latest.timeRemainingSeconds + 300,
      logs: [
        {
          id: 'LOG-TIME-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: 'เพิ่มเวลาเล่นอีก 5 นาที',
          type: 'system'
        },
        ...latest.logs
      ]
    };
    roomRef.current = updated;
    StorageService.saveActiveGameRoom(updated);
    onUpdateRoom(updated);
  };

  // 1-Point City Integrity Adjustment (Strictly ±1 point)
  const handleAdjustCityPoints = (delta: 1 | -1) => {
    const latest = roomRef.current;
    const newCity = Math.max(0, latest.cityIntegrity + delta);
    let isOver = latest.isGameOver;
    let reason = latest.gameOverReason;

    if (newCity <= 0) {
      isOver = true;
      reason = 'ดัชนีเมืองสุจริตลดลงเหลือ 0 เมืองตกอยู่ในภาวะล่มสลายจากคอร์รัปชัน (แพ้ร่วมกันทั้งหมด)';
    }

    const updated: GameRoom = {
      ...latest,
      cityIntegrity: newCity,
      isGameOver: isOver,
      gameOverReason: reason,
      logs: [
        {
          id: 'LOG-CITY-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: `ปรับปรุงดัชนีเมืองสุจริต ${delta > 0 ? `+${delta}` : delta} แต้ม (คงเหลือ: ${newCity} แต้ม)`,
          type: 'score'
        },
        ...latest.logs
      ]
    };

    roomRef.current = updated;
    StorageService.saveActiveGameRoom(updated);
    onUpdateRoom(updated);
  };

  // 1-Point Player Score Adjustment (Strictly ±1 point)
  const handleAdjustPlayerPoints = (
    playerId: string,
    field: 'personalIntegrity' | 'coopPoints',
    delta: 1 | -1
  ) => {
    const latest = roomRef.current;
    const targetPlayer = latest.players.find((p) => p.id === playerId);
    if (!targetPlayer) return;

    const currentVal = Number(targetPlayer[field] ?? 0);
    const newVal = Math.max(0, currentVal + delta);

    const updatedPlayers = latest.players.map((p) => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        [field]: newVal
      };
    });

    const fieldLabel = field === 'personalIntegrity' ? 'ดัชนีชีวิตสุจริต' : 'แต้มความร่วมมือ';

    const updated: GameRoom = {
      ...latest,
      players: updatedPlayers,
      logs: [
        {
          id: 'LOG-P-SCORE-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: `${targetPlayer.fullName} (${ROLES[targetPlayer.role].name}) ปรับ${fieldLabel} ${delta > 0 ? `+${delta}` : delta} แต้ม (รวม: ${newVal} แต้ม)`,
          type: 'score'
        },
        ...latest.logs
      ]
    };

    roomRef.current = updated;
    StorageService.saveActiveGameRoom(updated);
    onUpdateRoom(updated);
  };

  // Character Mission Step adjustment via [+] and [-]
  const handleAdjustMissionStep = (playerId: string, delta: 1 | -1) => {
    const latest = roomRef.current;
    const player = latest.players.find((p) => p.id === playerId);
    if (!player) return;

    const currentStep = Number(player.missionStep ?? 0);
    const newStep = Math.min(3, Math.max(0, currentStep + delta));
    if (newStep === currentStep) return;

    const isCompletedAll = newStep === 3;
    const pointDelta = delta; // +1 or -1 point

    const updatedPlayers = latest.players.map((p) => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        missionStep: newStep,
        isCompletedAllMissions: isCompletedAll,
        personalIntegrity: Math.max(0, Number(p.personalIntegrity ?? 0) + pointDelta),
        history: [
          {
            id: 'ROLE-M-' + Date.now(),
            timestamp: new Date().toLocaleTimeString('th-TH'),
            description: delta > 0 ? `ทำภารกิจผ่านขั้นที่ ${newStep}` : `ย้อนกลับภารกิจเป็นขั้นที่ ${newStep}`,
            deltaCity: pointDelta,
            deltaPersonal: pointDelta,
            deltaCoop: 0
          },
          ...p.history
        ]
      };
    });

    const newCity = Math.max(0, latest.cityIntegrity + pointDelta);

    const updated: GameRoom = {
      ...latest,
      cityIntegrity: newCity,
      players: updatedPlayers,
      logs: [
        {
          id: 'LOG-M-STEP-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: `🎯 ตัวละคร ${player.fullName} (${ROLES[player.role].name}) ปรับภารกิจเป็นขั้นที่ ${newStep} (${delta > 0 ? '+1' : '-1'} แต้มดัชนีเมือง & ชีวิตสุจริต)`,
          type: 'mission'
        },
        ...latest.logs
      ]
    };

    roomRef.current = updated;
    StorageService.saveActiveGameRoom(updated);
    onUpdateRoom(updated);
  };

  // Character Mission Completion Confirmation from Modal
  const handleConfirmMissionFromModal = (playerId: string, step: number) => {
    const latest = roomRef.current;
    const player = latest.players.find((p) => p.id === playerId);
    if (!player) return;

    const nextStep = Math.min(3, Math.max(player.missionStep + 1, step));
    const isCompletedAll = nextStep === 3;

    const updatedPlayers = latest.players.map((p) => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        missionStep: nextStep,
        isCompletedAllMissions: isCompletedAll,
        personalIntegrity: Number(p.personalIntegrity ?? 0) + 1,
        history: [
          {
            id: 'ROLE-M-' + Date.now(),
            timestamp: new Date().toLocaleTimeString('th-TH'),
            description: `ยืนยันสำเร็จภารกิจประจำตัวละครขั้นที่ ${step}`,
            deltaCity: 1,
            deltaPersonal: 1,
            deltaCoop: 0
          },
          ...p.history
        ]
      };
    });

    const newCity = Math.max(0, latest.cityIntegrity + 1);

    const updated: GameRoom = {
      ...latest,
      cityIntegrity: newCity,
      players: updatedPlayers,
      logs: [
        {
          id: 'LOG-M-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: `🎯 ยืนยันตัวละคร: ${player.fullName} (${ROLES[player.role].name}) สำเร็จภารกิจขั้นที่ ${step} (+1 แต้มดัชนีเมือง, +1 แต้มชีวิตสุจริต)`,
          type: 'mission'
        },
        ...latest.logs
      ]
    };

    roomRef.current = updated;
    StorageService.saveActiveGameRoom(updated);
    onUpdateRoom(updated);
  };

  // Corruption Investigation Result
  const handleApplyInvestigation = (
    playerId: string,
    purityPercent: number,
    cityDelta: number,
    personalDelta: number,
    reason: string
  ) => {
    const latest = roomRef.current;
    const updatedPlayers = latest.players.map((p) => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        personalIntegrity: Math.max(0, Number(p.personalIntegrity ?? 0) + personalDelta),
        history: [
          {
            id: 'CORRUPT-' + Date.now(),
            timestamp: new Date().toLocaleTimeString('th-TH'),
            description: reason,
            deltaCity: cityDelta,
            deltaPersonal: personalDelta,
            deltaCoop: 0
          },
          ...p.history
        ]
      };
    });

    const newCity = Math.max(0, latest.cityIntegrity + cityDelta);

    const updated: GameRoom = {
      ...latest,
      cityIntegrity: newCity,
      players: updatedPlayers,
      logs: [
        {
          id: 'LOG-CORRUPT-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: `🛡️ ${reason}`,
          type: 'score'
        },
        ...latest.logs
      ]
    };

    roomRef.current = updated;
    StorageService.saveActiveGameRoom(updated);
    onUpdateRoom(updated);
  };

  const handleTriggerGameOver = (reason: string) => {
    const finalRoom: GameRoom = {
      ...roomRef.current,
      isGameOver: true,
      gameOverReason: reason
    };
    onUpdateRoom(finalRoom);
    onEndGame(finalRoom);
  };

  const cityHealthColor = 
    room.cityIntegrity >= 100 
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' 
      : room.cityIntegrity >= 50 
      ? 'text-amber-400 border-amber-500/40 bg-amber-950/40' 
      : 'text-rose-400 border-rose-500/40 bg-rose-950/40 animate-pulse';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 font-['Prompt',sans-serif]">
      
      {/* ================= 1. TOP SECTION: 2 BALANCED CARDS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Card 1: ดัชนีเมืองสุจริต (คะแนนส่วนรวม) with Extra Large +1 / -1 Buttons */}
        <div className="lg:col-span-7 bg-[#112240] border-2 border-[#233554] rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-900/50 border border-blue-500/40 text-blue-300">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider block">
                  ดัชนีเมืองสุจริต (คะแนนส่วนรวม)
                </span>
                <span className="text-xs text-slate-400 font-light">
                  เป้าหมายรักษาเสถียรภาพเมือง ≥ 100 แต้ม
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cityHealthColor}`}>
              {room.cityIntegrity >= 100 ? 'เสถียรภาพสูง' : room.cityIntegrity >= 50 ? 'เฝ้าระวัง' : 'วิกฤติตกต่ำ'}
            </span>
          </div>

          {/* Large Score Display & Big +1 / -1 Buttons */}
          <div className="my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0A192F] p-5 sm:p-6 rounded-3xl border-2 border-[#233554] shadow-inner">
            <div className="flex items-baseline gap-3">
              <div className="text-6xl sm:text-7xl font-black text-white tracking-tight">
                {room.cityIntegrity}
              </div>
              <div className="text-xs sm:text-sm text-slate-400">
                แต้มสะสมเมืองสุจริต
              </div>
            </div>

            {/* Extra Large +1 / -1 Buttons for City Index */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdjustCityPoints(-1)}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border-2 border-rose-600 text-rose-200 text-2xl font-black flex items-center justify-center transition-all active:scale-95 shadow-xl"
                title="ลดคะแนนเมืองทีละ 1 แต้ม"
              >
                <Minus className="w-8 h-8 stroke-[3]" />
              </button>

              <button
                type="button"
                onClick={() => handleAdjustCityPoints(1)}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border-2 border-emerald-600 text-emerald-200 text-2xl font-black flex items-center justify-center transition-all active:scale-95 shadow-xl"
                title="เพิ่มคะแนนเมืองทีละ 1 แต้ม"
              >
                <Plus className="w-8 h-8 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* City Meter Bar */}
          <div className="w-full bg-[#0A192F] h-3.5 rounded-full overflow-hidden border border-[#233554]">
            <div
              className={`h-full transition-all duration-500 ${
                room.cityIntegrity >= 100
                  ? 'bg-emerald-500'
                  : room.cityIntegrity >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
              style={{ width: `${Math.min(100, (room.cityIntegrity / 150) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: เวลาและสถานะห้องบอร์ดเกม (Game Timer & Controls) */}
        <div className="lg:col-span-5 bg-[#112240] border-2 border-[#233554] rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-300" />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                เวลาห้อง: {room.roomCode}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-300 bg-[#0A192F] px-2.5 py-1 rounded-lg border border-[#233554]">
              ชุดสื่อ: {room.mediaKitCode}
            </span>
          </div>

          <div className="my-4 flex items-center justify-center">
            <span className={`text-5xl sm:text-6xl font-mono font-black tracking-wider ${
              room.timeRemainingSeconds <= 300 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}>
              {formatTime(room.timeRemainingSeconds)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={togglePause}
              className={`py-3.5 px-2 rounded-2xl text-xs sm:text-sm font-bold border flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                room.isPaused
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                  : 'bg-[#1E3A8A] border-blue-500/50 text-white hover:bg-blue-600'
              }`}
            >
              {room.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              <span>{room.isPaused ? 'เล่นต่อ' : 'พักชั่วคราว'}</span>
            </button>

            <button
              onClick={addTime5Mins}
              className="py-3.5 px-2 rounded-2xl text-xs sm:text-sm font-bold bg-[#0A192F] border border-[#233554] text-slate-200 hover:text-white hover:bg-[#1E3A8A]/30 transition-all shadow-md active:scale-95"
            >
              +5 นาที
            </button>

            <button
              onClick={() => handleTriggerGameOver('ผู้เล่นสรุปจบเกม')}
              className="py-3.5 px-2 rounded-2xl text-xs sm:text-sm font-bold bg-rose-950/60 border border-rose-700/60 text-rose-200 hover:bg-rose-900/80 transition-all shadow-md active:scale-95"
            >
              สรุปจบเกม
            </button>
          </div>
        </div>

      </div>

      {/* ================= 2. ช่องการ์ดตรวจสอบทุจริต (ช่องคำถามท้าทายถูกลบออกตามคำสั่ง) ================= */}
      <div className="bg-gradient-to-r from-[#112240] via-amber-950/30 to-[#112240] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500/50 text-amber-300 shadow-xl">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-900/60 text-amber-200 text-xs font-bold border border-amber-500/30 mb-1.5">
              ช่องตรวจสอบบนบอร์ดเกม
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              ช่องการ์ดตรวจสอบทุจริต (Anti-Corruption Check)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-1 max-w-2xl leading-relaxed">
              เมื่อผู้เล่นเดินตกช่องตรวจสอบทุจริต ให้เปิดการ์ดเพื่ออ่านสถานการณ์และคำถามก่อน จากนั้นกดปุ่มเริ่มทำข้อสอบเพื่อจับเวลาชี้แจง 30 วินาที
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCorruptionModalOpen(true)}
          className="py-4 px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-2xl text-sm sm:text-base shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 whitespace-nowrap border border-amber-400/40"
        >
          <ShieldAlert className="w-5 h-5" />
          <span>เปิดการ์ดตรวจสอบทุจริต (อ่านคำถาม & นับเวลา 30 วิ)</span>
        </button>
      </div>

      {/* ================= 3. สถานะและคะแนนผู้เล่นทั้ง 6 บทบาท (ภารกิจตัวละครเปลี่ยนเป็นปุ่ม บวก ลบ) ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-400" />
            <span>สถานะและคะแนนผู้เล่นทั้ง {room.players.length} บทบาท</span>
          </h2>
          <span className="text-xs text-slate-400">
            ปรับคะแนนและภารกิจทีละ 1 แต้มเสมอ (+/-) • ปุ่มขนาดใหญ่ชัดเจน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {room.players.map((player) => {
            const roleInfo = ROLES[player.role];

            return (
              <div
                key={player.id}
                className="bg-[#112240] border-2 border-[#233554] hover:border-blue-500/50 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all"
              >
                {/* Character Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0A192F] border-2 border-blue-400/40 flex items-center justify-center text-2xl shadow-inner">
                      {roleInfo.badge}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base leading-tight">
                        {player.fullName}
                      </div>
                      <div className="text-xs text-blue-300 font-medium">
                        {roleInfo.name} ({roleInfo.nameEn})
                      </div>
                    </div>
                  </div>

                  {/* Button to view mission details */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlayerForMission(player)}
                    title="คลิกเพื่อดูรายละเอียดภารกิจและเป้าหมายตามบทบาท"
                    className="p-2 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] text-blue-300 hover:text-white border border-[#233554] text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูภารกิจ</span>
                  </button>
                </div>

                {/* Score Controls Group (Large +/- Buttons Everywhere) */}
                <div className="space-y-3">
                  
                  {/* 1) ภารกิจตัวละคร (ปรับเปลี่ยนเป็นการกดบวก ลบ ตามคำสั่ง!) */}
                  <div className="bg-[#0A192F] p-4 rounded-2xl border-2 border-amber-600/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-amber-400" />
                        ภารกิจตัวละคร
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5">
                        ขั้นที่ {player.missionStep}{' '}
                        <span className="text-xs font-normal text-slate-400">/ 3 ขั้น</span>
                      </div>
                      <div className="text-[11px] text-amber-400/80 font-medium mt-0.5">
                        {player.missionStep >= 3 ? '✓ สำเร็จครบ 3 ขั้น' : `กำลังทำขั้นที่ ${player.missionStep + 1}`}
                      </div>
                    </div>

                    {/* Large + / - Buttons for Character Mission */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={player.missionStep <= 0}
                        onClick={() => handleAdjustMissionStep(player.id, -1)}
                        className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-95 shadow-md ${
                          player.missionStep <= 0
                            ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-rose-950/80 hover:bg-rose-900 border-rose-600/60 text-rose-200 text-xl font-black cursor-pointer'
                        }`}
                        title="ลดย้อนขั้นภารกิจ (-1 แต้ม)"
                      >
                        <Minus className="w-6 h-6 stroke-[3]" />
                      </button>

                      <button
                        type="button"
                        disabled={player.missionStep >= 3}
                        onClick={() => handleAdjustMissionStep(player.id, 1)}
                        className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-95 shadow-md ${
                          player.missionStep >= 3
                            ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-amber-950/80 hover:bg-amber-900 border-amber-600/60 text-amber-200 text-xl font-black cursor-pointer'
                        }`}
                        title="เพิ่ม/ยืนยันผ่านภารกิจขั้นถัดไป (+1 แต้ม)"
                      >
                        <Plus className="w-6 h-6 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* 2) แต้มความร่วมมือ (Cooperation Points) with Large +/- Buttons */}
                  <div className="bg-[#0A192F] p-4 rounded-2xl border border-[#233554] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">
                        แต้มความร่วมมือ
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
                        {player.coopPoints}{' '}
                        <span className="text-xs font-normal text-slate-400">แต้ม</span>
                      </div>
                    </div>

                    {/* Large + / - Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustPlayerPoints(player.id, 'coopPoints', -1)}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 flex items-center justify-center transition-all active:scale-95 shadow-md"
                        title="ลดแต้มความร่วมมือทีละ 1 แต้ม"
                      >
                        <Minus className="w-6 h-6 stroke-[3]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdjustPlayerPoints(player.id, 'coopPoints', 1)}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 flex items-center justify-center transition-all active:scale-95 shadow-md"
                        title="เพิ่มแต้มความร่วมมือทีละ 1 แต้ม"
                      >
                        <Plus className="w-6 h-6 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                  {/* 3) ดัชนีชีวิตสุจริต (Personal Integrity Score) with Large +/- Buttons */}
                  <div className="bg-[#0A192F] p-4 rounded-2xl border border-[#233554] flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">
                        ดัชนีชีวิตสุจริต
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-blue-300 mt-0.5">
                        {player.personalIntegrity}{' '}
                        <span className="text-xs font-normal text-slate-400">แต้ม</span>
                      </div>
                    </div>

                    {/* Large + / - Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAdjustPlayerPoints(player.id, 'personalIntegrity', -1)}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-200 flex items-center justify-center transition-all active:scale-95 shadow-md"
                        title="ลดดัชนีชีวิตสุจริตทีละ 1 แต้ม"
                      >
                        <Minus className="w-6 h-6 stroke-[3]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAdjustPlayerPoints(player.id, 'personalIntegrity', 1)}
                        className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-blue-950/80 hover:bg-blue-900 border border-blue-600/60 text-blue-200 flex items-center justify-center transition-all active:scale-95 shadow-md"
                        title="เพิ่มดัชนีชีวิตสุจริตทีละ 1 แต้ม"
                      >
                        <Plus className="w-6 h-6 stroke-[3]" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Total Calculated Score */}
                <div className="pt-2 border-t border-[#233554] flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">คะแนนสะสมรวม:</span>
                  <span className="font-extrabold text-amber-300 text-base">
                    {(player.missionStep * 10) + player.coopPoints + player.personalIntegrity} แต้ม
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 4. LIVE ACTIVITY HISTORY LOG ================= */}
      <div className="bg-[#112240] border-2 border-[#233554] rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#233554]">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            <History className="w-5 h-5 text-blue-400" />
            <span>บันทึกประวัติการตัดสินใจและการให้คะแนน (Live History)</span>
          </div>
          <span className="text-xs text-slate-400">
            {room.logs.length} รายการ
          </span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
          {room.logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#0A192F] border border-[#233554] flex items-start justify-between gap-3"
            >
              <div className="text-slate-300 leading-relaxed">
                {log.message}
              </div>
              <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* 1) Character Role Mission Modal (คลิกดูภารกิจของตัวละครเพื่ออ่านรายละเอียดและกดยืนยัน) */}
      {selectedPlayerForMission && (
        <RoleMissionModal
          isOpen={true}
          onClose={() => setSelectedPlayerForMission(null)}
          player={selectedPlayerForMission}
          mediaKitCode={room.mediaKitCode}
          onConfirmMissionCompleted={handleConfirmMissionFromModal}
        />
      )}

      {/* 2) Corruption Check Modal (เริ่มใช้การ์ดตรวจสอบทุจริต ต้องให้ผู้เล่นอ่านคำถามก่อน แล้วกดเริ่มทำข้อสอบและนับเวลา) */}
      {isCorruptionModalOpen && (
        <CorruptionCheckModal
          isOpen={true}
          onClose={() => setIsCorruptionModalOpen(false)}
          activeRoom={room}
          onApplyInvestigationResult={handleApplyInvestigation}
        />
      )}

    </div>
  );
};
