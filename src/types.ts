export type RoleKey = 
  | 'government' 
  | 'business' 
  | 'journalist' 
  | 'civil_servant' 
  | 'police' 
  | 'citizen';

export interface RoleInfo {
  key: RoleKey;
  name: string;
  nameEn: string;
  badge: string;
  color: string;
  desc: string;
  duty: string;
}

export const ROLES: Record<RoleKey, RoleInfo> = {
  government: {
    key: 'government',
    name: 'รัฐบาล',
    nameEn: 'Government',
    badge: '🏛️',
    color: '#3B82F6',
    desc: 'ผู้วางนโยบายและบริหารงบประมาณแผ่นดินเพื่อประโยชน์ส่วนรวม',
    duty: 'รักษาความโปร่งใส ป้องกันการจัดซื้อจัดจ้างที่ทุจริต'
  },
  business: {
    key: 'business',
    name: 'นักธุรกิจ',
    nameEn: 'Business Operator',
    badge: '💼',
    color: '#F59E0B',
    desc: 'ผู้ขับเคลื่อนเศรษฐกิจ ผลิตสินค้าและบริการอย่างมีธรรมาภิบาล',
    duty: 'ดำเนินธุรกิจอย่างซื่อตรง ไม่จ่ายสินบน ไม่เอาเปรียบสังคม'
  },
  journalist: {
    key: 'journalist',
    name: 'นักข่าว',
    nameEn: 'Investigative Journalist',
    badge: '📰',
    color: '#10B981',
    desc: 'กระบอกเสียงตรวจสอบความจริงและเปิดโปงความไม่ชอบมาพากล',
    duty: 'รายงานข่าวอย่างเป็นกลาง มีจรรยาบรรณ และกล้าเปิดเผยข้อเท็จจริง'
  },
  civil_servant: {
    key: 'civil_servant',
    name: 'ข้าราชการท้องถิ่น',
    nameEn: 'Local Civil Servant',
    badge: '📋',
    color: '#6366F1',
    desc: 'ผู้ปฏิบัติงานบริการสาธารณะและประสานงานพัฒนาท้องถิ่น',
    duty: 'บริการประชาชนอย่างเสมอภาค เคารพกฎระเบียบ ละเว้นอามิสสินจ้าง'
  },
  police: {
    key: 'police',
    name: 'ตำรวจ',
    nameEn: 'Police Officer',
    badge: '👮',
    color: '#EC4899',
    desc: 'ผู้พิทักษ์สันติราษฎร์และบังคับใช้กฎหมายอย่างเป็นธรรม',
    duty: 'ปราบปรามการกระทำผิด ไม่เลือกปฏิบัติ ยึดมั่นความถูกต้อง'
  },
  citizen: {
    key: 'citizen',
    name: 'ประชาชน',
    nameEn: 'Active Citizen',
    badge: '👥',
    color: '#14B8A6',
    desc: 'พลังสำคัญในการร่วมพัฒนาเมืองและตรวจสอบการใช้อำนาจรัฐ',
    duty: 'เคารพกฎหมาย มีจิตอาสา และตื่นรู้ไม่ยอมรับการโกงทุกรูปแบบ'
  }
};

export type AttributeKey = 
  | 'thinking' 
  | 'discipline' 
  | 'honesty' 
  | 'sufficiency' 
  | 'volunteer';

export interface AttributeInfo {
  key: AttributeKey;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
}

export const INTEGRITY_ATTRIBUTES: Record<AttributeKey, AttributeInfo> = {
  thinking: {
    key: 'thinking',
    name: 'ทักษะกระบวนการคิด',
    nameEn: 'Critical & Ethical Thinking',
    description: 'การคิดวิเคราะห์ แยกแยะประโยชน์ส่วนตนและประโยชน์ส่วนรวมได้อย่างถูกต้อง',
    icon: '🧠'
  },
  discipline: {
    key: 'discipline',
    name: 'มีความซื่อสัตย์สุจริต',
    nameEn: 'Honesty & Integrity',
    description: 'ยึดมั่นในความถูกต้อง จริงใจ ตรงไปตรงมา ไม่คดโกงทั้งต่อหน้าและลับหลัง',
    icon: '⚖️'
  },
  honesty: {
    key: 'honesty',
    name: 'มีวินัย',
    nameEn: 'Self-Discipline & Rule of Law',
    description: 'ปฏิบัติตามกฎระเบียบของสังคมและกติกาข้อตกลงอย่างเคร่งครัด สม่ำเสมอ',
    icon: '📜'
  },
  sufficiency: {
    key: 'sufficiency',
    name: 'อยู่อย่างพอเพียง',
    nameEn: 'Sufficiency Economy Living',
    description: 'ดำเนินชีวิตด้วยความพอประมาณ มีเหตุผล และมีภูมิคุ้มกันต่อสิ่งยั่วยุ',
    icon: '🌱'
  },
  volunteer: {
    key: 'volunteer',
    name: 'มีจิตสาธารณะ',
    nameEn: 'Public Mindedness & Altruism',
    description: 'พร้อมเสียสละ ร่วมมือดูแลรักษาสมบัติส่วนรวมเพื่อความสุขของทุกคนในเมือง',
    icon: '🤝'
  }
};

export interface MediaKit {
  id: string; // e.g. "KIT-001"
  code: string;
  name: string;
  schoolOrOrg: string;
  createdAt: string;
  notes?: string;
  // Bundled content within this Media Kit
  prePostQuestions: PrePostQuestion[];
  roleMissions: RoleMission[];
  cooperationMissions: CooperationMission[];
  tileQuestions: TileQuestion[];
  certificateConfig: CertificateConfig;
  newsCards?: NewsCard[];
}

export interface UserAccount {
  id: string;
  prefix: string; // นาย, นาง, นางสาว, ด.ช., ด.ญ.
  fullName: string;
  password: string;
  status: 'นักเรียน' | 'ครู' | 'ผู้บริหาร' | 'บุคคลทั่วไป' | string;
  mediaKitCode: string;
  createdAt: string;
  // History and test records
  preTestCompleted?: boolean;
  preTestAnswers?: Record<string, string>;
  preTestScore?: number;
  postTestCompleted?: boolean;
  postTestAnswers?: Record<string, string>;
  postTestScore?: number;
  behaviorImages?: string[]; // 5 images (base64 data URL)
  certificateIssued?: boolean;
  roomCodeHistory?: string[];
  lastGameSummary?: {
    roomCode: string;
    role: RoleKey;
    personalIntegrity: number;
    coopPoints: number;
    missionStep: number;
    cityIntegrity: number;
    isCitySaved: boolean;
    date: string;
  };
}

export interface PrePostQuestion {
  id: string;
  attribute: AttributeKey;
  questionText: string;
  guideline: string;
  type: 'pre' | 'post' | 'both';
  points: number;
}

export interface RoleMission {
  id: string;
  role: RoleKey;
  step: 1 | 2 | 3;
  nfcCode: string;
  title: string;
  description: string;
  cityImpact: number;
  personalReward: number;
}

export interface CooperationMission {
  id: string;
  nfcCode: string;
  title: string;
  requiredRoles: RoleKey[];
  description: string;
  coopPoints: number;
  cityImpact: number;
}

export interface NewsCard {
  id: string;
  nfcCode: string;
  typeIndex: number; // 1-7
  typeName: string; // ข่าวบวก, ข่าวเตือนภัย, ข่าวเปิดโปง, ฯลฯ
  title: string;
  content: string;
  cityImpact: number;
  personalImpact: number;
}

export interface TileQuestion {
  id: string;
  nfcCode: string;
  category: AttributeKey | 'ethical_challenge' | 'corruption_check';
  categoryTitle: string;
  question: string;
  options: string[]; // 2-4 options
  correctOptionIndex: number; // or best ethical choice
  explanation: string;
  pointsCity: number;
  pointsPersonal: number;
}

export interface CertificateConfig {
  title: string;
  subtitle: string;
  bodyTemplate: string;
  directorName: string;
  directorTitle: string;
  organizationName: string;
  sealText: string;
  customBgUrl?: string;
  certificateNoPrefix: string;
}

export interface RoomPlayer {
  id: string;
  userId: string;
  prefix: string;
  fullName: string;
  role: RoleKey;
  personalIntegrity: number;
  coopPoints: number;
  missionStep: number; // 0, 1, 2, 3
  isCompletedAllMissions: boolean;
  history: Array<{
    id: string;
    timestamp: string;
    description: string;
    deltaCity: number;
    deltaPersonal: number;
    deltaCoop: number;
  }>;
  preTestCompleted?: boolean;
  preTestScore?: number;
  preTestEvaluations?: Array<{
    attribute: AttributeKey;
    score: number;
    feedback: string;
    answer?: string;
  }>;
}

export interface GameRoom {
  roomCode: string;
  mediaKitCode: string;
  initialCityIntegrity: number; // default >= 100
  cityIntegrity: number;
  durationMinutes: number; // >= 20
  timeRemainingSeconds: number;
  isPaused: boolean;
  isGameOver: boolean;
  gameOverReason?: string;
  players: RoomPlayer[];
  currentTurnIndex: number;
  createdAt: string;
  logs: Array<{
    id: string;
    timestamp: string;
    message: string;
    type: 'system' | 'score' | 'nfc' | 'mission' | 'news';
  }>;
}
