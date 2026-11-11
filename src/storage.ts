import {
  MediaKit,
  UserAccount,
  PrePostQuestion,
  RoleMission,
  CooperationMission,
  NewsCard,
  TileQuestion,
  CertificateConfig,
  GameRoom,
} from './types';

const STORAGE_KEYS = {
  USERS: 'sic_users_v1',
  MEDIA_KITS: 'sic_media_kits_v1',
  ACTIVE_GAME_ROOM: 'sic_active_game_room_v1',
  ALL_ROOMS: 'sic_all_rooms_v1',
  GAME_HISTORY: 'sic_game_history_v1',
  CURRENT_USER_SESSION: 'sic_current_user_session_v1',
  IS_ADMIN_SESSION: 'sic_is_admin_session_v1'
};

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
  title: 'เกียรติบัตรแสดงความสำเร็จ',
  subtitle: 'ผ่านการเรียนรู้และขับเคลื่อนนวัตกรรมบอร์ดเกม Smart Integrity City พลิกโฉมเมืองสุจริตอัจฉริยะ',
  bodyTemplate: 'ได้ผ่านกระบวนการเรียนรู้และทดสอบสมรรถนะคุณลักษณะ 5 ประการของโรงเรียนสุจริต ครบถ้วนตามเกณฑ์มาตรฐาน ขอจงรักษาและนำคุณธรรมความซื่อสัตย์สุจริตไปปฏิบัติเพื่อความเจริญก้าวหน้าของสังคมและประเทศชาติต่อไป',
  directorName: 'ดร.สมเกียรติ สุจริตธรรมนูญ',
  directorTitle: 'ผู้อำนวยการศูนย์นวัตกรรมและขับเคลื่อนโรงเรียนสุจริต',
  organizationName: 'โครงการส่งเสริมคุณลักษณะ 5 ประการ โรงเรียนสุจริตแห่งชาติ',
  sealText: 'SMART INTEGRITY CITY CERTIFIED',
  certificateNoPrefix: 'SIC-CERT-2026-'
};

// Initial media kits with clean empty content waiting for admin
const DEFAULT_INITIAL_MEDIA_KITS: MediaKit[] = [
  {
    id: 'KIT-001',
    code: 'KIT-001',
    name: 'ชุดสื่อการสอนบอร์ดเกมสุจริต รุ่นที่ 1 (Smart Box 01)',
    schoolOrOrg: 'โรงเรียนสุจริตวิทยาคม',
    createdAt: new Date().toISOString(),
    notes: 'ชุดสื่อการสอนหลักประจำห้องเรียน ม.4-6',
    prePostQuestions: [],
    roleMissions: [],
    cooperationMissions: [],
    newsCards: [],
    tileQuestions: [],
    certificateConfig: { ...DEFAULT_CERTIFICATE_CONFIG }
  },
  {
    id: 'KIT-002',
    code: 'KIT-002',
    name: 'ชุดสื่อการสอนบอร์ดเกมสุจริต รุ่นที่ 2 (Smart Box 02)',
    schoolOrOrg: 'ศูนย์เครือข่ายเยาวชนต้านทุจริต',
    createdAt: new Date().toISOString(),
    notes: 'ชุดสื่อการสอนสำหรับกิจกรรมอบรมแกนนำ',
    prePostQuestions: [],
    roleMissions: [],
    cooperationMissions: [],
    newsCards: [],
    tileQuestions: [],
    certificateConfig: { ...DEFAULT_CERTIFICATE_CONFIG }
  }
];

export const StorageService = {
  // --- Current User Session ---
  getCurrentUser(): UserAccount | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserAccount | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_SESSION);
    }
  },

  isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_ADMIN_SESSION) === 'true';
  },

  setAdminLoggedIn(val: boolean) {
    if (val) {
      localStorage.setItem(STORAGE_KEYS.IS_ADMIN_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.IS_ADMIN_SESSION);
    }
  },

  // --- Users ---
  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveUser(user: UserAccount): { success: boolean; message: string } {
    const users = this.getUsers();
    const existingIndex = users.findIndex(
      (u) => u.fullName.trim() === user.fullName.trim() && u.prefix === user.prefix
    );

    if (existingIndex >= 0) {
      // Update existing
      users[existingIndex] = { ...users[existingIndex], ...user };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      this.syncCurrentUserIfMatching(users[existingIndex]);
      return { success: true, message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อย' };
    }

    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true, message: 'ลงทะเบียนสำเร็จ' };
  },

  updateUser(id: string, updates: Partial<UserAccount>): UserAccount | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.syncCurrentUserIfMatching(users[idx]);
    return users[idx];
  },

  syncCurrentUserIfMatching(updatedUser: UserAccount) {
    const current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }
  },

  findUserByNameAndPass(fullName: string, pass: string): UserAccount | null {
    const users = this.getUsers();
    return (
      users.find(
        (u) =>
          u.fullName.trim().toLowerCase() === fullName.trim().toLowerCase() &&
          u.password === pass
      ) || null
    );
  },

  // --- Media Kits (Each Kit contains its own Questions, Missions, News, Tiles & Certificate) ---
  getMediaKits(): MediaKit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDIA_KITS);
    let kits: MediaKit[] = [];
    if (!raw) {
      kits = DEFAULT_INITIAL_MEDIA_KITS;
      localStorage.setItem(STORAGE_KEYS.MEDIA_KITS, JSON.stringify(kits));
    } else {
      try {
        kits = JSON.parse(raw);
      } catch {
        kits = DEFAULT_INITIAL_MEDIA_KITS;
      }
    }

    // Ensure all bundled content arrays exist
    return kits.map((kit) => ({
      ...kit,
      prePostQuestions: kit.prePostQuestions || [],
      roleMissions: kit.roleMissions || [],
      cooperationMissions: kit.cooperationMissions || [],
      newsCards: kit.newsCards || [],
      tileQuestions: kit.tileQuestions || [],
      certificateConfig: kit.certificateConfig || { ...DEFAULT_CERTIFICATE_CONFIG }
    }));
  },

  getMediaKitByCode(code: string): MediaKit | null {
    const clean = code.trim().toUpperCase();
    const kits = this.getMediaKits();
    return kits.find((k) => k.code.trim().toUpperCase() === clean || k.id === code) || null;
  },

  saveMediaKit(kit: MediaKit) {
    const kits = this.getMediaKits();
    const idx = kits.findIndex((k) => k.id === kit.id || k.code.trim().toUpperCase() === kit.code.trim().toUpperCase());
    
    const completeKit: MediaKit = {
      ...kit,
      prePostQuestions: kit.prePostQuestions || [],
      roleMissions: kit.roleMissions || [],
      cooperationMissions: kit.cooperationMissions || [],
      newsCards: kit.newsCards || [],
      tileQuestions: kit.tileQuestions || [],
      certificateConfig: kit.certificateConfig || { ...DEFAULT_CERTIFICATE_CONFIG }
    };

    if (idx >= 0) {
      kits[idx] = completeKit;
    } else {
      kits.push(completeKit);
    }
    localStorage.setItem(STORAGE_KEYS.MEDIA_KITS, JSON.stringify(kits));
  },

  deleteMediaKit(id: string) {
    const kits = this.getMediaKits().filter((k) => k.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA_KITS, JSON.stringify(kits));
  },

  // Helper to resolve which Media Kit is active
  resolveTargetKitCode(kitCode?: string): string {
    if (kitCode && kitCode.trim()) return kitCode.trim().toUpperCase();
    const activeRoom = this.getActiveGameRoom();
    if (activeRoom && activeRoom.mediaKitCode) return activeRoom.mediaKitCode.trim().toUpperCase();
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.mediaKitCode) return currentUser.mediaKitCode.trim().toUpperCase();
    const all = this.getMediaKits();
    return all.length > 0 ? all[0].code : 'KIT-001';
  },

  // --- Pre/Post Questions inside Media Kit ---
  getPrePostQuestions(kitCode?: string): PrePostQuestion[] {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (kit && kit.prePostQuestions) {
      return kit.prePostQuestions;
    }
    const all = this.getMediaKits();
    return all.length > 0 ? all[0].prePostQuestions || [] : [];
  },

  savePrePostQuestion(q: PrePostQuestion, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    const list = [...(kit.prePostQuestions || [])];
    const idx = list.findIndex((item) => item.id === q.id);
    if (idx >= 0) list[idx] = q;
    else list.push(q);

    kit.prePostQuestions = list;
    this.saveMediaKit(kit);
  },

  deletePrePostQuestion(id: string, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    kit.prePostQuestions = (kit.prePostQuestions || []).filter((q) => q.id !== id);
    this.saveMediaKit(kit);
  },

  // --- Role Missions inside Media Kit ---
  getRoleMissions(kitCode?: string): RoleMission[] {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (kit && kit.roleMissions) return kit.roleMissions;
    const all = this.getMediaKits();
    return all.length > 0 ? all[0].roleMissions || [] : [];
  },

  saveRoleMission(mission: RoleMission, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    const list = [...(kit.roleMissions || [])];
    const idx = list.findIndex((m) => m.id === mission.id);
    if (idx >= 0) list[idx] = mission;
    else list.push(mission);

    kit.roleMissions = list;
    this.saveMediaKit(kit);
  },

  deleteRoleMission(id: string, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    kit.roleMissions = (kit.roleMissions || []).filter((m) => m.id !== id);
    this.saveMediaKit(kit);
  },

  // --- Cooperation Missions inside Media Kit ---
  getCooperationMissions(kitCode?: string): CooperationMission[] {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (kit && kit.cooperationMissions) return kit.cooperationMissions;
    const all = this.getMediaKits();
    return all.length > 0 ? all[0].cooperationMissions || [] : [];
  },

  saveCooperationMission(mission: CooperationMission, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    const list = [...(kit.cooperationMissions || [])];
    const idx = list.findIndex((m) => m.id === mission.id);
    if (idx >= 0) list[idx] = mission;
    else list.push(mission);

    kit.cooperationMissions = list;
    this.saveMediaKit(kit);
  },

  deleteCooperationMission(id: string, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    kit.cooperationMissions = (kit.cooperationMissions || []).filter((m) => m.id !== id);
    this.saveMediaKit(kit);
  },

  // --- News Cards inside Media Kit ---
  getNewsCards(kitCode?: string): NewsCard[] {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (kit && kit.newsCards) return kit.newsCards;
    const all = this.getMediaKits();
    return all.length > 0 ? all[0].newsCards || [] : [];
  },

  saveNewsCard(card: NewsCard, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    const list = [...(kit.newsCards || [])];
    const idx = list.findIndex((c) => c.id === card.id);
    if (idx >= 0) list[idx] = card;
    else list.push(card);

    kit.newsCards = list;
    this.saveMediaKit(kit);
  },

  deleteNewsCard(id: string, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    kit.newsCards = (kit.newsCards || []).filter((c) => c.id !== id);
    this.saveMediaKit(kit);
  },

  // --- Tile Questions inside Media Kit ---
  getTileQuestions(kitCode?: string): TileQuestion[] {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (kit && kit.tileQuestions) return kit.tileQuestions;
    const all = this.getMediaKits();
    return all.length > 0 ? all[0].tileQuestions || [] : [];
  },

  saveTileQuestion(q: TileQuestion, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    const list = [...(kit.tileQuestions || [])];
    const idx = list.findIndex((item) => item.id === q.id);
    if (idx >= 0) list[idx] = q;
    else list.push(q);

    kit.tileQuestions = list;
    this.saveMediaKit(kit);
  },

  deleteTileQuestion(id: string, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    kit.tileQuestions = (kit.tileQuestions || []).filter((q) => q.id !== id);
    this.saveMediaKit(kit);
  },

  // --- Certificate Configuration inside Media Kit ---
  getCertificateConfig(kitCode?: string): CertificateConfig {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (kit && kit.certificateConfig) return kit.certificateConfig;
    return DEFAULT_CERTIFICATE_CONFIG;
  },

  saveCertificateConfig(config: CertificateConfig, kitCode?: string) {
    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);
    if (!kit) return;

    kit.certificateConfig = config;
    this.saveMediaKit(kit);
  },

  // --- NFC Card Lookup within Media Kit ---
  findNfcItem(code: string, kitCode?: string): {
    type: 'role_mission' | 'cooperation' | 'tile_question';
    item: RoleMission | CooperationMission | TileQuestion;
  } | null {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return null;

    const targetCode = this.resolveTargetKitCode(kitCode);
    const kit = this.getMediaKitByCode(targetCode);

    if (kit) {
      // Check role missions
      const roleM = (kit.roleMissions || []).find((m) => m.nfcCode && m.nfcCode.trim().toUpperCase() === cleanCode);
      if (roleM) return { type: 'role_mission', item: roleM };

      // Check cooperation missions
      const coopM = (kit.cooperationMissions || []).find((m) => m.nfcCode && m.nfcCode.trim().toUpperCase() === cleanCode);
      if (coopM) return { type: 'cooperation', item: coopM };

      // Check tile questions
      const tileQ = (kit.tileQuestions || []).find((q) => q.nfcCode && q.nfcCode.trim().toUpperCase() === cleanCode);
      if (tileQ) return { type: 'tile_question', item: tileQ };
    }

    // Fallback: search across all media kits if not in current
    const allKits = this.getMediaKits();
    for (const k of allKits) {
      const rm = (k.roleMissions || []).find((m) => m.nfcCode && m.nfcCode.trim().toUpperCase() === cleanCode);
      if (rm) return { type: 'role_mission', item: rm };
      const cm = (k.cooperationMissions || []).find((m) => m.nfcCode && m.nfcCode.trim().toUpperCase() === cleanCode);
      if (cm) return { type: 'cooperation', item: cm };
      const tq = (k.tileQuestions || []).find((q) => q.nfcCode && q.nfcCode.trim().toUpperCase() === cleanCode);
      if (tq) return { type: 'tile_question', item: tq };
    }

    return null;
  },

  // --- Active Game Room ---
  getActiveGameRoom(): GameRoom | null {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_GAME_ROOM);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveActiveGameRoom(room: GameRoom | null) {
    if (!room) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_GAME_ROOM);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME_ROOM, JSON.stringify(room));
    this.saveRoom(room);
  },

  // --- All Rooms (Active & Joinable) ---
  getAllRooms(): GameRoom[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_ROOMS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveRoom(room: GameRoom) {
    const rooms = this.getAllRooms();
    const idx = rooms.findIndex((r) => r.roomCode.trim().toUpperCase() === room.roomCode.trim().toUpperCase());
    if (idx >= 0) {
      rooms[idx] = room;
    } else {
      rooms.unshift(room);
    }
    localStorage.setItem(STORAGE_KEYS.ALL_ROOMS, JSON.stringify(rooms.slice(0, 50)));
  },

  findRoomByCode(code: string): GameRoom | null {
    const clean = code.trim().toUpperCase();
    if (!clean) return null;

    // Search active game room first
    const active = this.getActiveGameRoom();
    if (active && active.roomCode.trim().toUpperCase() === clean) {
      return active;
    }

    // Search all rooms list
    const rooms = this.getAllRooms();
    const found = rooms.find((r) => r.roomCode.trim().toUpperCase() === clean);
    if (found) return found;

    // Search past history
    const history = this.getGameHistories();
    const histFound = history.find((r) => r.roomCode.trim().toUpperCase() === clean);
    return histFound || null;
  },

  // --- Game History Records & User Filter ---
  getGameHistories(): GameRoom[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  archiveGameRoom(room: GameRoom) {
    const list = this.getGameHistories();
    const updatedRoom: GameRoom = { ...room, isGameOver: true };
    const filtered = list.filter((r) => r.roomCode.trim().toUpperCase() !== room.roomCode.trim().toUpperCase());
    filtered.unshift(updatedRoom);
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(filtered.slice(0, 50)));
    
    // Also update all rooms list
    const all = this.getAllRooms();
    const aIdx = all.findIndex((r) => r.roomCode.trim().toUpperCase() === room.roomCode.trim().toUpperCase());
    if (aIdx >= 0) {
      all[aIdx] = updatedRoom;
      localStorage.setItem(STORAGE_KEYS.ALL_ROOMS, JSON.stringify(all));
    }
    this.saveActiveGameRoom(null);
  },

  getUserRoomRecords(userId: string, fullName?: string): { inProgress: GameRoom[]; completed: GameRoom[] } {
    const allActive = this.getAllRooms().filter((r) => !r.isGameOver);
    const history = this.getGameHistories();

    const matchesUser = (room: GameRoom) => {
      return room.players.some((p) => {
        if (p.userId && p.userId === userId) return true;
        if (fullName && p.fullName.trim() === fullName.trim()) return true;
        return false;
      });
    };

    const inProgress = allActive.filter(matchesUser);
    const completed = history.filter(matchesUser);

    return { inProgress, completed };
  }
};
