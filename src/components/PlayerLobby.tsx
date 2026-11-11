import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  History, 
  Search, 
  Building2, 
  Users, 
  Clock, 
  ShieldCheck, 
  Award, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronRight,
  Eye,
  Camera
} from 'lucide-react';
import { 
  UserAccount, 
  GameRoom, 
  RoomPlayer, 
  RoleKey, 
  ROLES, 
  MediaKit 
} from '../types';
import { StorageService } from '../storage';

interface PlayerLobbyProps {
  currentUser: UserAccount;
  onStartRoomGame: (room: GameRoom) => void;
  onResumeGame: (room: GameRoom) => void;
  onViewCertificate: (room: GameRoom) => void;
}

const AVAILABLE_ROLES: RoleKey[] = [
  'government',
  'business',
  'journalist',
  'civil_servant',
  'police',
  'citizen'
];

export const PlayerLobby: React.FC<PlayerLobbyProps> = ({
  currentUser,
  onStartRoomGame,
  onResumeGame,
  onViewCertificate
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'search'>('create');
  const [mediaKits, setMediaKits] = useState<MediaKit[]>([]);
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  
  // Create Room State
  const [roomCode, setRoomCode] = useState<string>('');
  const [selectedKitCode, setSelectedKitCode] = useState<string>('');
  const [customKitCode, setCustomKitCode] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30); // min 20
  const [initialCityIntegrity, setInitialCityIntegrity] = useState<number>(100); // min 100
  const [players, setPlayers] = useState<Array<{
    userId?: string;
    prefix: string;
    fullName: string;
    role: RoleKey;
  }>>([]);

  // Search Room State
  const [searchCodeInput, setSearchCodeInput] = useState<string>('');
  const [searchedRoom, setSearchedRoom] = useState<GameRoom | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [joinSelectedRole, setJoinSelectedRole] = useState<RoleKey>('citizen');
  const [activeRoomsList, setActiveRoomsList] = useState<GameRoom[]>([]);

  // User History State
  const [userInProgressRooms, setUserInProgressRooms] = useState<GameRoom[]>([]);
  const [userCompletedRooms, setUserCompletedRooms] = useState<GameRoom[]>([]);
  const [selectedHistoryRoomForDetail, setSelectedHistoryRoomForDetail] = useState<GameRoom | null>(null);

  useEffect(() => {
    refreshLobbyData();
  }, [currentUser]);

  const refreshLobbyData = () => {
    const kits = StorageService.getMediaKits();
    setMediaKits(kits);
    const users = StorageService.getUsers();
    setAllUsers(users);

    // Initial kit selection
    if (kits.length > 0 && !selectedKitCode) {
      setSelectedKitCode(kits[0].code);
    }

    // Auto-generate room code
    if (!roomCode) {
      setRoomCode('SIC-' + Math.floor(1000 + Math.random() * 9000));
    }

    // Setup exactly 6 players for all 6 distinct roles
    if (players.length !== 6) {
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
    }

    // Fetch user records
    const records = StorageService.getUserRoomRecords(currentUser.id, currentUser.fullName);
    setUserInProgressRooms(records.inProgress);
    setUserCompletedRooms(records.completed);

    // Fetch all active rooms for the search tab
    const all = StorageService.getAllRooms().filter((r) => !r.isGameOver);
    setActiveRoomsList(all);
  };

  const handleUpdatePlayer = (index: number, updates: Partial<{ userId: string; prefix: string; fullName: string; role: RoleKey }>) => {
    setPlayers(
      players.map((p, idx) => {
        if (idx !== index) return p;
        return { ...p, ...updates };
      })
    );
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (durationMinutes < 20) {
      alert('ระยะเวลาเล่นต้องไม่ต่ำกว่า 20 นาทีตามมาตรฐานบอร์ดเกม');
      return;
    }
    if (initialCityIntegrity < 100) {
      alert('ดัชนีเมืองสุจริตเริ่มต้นต้องไม่ต่ำกว่า 100 แต้ม');
      return;
    }

    // Must be exactly 6 players
    if (players.length !== 6) {
      alert('บอร์ดเกมกำหนดให้ต้องมีผู้เล่นครบ 6 คนเท่านั้น');
      return;
    }

    // Check all 6 players have names entered manually
    for (let i = 0; i < players.length; i++) {
      if (!players[i].fullName.trim()) {
        alert(`กรุณากรอกชื่อ-นามสกุลให้ครบทั้ง 6 คน (ผู้เล่นคนที่ ${i + 1} ในบทบาท "${ROLES[players[i].role].name}" ยังไม่ได้กรอกชื่อ)`);
        return;
      }
    }

    // Check duplicate roles
    const roleCounts = new Map<RoleKey, number>();
    for (const p of players) {
      roleCounts.set(p.role, (roleCounts.get(p.role) || 0) + 1);
    }
    const duplicates = Array.from(roleCounts.entries()).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      const dupNames = duplicates.map(([role]) => ROLES[role].name).join(', ');
      alert(`มีบทบาทซ้ำกัน (${dupNames}) บอร์ดเกม 6 คนกำหนดให้ 1 คนต่อ 1 บทบาทครบทั้ง 6 บทบาท`);
      return;
    }

    const finalKitCode = (selectedKitCode === 'custom' ? customKitCode.trim() : selectedKitCode.trim()).toUpperCase() || 'KIT-001';

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

    // Update user's media kit
    StorageService.updateUser(currentUser.id, { mediaKitCode: finalKitCode });

    const newGameRoom: GameRoom = {
      roomCode: roomCode.trim().toUpperCase() || 'SIC-GAME',
      mediaKitCode: finalKitCode,
      initialCityIntegrity: initialCityIntegrity,
      cityIntegrity: initialCityIntegrity,
      durationMinutes: durationMinutes,
      timeRemainingSeconds: durationMinutes * 60,
      isPaused: false,
      isGameOver: false,
      currentTurnIndex: 0,
      createdAt: new Date().toISOString(),
      players: roomPlayers,
      logs: [
        {
          id: 'LOG-INIT-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          message: `เปิดห้องเล่นบอร์ดเกม ${roomCode.trim().toUpperCase()} สำเร็จ (ชุดสื่อ ${finalKitCode})`,
          type: 'system'
        }
      ]
    };

    StorageService.saveRoom(newGameRoom);
    StorageService.saveActiveGameRoom(newGameRoom);

    // Transition to pre-test at start of game
    onStartRoomGame(newGameRoom);
  };

  // --- Handlers: Search & Join Room ---
  const handleSearchRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchedRoom(null);

    const clean = searchCodeInput.trim().toUpperCase();
    if (!clean) {
      setSearchError('กรุณากรอกรหัสห้อง เช่น SIC-1234');
      return;
    }

    const found = StorageService.findRoomByCode(clean);
    if (!found) {
      setSearchError(`ไม่พบห้องรหัส "${clean}" ในระบบ โปรดตรวจสอบรหัสอีกครั้ง`);
      return;
    }

    setSearchedRoom(found);
    // Find first unoccupied role
    const usedRoles = new Set(found.players.map((p) => p.role));
    const freeRole = AVAILABLE_ROLES.find((r) => !usedRoles.has(r)) || 'citizen';
    setJoinSelectedRole(freeRole);
  };

  const handleJoinRoom = (room: GameRoom) => {
    // Check if user is already in this room
    const existingPlayerIndex = room.players.findIndex(
      (p) => p.userId === currentUser.id || p.fullName.trim() === currentUser.fullName.trim()
    );

    let updatedRoom = { ...room };

    if (existingPlayerIndex >= 0) {
      // User is already a player in this room
      StorageService.saveActiveGameRoom(updatedRoom);
      onResumeGame(updatedRoom);
      return;
    }

    // If new player joining
    if (room.players.length >= 6) {
      alert('ห้องนี้มีผู้เล่นครบ 6 คนแล้ว ไม่สามารถเข้าร่วมได้');
      return;
    }

    const newPlayer: RoomPlayer = {
      id: 'PL-' + (room.players.length + 1) + '-' + Date.now(),
      userId: currentUser.id,
      prefix: currentUser.prefix,
      fullName: currentUser.fullName,
      role: joinSelectedRole,
      personalIntegrity: 0,
      coopPoints: 0,
      missionStep: 0,
      isCompletedAllMissions: false,
      history: [
        {
          id: 'LOG-JOIN-' + Date.now(),
          timestamp: new Date().toLocaleTimeString('th-TH'),
          description: `เข้าร่วมห้องในบทบาท ${ROLES[joinSelectedRole].name}`,
          deltaCity: 0,
          deltaPersonal: 0,
          deltaCoop: 0
        }
      ]
    };

    updatedRoom.players = [...updatedRoom.players, newPlayer];
    StorageService.saveRoom(updatedRoom);
    StorageService.saveActiveGameRoom(updatedRoom);
    StorageService.updateUser(currentUser.id, { mediaKitCode: updatedRoom.mediaKitCode });

    onStartRoomGame(updatedRoom);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in font-['Prompt',sans-serif]">
      
      {/* Welcome Banner & Quick Stats */}
      <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              ห้องรับรองผู้เล่น (Player Lobby)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ยินดีต้อนรับ, {currentUser.prefix} {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light max-w-xl">
              สถานะ: <span className="text-blue-300 font-medium">{currentUser.status}</span> • 
              พร้อมเริ่มต้นบทบาทในเมืองสุจริตอัจฉริยะ ร่วมมือสร้างสังคมโปร่งใสตามคุณลักษณะ 5 ประการ
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 sm:gap-4 bg-[#0A192F] p-4 rounded-2xl border border-[#233554]">
            <div className="text-center px-2 sm:px-3">
              <div className="text-lg sm:text-2xl font-black text-blue-400">
                {userInProgressRooms.length + userCompletedRooms.length}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-light">ห้องที่เล่น</div>
            </div>
            <div className="w-[1px] h-8 bg-[#233554]" />
            <div className="text-center px-2 sm:px-3">
              <div className="text-lg sm:text-2xl font-black text-amber-400">
                {userCompletedRooms.length}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-light">เกมที่สำเร็จ</div>
            </div>
            <div className="w-[1px] h-8 bg-[#233554]" />
            <div className="text-center px-2 sm:px-3">
              <div className="text-lg sm:text-2xl font-black text-emerald-400">
                {currentUser.certificateIssued ? '1 ใบ' : '0 ใบ'}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-400 font-light">เกียรติบัตร</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3 Navigation Tabs */}
      <div className="flex border-b border-[#233554] gap-2 sm:gap-4 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2.5 py-3 px-5 rounded-2xl transition-all whitespace-nowrap ${
            activeTab === 'create'
              ? 'bg-[#1E3A8A] text-white shadow-lg border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-[#112240]'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-blue-300" />
          <span>1. สร้างห้องใหม่ (Create Room)</span>
        </button>

        <button
          onClick={() => { setActiveTab('history'); refreshLobbyData(); }}
          className={`flex items-center gap-2.5 py-3 px-5 rounded-2xl transition-all whitespace-nowrap relative ${
            activeTab === 'history'
              ? 'bg-[#1E3A8A] text-white shadow-lg border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-[#112240]'
          }`}
        >
          <History className="w-4 h-4 text-amber-300" />
          <span>2. ห้องที่เคยเล่น ({userInProgressRooms.length + userCompletedRooms.length})</span>
          {userInProgressRooms.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => { setActiveTab('search'); refreshLobbyData(); }}
          className={`flex items-center gap-2.5 py-3 px-5 rounded-2xl transition-all whitespace-nowrap ${
            activeTab === 'search'
              ? 'bg-[#1E3A8A] text-white shadow-lg border border-blue-500/40'
              : 'text-slate-400 hover:text-white hover:bg-[#112240]'
          }`}
        >
          <Search className="w-4 h-4 text-emerald-300" />
          <span>3. ค้นหาห้อง / เข้าร่วมห้อง</span>
        </button>
      </div>

      {/* ================= TAB 1: CREATE ROOM ================= */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateRoomSubmit} className="space-y-6 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Room Settings & Player Roles */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Room Basics Card */}
              <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-300">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        ข้อมูลห้องบอร์ดเกม & ชุดสื่อการสอน
                      </h2>
                      <p className="text-xs text-slate-400">
                        เลือกรหัสชุดสื่อการสอนที่รวบรวมข้อสอบ ภารกิจ 6 บทบาท และคำถามประจำช่อง
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setRoomCode('SIC-' + Math.floor(1000 + Math.random() * 9000))}
                    className="p-2 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#233554] text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
                    title="สุ่มรหัสห้องใหม่"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">สุ่มรหัส</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Room Code */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      หมายเลขห้องบอร์ดเกม (Room Code) *
                    </label>
                    <input
                      type="text"
                      required
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="เช่น SIC-2026"
                      className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white font-mono font-bold tracking-wider text-sm focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>

                  {/* Media Kit Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      รหัสประจำชุดสื่อการสอน (Media Kit Code) *
                    </label>
                    <select
                      value={selectedKitCode}
                      onChange={(e) => setSelectedKitCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      {mediaKits.map((k) => (
                        <option key={k.id} value={k.code}>
                          {k.code} - {k.name} ({k.schoolOrOrg || 'มาตรฐาน'})
                        </option>
                      ))}
                      <option value="custom">+ ระบุรหัสชุดสื่อการสอนอื่น</option>
                    </select>

                    {selectedKitCode === 'custom' && (
                      <input
                        type="text"
                        required
                        placeholder="กรอกรหัสชุดสื่อ เช่น KIT-003"
                        value={customKitCode}
                        onChange={(e) => setCustomKitCode(e.target.value.toUpperCase())}
                        className="mt-2 w-full px-3.5 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white uppercase focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                </div>

                {/* Duration & City Integrity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>ระยะเวลาการเล่น (ขั้นต่ำ 20 นาที) *</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={20}
                        max={180}
                        required
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 pr-12"
                      />
                      <span className="absolute right-3.5 top-3 text-xs text-slate-400">นาที</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>ดัชนีเมืองสุจริตเริ่มต้น (ขั้นต่ำ 100 แต้ม) *</span>
                    </label>
                    <input
                      type="number"
                      min={100}
                      max={1000}
                      step={10}
                      required
                      value={initialCityIntegrity}
                      onChange={(e) => setInitialCityIntegrity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

              </div>

              {/* Players Configuration Card (Fixed 6 Players, Manual Entry) */}
              <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#233554] gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-300" />
                      ผู้เล่นในห้องบอร์ดเกม (ต้องมีครบ 6 คน 6 บทบาท • ใส่ชื่อด้วยมือทั้งหมด)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      กรอกคำนำหน้าและพิมพ์ชื่อ-นามสกุลของผู้เล่นทั้ง 6 คนด้วยมืออย่างครบถ้วนเพื่อเริ่มเล่นบอร์ดเกม
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-blue-950/70 border border-blue-500/40 text-blue-300 rounded-full text-xs font-semibold self-start sm:self-auto">
                    บังคับ 6 คนครบถ้วน ({players.filter((p) => p.fullName.trim() !== '').length} / 6 คน)
                  </span>
                </div>

                <div className="space-y-3.5">
                  {players.map((p, idx) => {
                    const roleInfo = ROLES[p.role];
                    const isSelf = idx === 0;

                    return (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all ${
                          isSelf 
                            ? 'bg-[#0A192F] border-blue-500/40 shadow-md' 
                            : 'bg-[#0A192F]/70 border-[#233554]'
                        }`}
                      >
                        {/* Player Header: Number & Role Badge */}
                        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#233554]/50">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#112240] border border-[#233554] flex items-center justify-center text-xs font-bold text-white">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-semibold text-white">
                              ผู้เล่นคนที่ {idx + 1}
                            </span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 text-[10px] font-medium border border-blue-500/30">
                                คุณ (ผู้สร้างห้อง)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 hidden sm:inline">บทบาท:</span>
                            <select
                              value={p.role}
                              onChange={(e) => handleUpdatePlayer(idx, { role: e.target.value as RoleKey })}
                              className="px-2.5 py-1 bg-[#112240] border border-[#233554] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                            >
                              {AVAILABLE_ROLES.map((rk) => (
                                <option key={rk} value={rk}>
                                  {ROLES[rk].badge} {ROLES[rk].name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Manual Name Inputs: Prefix + Full Name (Typing by hand) */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] text-slate-400 mb-1">
                              คำนำหน้า *
                            </label>
                            <select
                              value={p.prefix}
                              onChange={(e) => handleUpdatePlayer(idx, { prefix: e.target.value })}
                              className="w-full px-2.5 py-2 bg-[#112240] border border-[#233554] rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                            >
                              <option value="นาย">นาย</option>
                              <option value="นาง">นาง</option>
                              <option value="นางสาว">นางสาว</option>
                              <option value="ด.ช.">ด.ช.</option>
                              <option value="ด.ญ.">ด.ญ.</option>
                              <option value="อาจารย์">อาจารย์</option>
                              <option value="คุณ">คุณ</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label className="block text-[11px] text-slate-400 mb-1">
                              ชื่อ - นามสกุล (พิมพ์ด้วยมือ) *
                            </label>
                            <input
                              type="text"
                              required
                              value={p.fullName}
                              onChange={(e) => handleUpdatePlayer(idx, { fullName: e.target.value })}
                              placeholder={isSelf ? 'พิมพ์ชื่อ-นามสกุลของคุณ' : `พิมพ์ชื่อ-นามสกุล ผู้เล่นคนที่ ${idx + 1}`}
                              className="w-full px-3.5 py-2 bg-[#112240] border border-[#233554] rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Role description footer */}
                        <div className="mt-2.5 pt-2 border-t border-[#233554]/40 flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-semibold" style={{ color: roleInfo.color }}>
                            {roleInfo.badge} {roleInfo.name}:
                          </span>
                          <span className="truncate">{roleInfo.duty}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right 1 Col: Rule Summary & Launch Button */}
            <div className="space-y-6">
              
              <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ลำดับขั้นตอนการเล่น (Game Flow)
                </h3>
                
                <ol className="space-y-3 text-xs text-slate-300 font-light list-decimal list-inside leading-relaxed">
                  <li className="pl-1">
                    <strong className="text-white font-medium">ทำแบบทดสอบก่อนเรียน (Pre-test):</strong> วัดกระบวนการคิด 5 คุณลักษณะก่อนเริ่ม
                  </li>
                  <li className="pl-1">
                    <strong className="text-white font-medium">เข้าสู่กระดานบอร์ดเกม:</strong> ทอดลูกเต๋า ทำภารกิจ 3 ขั้น แตะบัตร NFC สู้ข่าวสาร
                  </li>
                  <li className="pl-1">
                    <strong className="text-white font-medium">ทำแบบทดสอบหลังเรียน & ส่งภาพ:</strong> อัปโหลดภาพกิจกรรม 5 คุณลักษณะสุจริต
                  </li>
                  <li className="pl-1">
                    <strong className="text-white font-medium">รับเกียรติบัตร:</strong> ออกเกียรติบัตรพร้อมดัชนีคะแนนอย่างเป็นทางการ
                  </li>
                </ol>

                <div className="p-3.5 rounded-2xl bg-[#0A192F] border border-[#233554] text-xs text-slate-400 space-y-1">
                  <div className="font-semibold text-blue-300">คะแนน 4 ระบบที่คำนวณในเกม:</div>
                  <div className="text-[11px]">• ดัชนีเมืองสุจริต (คะแนนส่วนรวม ≥ 100)</div>
                  <div className="text-[11px]">• ภารกิจตัวละคร 3 ขั้น (6 บทบาท)</div>
                  <div className="text-[11px]">• แต้มความร่วมมือช่วยเหลือเพื่อน</div>
                  <div className="text-[11px]">• ดัชนีชีวิตสุจริต (คะแนนส่วนบุคคล)</div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-950 text-sm flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>สร้างห้องและเริ่มเล่นทันที</span>
                </button>
                <div className="text-center text-[11px] text-slate-400">
                  (ระบบจะนำท่านเข้าสู่แบบทดสอบก่อนเรียนสำหรับชุดสื่อนี้)
                </div>
              </div>

            </div>

          </div>

        </form>
      )}

      {/* ================= TAB 2: ROOMS PLAYED HISTORY ================= */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Active / In-Progress Rooms */}
          {userInProgressRooms.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                ห้องที่กำลังเล่นอยู่ (Active Games)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userInProgressRooms.map((room) => {
                  const myPlayer = room.players.find(
                    (p) => p.userId === currentUser.id || p.fullName.trim() === currentUser.fullName.trim()
                  ) || room.players[0];

                  const roleInfo = ROLES[myPlayer.role];

                  return (
                    <div 
                      key={room.roomCode}
                      className="bg-[#112240] border-2 border-emerald-500/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#233554]">
                          <div>
                            <span className="text-xs font-mono font-bold text-white tracking-wider bg-[#0A192F] px-2.5 py-1 rounded-lg border border-[#233554]">
                              {room.roomCode}
                            </span>
                            <span className="ml-2 text-xs text-blue-300">
                              ชุดสื่อ: {room.mediaKitCode}
                            </span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[11px] font-semibold">
                            กำลังเล่น
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 my-3 text-center text-xs">
                          <div className="p-2 rounded-xl bg-[#0A192F]">
                            <div className="text-[10px] text-slate-400">ดัชนีเมือง</div>
                            <div className="text-sm font-bold text-blue-300">{room.cityIntegrity}</div>
                          </div>
                          <div className="p-2 rounded-xl bg-[#0A192F]">
                            <div className="text-[10px] text-slate-400">บทบาทของคุณ</div>
                            <div className="text-xs font-semibold text-white truncate">
                              {roleInfo.badge} {roleInfo.name}
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-[#0A192F]">
                            <div className="text-[10px] text-slate-400">ผู้เล่น</div>
                            <div className="text-sm font-bold text-slate-200">{room.players.length} คน</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onResumeGame(room)}
                        className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>เล่นห้องนี้ต่อ (Resume)</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Games History */}
          <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#233554]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-300" />
                  ประวัติห้องบอร์ดเกมที่เล่นจบแล้ว ({userCompletedRooms.length} รอบ)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  บันทึกประวัติดัชนีเมืองสุจริต คะแนนภารกิจส่วนบุคคล และเกียรติบัตรที่ออก
                </p>
              </div>
            </div>

            {userCompletedRooms.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs sm:text-sm space-y-3">
                <History className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="text-white font-medium">ยังไม่มีประวัติการเล่นที่จบเกม</p>
                <p className="text-slate-500 text-xs max-w-sm mx-auto">
                  เมื่อคุณเล่นบอร์ดเกมและส่งแบบทดสอบหลังเรียน ระบบจะบันทึกสถิติและคะแนนไว้ที่นี่
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors mt-2"
                >
                  สร้างห้องเพื่อเริ่มเล่นรอบแรก
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userCompletedRooms.map((room, idx) => {
                  const myPlayer = room.players.find(
                    (p) => p.userId === currentUser.id || p.fullName.trim() === currentUser.fullName.trim()
                  ) || room.players[0];

                  const roleInfo = ROLES[myPlayer.role];
                  const isCityWon = room.cityIntegrity >= 100;

                  return (
                    <div 
                      key={idx}
                      className="p-5 rounded-2xl bg-[#0A192F] border border-[#233554] hover:border-blue-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-white text-sm bg-[#112240] px-2.5 py-1 rounded-lg border border-[#233554]">
                            {room.roomCode}
                          </span>
                          <span className="text-xs text-blue-300">
                            ชุดสื่อ: {room.mediaKitCode}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isCityWon 
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50' 
                              : 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                          }`}>
                            {isCityWon ? '✓ พลิกโฉมเมืองสุจริตสำเร็จ' : '✗ ดัชนีเมืองต่ำกว่าเกณฑ์ (แพ้ร่วมกัน)'}
                          </span>
                        </div>

                        {/* 4 Score Highlights */}
                        <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                          <div>
                            บทบาท: <span className="font-semibold text-white">{roleInfo.badge} {roleInfo.name}</span>
                          </div>
                          <div>•</div>
                          <div>
                            ดัชนีเมือง: <span className="font-bold text-amber-300">{room.cityIntegrity}</span>
                          </div>
                          <div>•</div>
                          <div>
                            ภารกิจ: <span className="font-semibold text-blue-300">ขั้น {myPlayer.missionStep}/3</span>
                          </div>
                          <div>•</div>
                          <div>
                            แต้มร่วมมือ: <span className="font-semibold text-emerald-300">+{myPlayer.coopPoints}</span>
                          </div>
                          <div>•</div>
                          <div>
                            ดัชนีชีวิตสุจริต: <span className="font-semibold text-indigo-300">+{myPlayer.personalIntegrity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewCertificate(room)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
                        >
                          <Award className="w-4 h-4 text-amber-200" />
                          <span>ดูเกียรติบัตร</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ================= TAB 3: SEARCH & JOIN ROOM ================= */}
      {activeTab === 'search' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Search Box */}
          <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              ค้นหาและเข้าร่วมห้องบอร์ดเกม
            </h3>
            <p className="text-xs text-slate-400">
              กรอกหมายเลขห้องบอร์ดเกม (Room Code) ที่เพื่อนหรือครูผู้สอนสร้างไว้เพื่อเข้าร่วมเล่น
            </p>

            <form onSubmit={handleSearchRoom} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchCodeInput}
                  onChange={(e) => setSearchCodeInput(e.target.value.toUpperCase())}
                  placeholder="กรอกรหัสห้อง เช่น SIC-5821"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white font-mono font-bold tracking-wider text-sm focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 bg-[#1E3A8A] hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาห้อง</span>
              </button>
            </form>

            {searchError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700/50 text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Searched Room Result Card */}
          {searchedRoom && (
            <div className="bg-[#112240] border-2 border-blue-500/60 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
                <div>
                  <div className="text-xs text-blue-300 font-semibold mb-1">ผลการค้นหาห้องบอร์ดเกม:</div>
                  <h4 className="text-xl font-mono font-black text-white tracking-wider flex items-center gap-2">
                    <span>{searchedRoom.roomCode}</span>
                    <span className="text-xs font-normal text-slate-400">
                      (ชุดสื่อ: {searchedRoom.mediaKitCode})
                    </span>
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">สถานะห้อง</div>
                  <div className="text-xs font-semibold text-emerald-400">
                    {searchedRoom.isGameOver ? 'จบเกมแล้ว' : 'เปิดรับผู้เล่น / กำลังเล่น'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0A192F]">
                  <div className="text-slate-400">ดัชนีเมืองสุจริต</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">{searchedRoom.cityIntegrity} แต้ม</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A192F]">
                  <div className="text-slate-400">เวลาเล่นที่ตั้งไว้</div>
                  <div className="text-lg font-bold text-blue-400 mt-0.5">{searchedRoom.durationMinutes} นาที</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A192F]">
                  <div className="text-slate-400">ผู้เล่นปัจจุบัน</div>
                  <div className="text-lg font-bold text-white mt-0.5">{searchedRoom.players.length} / 6 คน</div>
                </div>
              </div>

              {/* Select Role to Join */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  เลือกบทบาทของคุณในห้องนี้ (จาก 6 บทบาทสุจริต):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVAILABLE_ROLES.map((roleKey) => {
                    const info = ROLES[roleKey];
                    const isOccupied = searchedRoom.players.some((p) => p.role === roleKey);
                    const isSelected = joinSelectedRole === roleKey;

                    return (
                      <button
                        key={roleKey}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setJoinSelectedRole(roleKey)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-blue-900/60 border-blue-400 ring-2 ring-blue-500/30'
                            : isOccupied
                              ? 'bg-[#0A192F]/40 border-slate-800 opacity-50 cursor-not-allowed'
                              : 'bg-[#0A192F] border-[#233554] hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                          <span>{info.badge} {info.name}</span>
                          {isOccupied && <span className="text-[10px] text-rose-400 font-normal">มีผู้เลือกแล้ว</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{info.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleJoinRoom(searchedRoom)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>เข้าร่วมห้อง {searchedRoom.roomCode} และเริ่มเล่น (ทำแบบทดสอบก่อนเรียน)</span>
              </button>
            </div>
          )}

          {/* Active Rooms in System */}
          <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-300" />
              ห้องที่มีในระบบขณะนี้ ({activeRoomsList.length} ห้อง)
            </h4>

            {activeRoomsList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                ยังไม่มีห้องที่กำลังเปิดเล่นอยู่ในระบบขณะนี้ สามารถสร้างห้องใหม่ได้ในแท็บ "สร้างห้องใหม่"
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {activeRoomsList.map((r) => (
                  <button
                    key={r.roomCode}
                    onClick={() => {
                      setSearchCodeInput(r.roomCode);
                      setSearchedRoom(r);
                      const usedRoles = new Set(r.players.map((p) => p.role));
                      const freeRole = AVAILABLE_ROLES.find((role) => !usedRoles.has(role)) || 'citizen';
                      setJoinSelectedRole(freeRole);
                    }}
                    className="p-4 rounded-2xl bg-[#0A192F] border border-[#233554] hover:border-blue-400 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-white group-hover:text-blue-300">
                        {r.roomCode}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-600/30">
                        {r.players.length}/6 คน
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">ชุดสื่อ: {r.mediaKitCode}</div>
                    <div className="text-xs text-amber-300 mt-1 font-semibold">
                      ดัชนีเมือง: {r.cityIntegrity} แต้ม
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
