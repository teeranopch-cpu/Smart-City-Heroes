import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Shield, 
  Play, 
  Plus, 
  Trash2, 
  Check, 
  Building2, 
  Sparkles,
  Info
} from 'lucide-react';
import { RoleKey, ROLES, GameRoom, RoomPlayer, UserAccount, MediaKit } from '../types';
import { StorageService } from '../storage';

interface RoomSetupProps {
  currentUser: UserAccount | null;
  onStartGame: (room: GameRoom) => void;
}

const AVAILABLE_ROLES: RoleKey[] = [
  'government',
  'business',
  'journalist',
  'civil_servant',
  'police',
  'citizen'
];

export const RoomSetup: React.FC<RoomSetupProps> = ({
  currentUser,
  onStartGame
}) => {
  const [mediaKits, setMediaKits] = useState<MediaKit[]>([]);
  const [selectedKitCode, setSelectedKitCode] = useState<string>('');
  const [customKitCode, setCustomKitCode] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30); // min 20
  const [initialCityIntegrity, setInitialCityIntegrity] = useState<number>(100); // min 100
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);

  // Setup players array (1 to 6 players)
  const [players, setPlayers] = useState<Array<{
    userId?: string;
    prefix: string;
    fullName: string;
    role: RoleKey;
  }>>([]);

  useEffect(() => {
    const kits = StorageService.getMediaKits();
    setMediaKits(kits);
    const users = StorageService.getUsers();
    setAllUsers(users);

    const generatedCode = 'SIC-' + Math.floor(1000 + Math.random() * 9000);
    setRoomCode(generatedCode);

    if (currentUser) {
      if (currentUser.mediaKitCode) {
        setSelectedKitCode(currentUser.mediaKitCode);
      } else if (kits.length > 0) {
        setSelectedKitCode(kits[0].code);
      }
      setPlayers([
        {
          userId: currentUser.id,
          prefix: currentUser.prefix || 'นาย',
          fullName: currentUser.fullName || '',
          role: 'government'
        },
        {
          prefix: 'นาย',
          fullName: '',
          role: 'business'
        },
        {
          prefix: 'นางสาว',
          fullName: '',
          role: 'journalist'
        },
        {
          prefix: 'นาย',
          fullName: '',
          role: 'civil_servant'
        },
        {
          prefix: 'นาย',
          fullName: '',
          role: 'police'
        },
        {
          prefix: 'นางสาว',
          fullName: '',
          role: 'citizen'
        }
      ]);
    } else {
      if (kits.length > 0) setSelectedKitCode(kits[0].code);
      setPlayers([
        { prefix: 'นาย', fullName: '', role: 'government' },
        { prefix: 'นาย', fullName: '', role: 'business' },
        { prefix: 'นางสาว', fullName: '', role: 'journalist' },
        { prefix: 'นาย', fullName: '', role: 'civil_servant' },
        { prefix: 'นาย', fullName: '', role: 'police' },
        { prefix: 'นางสาว', fullName: '', role: 'citizen' }
      ]);
    }
  }, [currentUser]);

  const addPlayer = () => {
    if (players.length >= 6) return;
    // Find first unused role
    const usedRoles = new Set(players.map((p) => p.role));
    const nextRole = AVAILABLE_ROLES.find((r) => !usedRoles.has(r)) || 'citizen';

    setPlayers([
      ...players,
      {
        prefix: 'นาย',
        fullName: `ผู้เล่นที่ ${players.length + 1}`,
        role: nextRole
      }
    ]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) return;
    setPlayers(players.filter((_, idx) => idx !== index));
  };

  const updatePlayer = (index: number, updates: Partial<{ prefix: string; fullName: string; role: RoleKey; userId: string }>) => {
    setPlayers(
      players.map((p, idx) => {
        if (idx !== index) return p;
        return { ...p, ...updates };
      })
    );
  };

  const handleSelectRegisteredUser = (playerIndex: number, userId: string) => {
    if (userId === '') {
      updatePlayer(playerIndex, { userId: undefined });
      return;
    }
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      updatePlayer(playerIndex, {
        userId: found.id,
        prefix: found.prefix,
        fullName: found.fullName
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (durationMinutes < 20) {
      alert('ระยะเวลาเล่นต้องไม่ต่ำกว่า 20 นาทีตามมาตรฐานเกม');
      return;
    }

    if (initialCityIntegrity < 100) {
      alert('ดัชนีเมืองสุจริตเริ่มต้นต้องไม่ต่ำกว่า 100 แต้ม');
      return;
    }

    if (players.length !== 6) {
      alert('บอร์ดเกมกำหนดให้ต้องมีผู้เล่นครบ 6 คนเท่านั้น');
      return;
    }

    for (let i = 0; i < players.length; i++) {
      if (!players[i].fullName.trim()) {
        alert(`กรุณากรอกชื่อ-นามสกุลให้ครบทั้ง 6 คน (ผู้เล่นคนที่ ${i + 1} ในบทบาท "${ROLES[players[i].role].name}" ยังไม่ได้กรอกชื่อ)`);
        return;
      }
    }

    // Role duplication warning check
    const roleCounts = new Map<RoleKey, number>();
    for (const p of players) {
      roleCounts.set(p.role, (roleCounts.get(p.role) || 0) + 1);
    }
    const duplicates = Array.from(roleCounts.entries()).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      const dupNames = duplicates.map(([role]) => ROLES[role].name).join(', ');
      alert(`มีบทบาทซ้ำกัน (${dupNames}) บอร์ดเกมกำหนดให้ 1 คนต่อ 1 บทบาทครบทั้ง 6 บทบาท`);
      return;
    }

    const roomPlayers: RoomPlayer[] = players.map((p, idx) => ({
      id: 'PL-' + (idx + 1) + '-' + Date.now(),
      userId: p.userId || 'GUEST-' + (idx + 1),
      prefix: p.prefix,
      fullName: p.fullName.trim() || `ผู้เล่น ${idx + 1}`,
      role: p.role,
      personalIntegrity: 0,
      coopPoints: 0,
      missionStep: 0,
      isCompletedAllMissions: false,
      history: [
        {
          id: 'LOG-INIT-' + idx,
          timestamp: new Date().toLocaleTimeString('th-TH'),
          description: `เข้าร่วมห้องในบทบาท ${ROLES[p.role].name}`,
          deltaCity: 0,
          deltaPersonal: 0,
          deltaCoop: 0
        }
      ]
    }));

    const finalKitCode = (selectedKitCode === 'custom' ? customKitCode.trim() : selectedKitCode.trim()).toUpperCase() || 'KIT-001';

    // Associate current user and participating registered players with this Media Kit Code
    if (currentUser) {
      StorageService.updateUser(currentUser.id, { mediaKitCode: finalKitCode });
    }
    players.forEach((p) => {
      if (p.userId && !p.userId.startsWith('GUEST')) {
        StorageService.updateUser(p.userId, { mediaKitCode: finalKitCode });
      }
    });

    const newGameRoom: GameRoom = {
      roomCode: roomCode.trim().toUpperCase() || 'SIC-GAME',
      mediaKitCode: finalKitCode,
      initialCityIntegrity: initialCityIntegrity,
      cityIntegrity: initialCityIntegrity,
      durationMinutes: durationMinutes,
      timeRemainingSeconds: durationMinutes * 60,
      isPaused: false,
      isGameOver: false,
      players: roomPlayers,
      currentTurnIndex: 0,
      createdAt: new Date().toISOString(),
      logs: [
        {
          id: 'LOG-START',
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: `เปิดห้องเกม ${roomCode} | ชุดสื่อ: ${finalKitCode} | ดัชนีเมืองเริ่มต้น: ${initialCityIntegrity} แต้ม | เวลา: ${durationMinutes} นาที`,
          type: 'system'
        }
      ]
    };

    StorageService.saveActiveGameRoom(newGameRoom);
    onStartGame(newGameRoom);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#112240] to-[#1E3A8A]/60 border border-[#233554] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/30 text-blue-200 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              ห้องเล่นบอร์ดเกม Smart Integrity City
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ตั้งค่าห้องผู้เล่นและบทบาทประจำเมือง
            </h1>
            <p className="text-sm text-slate-300 mt-2 font-light max-w-2xl">
              กำหนดผู้เล่น 1–6 คนจาก 6 บทบาทสุจริต เชื่อมโยงรหัสชุดสื่อการสอน และตั้งเวลาเล่นขั้นต่ำ 20 นาทีเพื่อเริ่มปฏิบัติภารกิจพลิกโฉมเมือง
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Room & Game Parameter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Media Kit Selection */}
          <div className="bg-[#112240] border border-[#233554] rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2.5 text-blue-300 font-semibold text-sm mb-3">
              <Building2 className="w-4 h-4" />
              รหัสชุดสื่อการสอน (Media Kit)
            </div>
            <select
              value={selectedKitCode}
              onChange={(e) => setSelectedKitCode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {mediaKits.map((k) => (
                <option key={k.id} value={k.code}>
                  {k.code} - {k.name}
                </option>
              ))}
              <option value="custom">ระบุรหัสชุดสื่ออื่น ๆ...</option>
            </select>

            {selectedKitCode === 'custom' && (
              <input
                type="text"
                placeholder="พิมพ์รหัสชุดสื่อ เช่น KIT-003"
                value={customKitCode}
                onChange={(e) => setCustomKitCode(e.target.value.toUpperCase())}
                className="mt-2 w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            )}

            <p className="text-[11px] text-slate-400 mt-2">
              เลือกรหัสประจำชุดสื่อการสอนที่ใช้เล่นในห้องนี้ เพื่อบันทึกประวัติการใช้สื่อ
            </p>
          </div>

          {/* Room Code */}
          <div className="bg-[#112240] border border-[#233554] rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2.5 text-blue-300 font-semibold text-sm mb-3">
              <Users className="w-4 h-4" />
              หมายเลขห้องเล่นเกม (Room Code)
            </div>
            <input
              type="text"
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white font-mono font-bold tracking-wider text-base focus:outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-2">
              ใช้สำหรับอ้างอิงส่งภาพถ่ายภารกิจและออกเกียรติบัตร
            </p>
          </div>

          {/* Time & Initial Score */}
          <div className="bg-[#112240] border border-[#233554] rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2.5 text-blue-300 font-semibold text-sm mb-3">
              <Clock className="w-4 h-4" />
              เวลาเล่น & ดัชนีเมืองเริ่มต้น
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  เวลา (ขั้นต่ำ 20 น.)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={20}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(20, parseInt(e.target.value) || 20))}
                    className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-slate-400">นาที</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ดัชนีเมือง (ขั้นต่ำ 100)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={100}
                    max={500}
                    value={initialCityIntegrity}
                    onChange={(e) => setInitialCityIntegrity(Math.max(100, parseInt(e.target.value) || 100))}
                    className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-slate-400">แต้ม</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Players & Roles Configuration */}
        <div className="bg-[#112240] border border-[#233554] rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#233554] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  รายชื่อผู้เล่นในห้อง (ต้องมีครบ 6 คน • ใส่ชื่อด้วยมือทั้งหมด)
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-500/30">
                  ครบ 6 บทบาท
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                กรอกคำนำหน้าและพิมพ์ชื่อ - นามสกุลด้วยมือให้ครบทั้ง 6 คนเพื่อเริ่มเล่นบอร์ดเกม
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {players.map((player, index) => {
              const roleInfo = ROLES[player.role];
              return (
                <div
                  key={index}
                  className="bg-[#0A192F] border border-[#233554] hover:border-[#3B5278] rounded-xl p-4 transition-all relative group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-blue-200 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        ที่นั่งผู้เล่นที่ {index + 1} {index === 0 ? '(คุณ)' : ''}
                      </span>
                    </div>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#112240] text-blue-300 border border-[#233554]">
                      {roleInfo.badge} {roleInfo.name}
                    </span>
                  </div>

                  {/* Manual Name Inputs */}
                  <div className="space-y-3">

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">
                          คำนำหน้า
                        </label>
                        <input
                          type="text"
                          value={player.prefix}
                          onChange={(e) => updatePlayer(index, { prefix: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#112240] border border-[#233554] rounded-lg text-xs text-white"
                          placeholder="นาย/ด.ช."
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[11px] text-slate-400 block mb-1">
                          ชื่อ - นามสกุล ผู้เล่น
                        </label>
                        <input
                          type="text"
                          required
                          value={player.fullName}
                          onChange={(e) => updatePlayer(index, { fullName: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#112240] border border-[#233554] rounded-lg text-xs text-white"
                          placeholder="ชื่อ - สกุล"
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        เลือกบทบาทประจำตัว (6 บทบาท)
                      </label>
                      <select
                        value={player.role}
                        onChange={(e) => updatePlayer(index, { role: e.target.value as RoleKey })}
                        className="w-full px-3 py-2 bg-[#112240] border border-[#233554] rounded-lg text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                      >
                        {AVAILABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLES[r].badge} {ROLES[r].name} ({ROLES[r].nameEn})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Role Duty Card Snippet */}
                    <div className="p-2.5 rounded-lg bg-[#112240]/80 border border-[#233554] text-[11px]">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <span>{roleInfo.badge}</span>
                        <span>{roleInfo.name}:</span>
                        <span className="text-slate-400 font-light truncate">{roleInfo.desc}</span>
                      </div>
                      <div className="text-[10px] text-blue-300/80 mt-1">
                        หน้าที่: {roleInfo.duty}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Quick Info Box on Collective Victory/Defeat */}
          <div className="mt-6 p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-200">กติกาความสุจริตของเมือง:</span> ทุกคนต้องร่วมมือกันรักษา 
              <b> "ดัชนีเมืองสุจริต"</b> ไม่ให้หมดหรือต่ำกว่าเกณฑ์ หากเมืองล่มสลายจะถือว่า <b>แพ้ร่วมกันทั้งหมด</b> 
              ในขณะเดียวกันผู้เล่นแต่ละคนต้องบรรลุ <b>ภารกิจตัวละคร 3 ขั้น</b>, สะสม <b>แต้มความร่วมมือ</b> และ 
              <b>ดัชนีชีวิตสุจริต</b> เพื่อชิงชัยเป็นผู้นำคุณธรรมของเมือง
            </div>
          </div>

          {/* Start Game Action Button */}
          <div className="mt-8 pt-6 border-t border-[#233554] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              พร้อมแล้ว? ตรวจสอบว่าผู้เล่นประจำตำแหน่งบนกระดานบอร์ดเกมเรียบร้อย
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-[#0A192F] flex items-center justify-center gap-2.5 text-sm transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              เริ่มการเล่นบอร์ดเกม Smart Integrity City
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};
