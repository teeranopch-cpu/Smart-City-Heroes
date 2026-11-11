import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Users, 
  Award, 
  Radio, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Upload, 
  Search, 
  Eye, 
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  FolderPlus,
  Settings2,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { 
  MediaKit, 
  PrePostQuestion, 
  RoleMission, 
  CooperationMission, 
  TileQuestion, 
  CertificateConfig, 
  UserAccount, 
  RoleKey, 
  ROLES, 
  AttributeKey, 
  INTEGRITY_ATTRIBUTES 
} from '../types';
import { StorageService } from '../storage';

export const AdminDashboard: React.FC = () => {
  // Main Navigation: Media Kits vs Student Reports
  const [mainSection, setMainSection] = useState<'kits' | 'students'>('kits');

  // Media Kits State
  const [mediaKits, setMediaKits] = useState<MediaKit[]>([]);
  const [selectedKitCode, setSelectedKitCode] = useState<string>('');
  const [isKitOpen, setIsKitOpen] = useState<boolean>(false);

  // New Kit Creation Form
  const [newKitCode, setNewKitCode] = useState('');
  const [newKitName, setNewKitName] = useState('');
  const [newKitSchool, setNewKitSchool] = useState('');
  const [newKitNotes, setNewKitNotes] = useState('');

  // Sub-tabs inside the opened Media Kit
  const [kitTab, setKitTab] = useState<'prepost' | 'missions' | 'tiles' | 'certificate'>('prepost');

  // Pre/Post State for the opened kit
  const [questions, setQuestions] = useState<PrePostQuestion[]>([]);
  const [newQAttribute, setNewQAttribute] = useState<AttributeKey>('thinking');
  const [newQType, setNewQType] = useState<'pre' | 'post' | 'both'>('both');
  const [newQText, setNewQText] = useState('');
  const [newQGuideline, setNewQGuideline] = useState('');

  // Role Missions State for the opened kit
  const [roleMissions, setRoleMissions] = useState<RoleMission[]>([]);
  const [newMRole, setNewMRole] = useState<RoleKey>('government');
  const [newMStep, setNewMStep] = useState<1 | 2 | 3>(1);
  const [newMNfc, setNewMNfc] = useState('');
  const [newMTitle, setNewMTitle] = useState('');
  const [newMDesc, setNewMDesc] = useState('');
  const [newMCityImpact, setNewMCityImpact] = useState(10);
  const [newMPersonalReward, setNewMPersonalReward] = useState(15);

  // Cooperation Missions State for the opened kit
  const [coopMissions, setCoopMissions] = useState<CooperationMission[]>([]);
  const [newCoopNfc, setNewCoopNfc] = useState('');
  const [newCoopTitle, setNewCoopTitle] = useState('');
  const [newCoopDesc, setNewCoopDesc] = useState('');
  const [newCoopPoints, setNewCoopPoints] = useState(15);
  const [newCoopCityImpact, setNewCoopCityImpact] = useState(10);

  // Tile Questions State for the opened kit
  const [tileQuestions, setTileQuestions] = useState<TileQuestion[]>([]);
  const [newTileNfc, setNewTileNfc] = useState('');
  const [newTileCategory, setNewTileCategory] = useState<string>('thinking');
  const [newTileCategoryTitle, setNewTileCategoryTitle] = useState('ช่องทักษะกระบวนการคิด');
  const [newTileQuestionText, setNewTileQuestionText] = useState('');
  const [newTileOpt1, setNewTileOpt1] = useState('');
  const [newTileOpt2, setNewTileOpt2] = useState('');
  const [newTileOpt3, setNewTileOpt3] = useState('');
  const [newTileCorrect, setNewTileCorrect] = useState(0);
  const [newTileCity, setNewTileCity] = useState(10);
  const [newTilePersonal, setNewTilePersonal] = useState(10);

  // Certificate Config State for the opened kit
  const [certConfig, setCertConfig] = useState<CertificateConfig>(() => StorageService.getCertificateConfig('KIT-001'));
  const [certSaveSuccess, setCertSaveSuccess] = useState(false);

  // Students & Reports State
  const [students, setStudents] = useState<UserAccount[]>([]);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<UserAccount | null>(null);
  const [studentSearchKit, setStudentSearchKit] = useState<string>('ALL');

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = (targetCode?: string) => {
    const kits = StorageService.getMediaKits();
    setMediaKits(kits);

    const activeCode = targetCode || selectedKitCode || (kits.length > 0 ? kits[0].code : '');
    setSelectedKitCode(activeCode);

    if (activeCode) {
      const activeKit = kits.find((k) => k.code.trim().toUpperCase() === activeCode.trim().toUpperCase());
      if (activeKit) {
        setQuestions(activeKit.prePostQuestions || []);
        setRoleMissions(activeKit.roleMissions || []);
        setCoopMissions(activeKit.cooperationMissions || []);
        setTileQuestions(activeKit.tileQuestions || []);
        setCertConfig(activeKit.certificateConfig || StorageService.getCertificateConfig(activeKit.code));
      } else {
        setQuestions([]);
        setRoleMissions([]);
        setCoopMissions([]);
        setTileQuestions([]);
      }
    } else {
      setQuestions([]);
      setRoleMissions([]);
      setCoopMissions([]);
      setTileQuestions([]);
    }

    setStudents(StorageService.getUsers());
  };

  // --- Handler: Create Media Kit ---
  const handleAddMediaKit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newKitCode.trim().toUpperCase();
    if (!cleanCode || !newKitName.trim()) return;

    // Check duplicate code
    if (mediaKits.some((k) => k.code.toUpperCase() === cleanCode)) {
      alert(`รหัสชุดสื่อการสอน "${cleanCode}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    const newKit: MediaKit = {
      id: cleanCode,
      code: cleanCode,
      name: newKitName.trim(),
      schoolOrOrg: newKitSchool.trim() || 'ศูนย์เครือข่ายโรงเรียนสุจริต',
      createdAt: new Date().toISOString(),
      notes: newKitNotes.trim() || 'ชุดสื่อการสอนสุจริต',
      prePostQuestions: [],
      roleMissions: [],
      cooperationMissions: [],
      tileQuestions: [],
      certificateConfig: { ...certConfig }
    };

    StorageService.saveMediaKit(newKit);
    setNewKitCode('');
    setNewKitName('');
    setNewKitSchool('');
    setNewKitNotes('');

    // Open this newly created kit immediately so question/mission forms appear!
    setSelectedKitCode(cleanCode);
    setIsKitOpen(true);
    setKitTab('prepost');
    refreshAllData(cleanCode);
  };

  const handleOpenKit = (kit: MediaKit) => {
    setSelectedKitCode(kit.code);
    setIsKitOpen(true);
    setKitTab('prepost');
    refreshAllData(kit.code);
  };

  const handleDeleteMediaKit = (code: string) => {
    const kit = mediaKits.find((k) => k.code === code);
    if (!kit) return;
    const confirmDel = confirm(`ยืนยันการลบชุดสื่อการสอน "${kit.code} - ${kit.name}" หรือไม่? ข้อมูลข้อสอบและภารกิจทั้งหมดในชุดนี้จะถูกลบ`);
    if (!confirmDel) return;

    StorageService.deleteMediaKit(kit.id);
    if (selectedKitCode === code) {
      setIsKitOpen(false);
      setSelectedKitCode('');
    }
    refreshAllData();
  };

  // --- Handlers: Pre/Post Questions ---
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim() || !selectedKitCode) return;

    const newQ: PrePostQuestion = {
      id: 'PQ-' + Date.now(),
      attribute: newQAttribute,
      questionText: newQText.trim(),
      guideline: newQGuideline.trim() || 'คำตอบสะท้อนคุณธรรมและความโปร่งใสเพื่อส่วนรวม',
      type: newQType,
      points: 10
    };

    StorageService.savePrePostQuestion(newQ, selectedKitCode);
    setNewQText('');
    setNewQGuideline('');
    refreshAllData(selectedKitCode);
  };

  const handleDeleteQuestion = (id: string) => {
    StorageService.deletePrePostQuestion(id, selectedKitCode);
    refreshAllData(selectedKitCode);
  };

  // --- Handlers: Role Missions ---
  const handleAddRoleMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMTitle.trim() || !selectedKitCode) return;

    const mission: RoleMission = {
      id: 'RM-' + Date.now(),
      nfcCode: newMNfc.trim().toUpperCase() || `NFC-${newMRole.slice(0, 3).toUpperCase()}-${newMStep}-${Date.now().toString().slice(-3)}`,
      role: newMRole,
      step: newMStep,
      title: newMTitle.trim(),
      description: newMDesc.trim(),
      cityImpact: Number(newMCityImpact),
      personalReward: Number(newMPersonalReward)
    };

    StorageService.saveRoleMission(mission, selectedKitCode);
    setNewMTitle('');
    setNewMDesc('');
    setNewMNfc('');
    refreshAllData(selectedKitCode);
  };

  const handleDeleteRoleMission = (id: string) => {
    StorageService.deleteRoleMission(id, selectedKitCode);
    refreshAllData(selectedKitCode);
  };

  // --- Handlers: Cooperation Missions ---
  const handleAddCoopMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoopTitle.trim() || !selectedKitCode) return;

    const coop: CooperationMission = {
      id: 'COOP-' + Date.now(),
      nfcCode: newCoopNfc.trim().toUpperCase() || `COOP-${Date.now().toString().slice(-4)}`,
      title: newCoopTitle.trim(),
      requiredRoles: ['government', 'business', 'citizen'],
      description: newCoopDesc.trim(),
      coopPoints: Number(newCoopPoints),
      cityImpact: Number(newCoopCityImpact)
    };

    StorageService.saveCooperationMission(coop, selectedKitCode);
    setNewCoopTitle('');
    setNewCoopDesc('');
    setNewCoopNfc('');
    refreshAllData(selectedKitCode);
  };

  const handleDeleteCoopMission = (id: string) => {
    StorageService.deleteCooperationMission(id, selectedKitCode);
    refreshAllData(selectedKitCode);
  };

  // --- Handlers: Tile Questions ---
  const handleAddTileQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTileQuestionText.trim() || !selectedKitCode) return;

    const options = [newTileOpt1.trim(), newTileOpt2.trim(), newTileOpt3.trim()].filter(Boolean);

    const tileQ: TileQuestion = {
      id: 'TQ-' + Date.now(),
      nfcCode: newTileNfc.trim().toUpperCase() || `TILE-${Date.now().toString().slice(-4)}`,
      category: newTileCategory as any,
      categoryTitle: newTileCategoryTitle,
      question: newTileQuestionText.trim(),
      options: options.length > 0 ? options : ['ตัวเลือกที่ 1', 'ตัวเลือกที่ 2'],
      correctOptionIndex: Number(newTileCorrect),
      explanation: 'การตัดสินใจอย่างมีจริยธรรมเพื่อประโยชน์ส่วนรวม',
      pointsCity: Number(newTileCity),
      pointsPersonal: Number(newTilePersonal)
    };

    StorageService.saveTileQuestion(tileQ, selectedKitCode);
    setNewTileQuestionText('');
    setNewTileOpt1('');
    setNewTileOpt2('');
    setNewTileOpt3('');
    setNewTileNfc('');
    refreshAllData(selectedKitCode);
  };

  const handleDeleteTileQuestion = (id: string) => {
    StorageService.deleteTileQuestion(id, selectedKitCode);
    refreshAllData(selectedKitCode);
  };

  // --- Handlers: Certificate Template ---
  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKitCode) return;
    StorageService.saveCertificateConfig(certConfig, selectedKitCode);
    setCertSaveSuccess(true);
    setTimeout(() => setCertSaveSuccess(false), 3000);
    refreshAllData(selectedKitCode);
  };

  const handleCertBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCertConfig({ ...certConfig, customBgUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Current active media kit object
  const currentKit = mediaKits.find((k) => k.code === selectedKitCode);

  // Filter students by kit
  const filteredStudents = studentSearchKit === 'ALL'
    ? students
    : students.filter((s) => s.mediaKitCode.toUpperCase() === studentSearchKit.toUpperCase());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in font-['Prompt',sans-serif]">
      
      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-[#112240] to-amber-950/40 border border-amber-600/40 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/50 border border-amber-500/40 text-amber-200 text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              แผงควบคุมครูผู้สอน / ผู้ดูแลระบบ (Admin Portal)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              จัดการชุดสื่อการสอน & คลังข้อสอบภารกิจสุจริต
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-light">
              สร้างชุดสื่อการสอนเพื่อกำหนดข้อสอบ Pre/Post 5 คุณลักษณะ, ภารกิจ 6 บทบาท, คำถามประจำช่อง และเทมเพลตเกียรติบัตร
            </p>
          </div>

          <div className="text-xs text-amber-300/80 bg-black/40 px-3.5 py-2 rounded-xl border border-amber-700/40 whitespace-nowrap">
            สถานะ: ผู้ดูแลระบบ (ครูผู้สอน)
          </div>
        </div>

        {/* Top-Level Navigation Switcher */}
        <div className="flex gap-3 mt-6 border-t border-[#233554] pt-4">
          <button
            onClick={() => setMainSection('kits')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              mainSection === 'kits'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-[#0A192F] text-slate-300 hover:text-white border border-[#233554]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. จัดการชุดสื่อการสอน (ข้อสอบ & ภารกิจ)</span>
          </button>

          <button
            onClick={() => setMainSection('students')}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
              mainSection === 'students'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-[#0A192F] text-slate-300 hover:text-white border border-[#233554]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. รายงานผู้เรียน & คะแนน ({students.length})</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: MEDIA KITS & UNIFIED CONTENT ================= */}
      {mainSection === 'kits' && (
        <div className="space-y-6">

          {/* VIEW A: OVERVIEW & CREATE NEW MEDIA KIT (When no kit is opened for editing) */}
          {!isKitOpen && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Instructions banner */}
              <div className="bg-[#112240] border border-blue-500/30 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white text-sm mb-0.5">
                    ขั้นตอนการใช้งาน: ต้องกดสร้างชุดสื่อการสอนก่อน เนื้อหาข้อสอบและภารกิจถึงจะปรากฏขึ้นมา
                  </div>
                  <p className="text-slate-400">
                    เมื่อกดปุ่ม "สร้างชุดสื่อการสอนนี้" หรือคลิก "จัดการข้อสอบ & ภารกิจชุดนี้" บนการ์ดสื่อที่มีอยู่แล้ว ระบบจะเปิดพื้นที่รวมทุกเนื้อหา (ข้อสอบ, ภารกิจ 6 บทบาท, คำถามประจำช่อง, เกียรติบัตร) ของสื่อชุดนั้นในหน้าเดียว ไม่แยกออกจากกัน
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1) Form: Create New Media Kit */}
                <div className="bg-[#112240] border-2 border-blue-500/40 rounded-3xl p-6 shadow-2xl space-y-4 h-fit">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-[#233554]">
                    <div className="p-2 rounded-xl bg-blue-900/50 border border-blue-500/40 text-blue-300">
                      <FolderPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white">
                        สร้างชุดสื่อการสอนใหม่
                      </h3>
                      <p className="text-[11px] text-blue-300">
                        กดสร้างสื่อก่อน เพื่อเริ่มใส่ข้อสอบและภารกิจ
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddMediaKit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        รหัสประจำชุดสื่อการสอน (Kit Code) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น KIT-003 หรือ SIC-BOX-02"
                        value={newKitCode}
                        onChange={(e) => setNewKitCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white font-mono font-bold uppercase text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        ชื่อชุดสื่อการสอน *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="เช่น ชุดสื่อบอร์ดเกมสุจริต ม.ปลาย รุ่นที่ 1"
                        value={newKitName}
                        onChange={(e) => setNewKitName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        โรงเรียน / หน่วยงานต้นสังกัด
                      </label>
                      <input
                        type="text"
                        placeholder="เช่น โรงเรียนสุจริตวิทยาคม"
                        value={newKitSchool}
                        onChange={(e) => setNewKitSchool(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        หมายเหตุ / วัตถุประสงค์
                      </label>
                      <textarea
                        rows={2}
                        placeholder="คำอธิบายกลุ่มเป้าหมายหรือกิจกรรม..."
                        value={newKitNotes}
                        onChange={(e) => setNewKitNotes(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>✨ สร้างชุดสื่อการสอนนี้ (เปิดหน้าข้อสอบ & ภารกิจ)</span>
                    </button>
                  </form>
                </div>

                {/* 2) List: Existing Media Kits Cards */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-300" />
                      รายการชุดสื่อการสอนในระบบ ({mediaKits.length} ชุด)
                    </h3>
                    <span className="text-xs text-slate-400">
                      คลิกเพื่อจัดการข้อสอบและภารกิจของแต่ละชุด
                    </span>
                  </div>

                  {mediaKits.length === 0 ? (
                    <div className="bg-[#112240] border border-[#233554] rounded-3xl p-10 text-center text-slate-400 text-xs sm:text-sm space-y-3">
                      <FolderPlus className="w-10 h-10 text-slate-500 mx-auto" />
                      <p className="text-white font-medium">ยังไม่มีชุดสื่อการสอนในระบบ</p>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto">
                        โปรดกรอกข้อมูลในฟอร์มด้านซ้ายและกด "สร้างชุดสื่อการสอนนี้" เพื่อเริ่มต้น
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mediaKits.map((kit) => {
                        const qCount = kit.prePostQuestions?.length || 0;
                        const mCount = (kit.roleMissions?.length || 0) + (kit.cooperationMissions?.length || 0);
                        const tCount = kit.tileQuestions?.length || 0;

                        return (
                          <div
                            key={kit.id}
                            className="bg-[#112240] border border-[#233554] hover:border-blue-500/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between gap-4 transition-all"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-mono font-bold text-xs text-white bg-[#0A192F] px-2.5 py-1 rounded-lg border border-[#233554]">
                                  {kit.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMediaKit(kit.code)}
                                  className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors"
                                  title="ลบชุดสื่อนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div>
                                <h4 className="font-bold text-sm text-white">{kit.name}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{kit.schoolOrOrg}</p>
                              </div>

                              {/* Content Badges */}
                              <div className="grid grid-cols-3 gap-1.5 pt-2 text-center text-[10px]">
                                <div className="p-2 rounded-xl bg-[#0A192F] border border-[#233554]">
                                  <div className="text-slate-400">ข้อสอบ</div>
                                  <div className="font-bold text-blue-300 text-xs mt-0.5">{qCount} ข้อ</div>
                                </div>
                                <div className="p-2 rounded-xl bg-[#0A192F] border border-[#233554]">
                                  <div className="text-slate-400">ภารกิจ</div>
                                  <div className="font-bold text-amber-300 text-xs mt-0.5">{mCount} รายการ</div>
                                </div>
                                <div className="p-2 rounded-xl bg-[#0A192F] border border-[#233554]">
                                  <div className="text-slate-400">คำถามช่อง</div>
                                  <div className="font-bold text-emerald-300 text-xs mt-0.5">{tCount} ข้อ</div>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenKit(kit)}
                              className="w-full py-2.5 px-4 bg-[#1E3A8A] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                              <span>จัดการข้อสอบ & ภารกิจชุดนี้</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* VIEW B: UNIFIED MEDIA KIT WORKSPACE (Only appears after creating or selecting a kit!) */}
          {isKitOpen && currentKit && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Workspace Navigation Header */}
              <div className="bg-[#112240] border-2 border-blue-500/40 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsKitOpen(false)}
                    className="p-2.5 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#233554] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="กลับไปหน้ารายการชุดสื่อ"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>กลับหน้ารายการชุดสื่อ</span>
                  </button>

                  <div>
                    <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                      <span>กำลังจัดการเนื้อหาของชุดสื่อการสอน:</span>
                      <span className="font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30 text-white">
                        {currentKit.code}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                      {currentKit.name}
                    </h2>
                    <p className="text-xs text-slate-400">
                      สังกัด: {currentKit.schoolOrOrg} • ข้อมูลทั้งหมดด้านล่างจะรวมอยู่ภายในชุดสื่อนี้
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <span className="text-xs text-slate-300 whitespace-nowrap">สลับชุดสื่อ:</span>
                  <select
                    value={selectedKitCode}
                    onChange={(e) => {
                      setSelectedKitCode(e.target.value);
                      refreshAllData(e.target.value);
                    }}
                    className="px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500 w-full md:w-auto"
                  >
                    {mediaKits.map((k) => (
                      <option key={k.id} value={k.code}>
                        {k.code} - {k.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-tabs inside this created kit (Unified format: No News Cards!) */}
              <div className="flex overflow-x-auto space-x-2 border-b border-[#233554] pb-2 text-xs sm:text-sm font-medium">
                <button
                  onClick={() => setKitTab('prepost')}
                  className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                    kitTab === 'prepost'
                      ? 'bg-[#1E3A8A] text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#112240]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-300" />
                  <span>1. ข้อสอบ Pre / Post ({questions.length} ข้อ)</span>
                </button>

                <button
                  onClick={() => setKitTab('missions')}
                  className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                    kitTab === 'missions'
                      ? 'bg-[#1E3A8A] text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#112240]'
                  }`}
                >
                  <Layers className="w-4 h-4 text-amber-300" />
                  <span>2. ภารกิจ 6 บทบาท & ร่วมมือ ({roleMissions.length + coopMissions.length} รายการ)</span>
                </button>

                <button
                  onClick={() => setKitTab('tiles')}
                  className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                    kitTab === 'tiles'
                      ? 'bg-[#1E3A8A] text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#112240]'
                  }`}
                >
                  <Radio className="w-4 h-4 text-emerald-300" />
                  <span>3. คำถามประจำช่องบอร์ดเกม ({tileQuestions.length} ข้อ)</span>
                </button>

                <button
                  onClick={() => setKitTab('certificate')}
                  className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                    kitTab === 'certificate'
                      ? 'bg-amber-800 text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#112240]'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>4. เทมเพลตเกียรติบัตรประจำชุดสื่อ</span>
                </button>
              </div>

              {/* MODULE 1: PRE/POST EXAMS */}
              {kitTab === 'prepost' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                  
                  {/* Add Question Form */}
                  <div className="bg-[#112240] border border-[#233554] rounded-2xl p-6 shadow-xl h-fit space-y-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-400" />
                      เพิ่มข้อสอบอัตนัยคุณลักษณะ 5 ประการ
                    </h3>
                    
                    <form onSubmit={handleAddQuestion} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          คุณลักษณะ 5 ประการ *
                        </label>
                        <select
                          value={newQAttribute}
                          onChange={(e) => setNewQAttribute(e.target.value as AttributeKey)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                        >
                          {Object.keys(INTEGRITY_ATTRIBUTES).map((key) => {
                            const attr = INTEGRITY_ATTRIBUTES[key as AttributeKey];
                            return (
                              <option key={key} value={key}>
                                {attr.icon} {attr.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ประเภทข้อสอบ *
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setNewQType('pre')}
                            className={`py-2 rounded-lg border text-center transition-colors ${
                              newQType === 'pre'
                                ? 'bg-blue-600 border-blue-400 text-white font-semibold'
                                : 'bg-[#0A192F] border-[#233554] text-slate-300'
                            }`}
                          >
                            ก่อนเรียน (Pre)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewQType('post')}
                            className={`py-2 rounded-lg border text-center transition-colors ${
                              newQType === 'post'
                                ? 'bg-blue-600 border-blue-400 text-white font-semibold'
                                : 'bg-[#0A192F] border-[#233554] text-slate-300'
                            }`}
                          >
                            หลังเรียน (Post)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewQType('both')}
                            className={`py-2 rounded-lg border text-center transition-colors ${
                              newQType === 'both'
                                ? 'bg-blue-600 border-blue-400 text-white font-semibold'
                                : 'bg-[#0A192F] border-[#233554] text-slate-300'
                            }`}
                          >
                            ทั้งสองช่วง
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          โจทย์ข้อสอบ (คำถามอัตนัย) *
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="เช่น หากท่านพบเห็นการทุจริตในชุมชน ท่านจะมีขั้นตอนการตัดสินใจและแก้ไขปัญหาอย่างไร..."
                          value={newQText}
                          onChange={(e) => setNewQText(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          แนวทางคำตอบ / เกณฑ์การให้คะแนน
                        </label>
                        <input
                          type="text"
                          placeholder="คำตอบควรสะท้อนการยึดถือประโยชน์ส่วนรวมมากกว่าส่วนตน..."
                          value={newQGuideline}
                          onChange={(e) => setNewQGuideline(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>บันทึกข้อสอบลงในชุดสื่อ {selectedKitCode}</span>
                      </button>
                    </form>
                  </div>

                  {/* Questions List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-white">
                        รายการข้อสอบในชุดสื่อ ({questions.length} ข้อ)
                      </h3>
                      <span className="text-xs text-slate-400">
                        ชุดสื่อ: {selectedKitCode}
                      </span>
                    </div>

                    {questions.length === 0 ? (
                      <div className="bg-[#112240] border border-[#233554] rounded-2xl p-8 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                        <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-white font-medium">ยังไม่มีข้อสอบในชุดสื่อนี้</p>
                        <p className="text-slate-500 text-xs">
                          สามารถเพิ่มข้อสอบใหม่ผ่านฟอร์มทางด้านซ้ายได้ทันที
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {questions.map((q, idx) => {
                          const attr = INTEGRITY_ATTRIBUTES[q.attribute];
                          return (
                            <div
                              key={q.id}
                              className="p-4 rounded-xl bg-[#112240] border border-[#233554] flex items-start justify-between gap-4"
                            >
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="w-6 h-6 rounded-lg bg-[#0A192F] text-xs font-bold text-white flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-900/40 text-blue-300 border border-blue-500/30">
                                    {attr ? attr.icon : '📝'} {attr ? attr.name : q.attribute}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                    {q.type === 'both' ? 'Pre & Post' : q.type === 'pre' ? 'Pre-test' : 'Post-test'}
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm text-white font-medium">
                                  {q.questionText}
                                </div>
                                {q.guideline && (
                                  <div className="text-[11px] text-slate-400 italic">
                                    แนวคำตอบ: {q.guideline}
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                                title="ลบข้อสอบนี้"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* MODULE 2: ROLE MISSIONS & COOPERATION */}
              {kitTab === 'missions' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                  
                  {/* Left Column: Role Missions (6 Roles, 3 Steps) */}
                  <div className="bg-[#112240] border border-[#233554] rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-400" />
                      เพิ่มภารกิจประจำตัวละคร 6 บทบาท (ขั้น 1–3)
                    </h3>

                    <form onSubmit={handleAddRoleMission} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            เลือกบทบาท *
                          </label>
                          <select
                            value={newMRole}
                            onChange={(e) => setNewMRole(e.target.value as RoleKey)}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            {Object.keys(ROLES).map((rk) => (
                              <option key={rk} value={rk}>
                                {ROLES[rk as RoleKey].badge} {ROLES[rk as RoleKey].name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            ขั้นภารกิจ *
                          </label>
                          <select
                            value={newMStep}
                            onChange={(e) => setNewMStep(Number(e.target.value) as 1 | 2 | 3)}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value={1}>ขั้นที่ 1 (เริ่มต้น)</option>
                            <option value={2}>ขั้นที่ 2 (ปฏิบัติการ)</option>
                            <option value={3}>ขั้นที่ 3 (ผลักดันเมือง)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          รหัสการ์ด NFC *
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น GOV-M1-NFC หรือเว้นว่างเพื่อสุ่ม"
                          value={newMNfc}
                          onChange={(e) => setNewMNfc(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ชื่อภารกิจ *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="เช่น ตรวจสอบร่าง พ.ร.บ. งบประมาณโปร่งใส"
                          value={newMTitle}
                          onChange={(e) => setNewMTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          คำอธิบายภารกิจ
                        </label>
                        <textarea
                          rows={2}
                          placeholder="เงื่อนไขและสิ่งที่ผู้เล่นต้องปฏิบัติ..."
                          value={newMDesc}
                          onChange={(e) => setNewMDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            ดัชนีเมือง (+แต้ม)
                          </label>
                          <input
                            type="number"
                            value={newMCityImpact}
                            onChange={(e) => setNewMCityImpact(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            แต้มชีวิตผู้เล่น (+แต้ม)
                          </label>
                          <input
                            type="number"
                            value={newMPersonalReward}
                            onChange={(e) => setNewMPersonalReward(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>บันทึกภารกิจบทบาท</span>
                      </button>
                    </form>

                    {/* Missions List */}
                    <div className="pt-4 border-t border-[#233554] space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-300">
                        รายการภารกิจ 6 บทบาท ({roleMissions.length} ภารกิจ)
                      </h4>
                      {roleMissions.map((m) => {
                        const r = ROLES[m.role];
                        return (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-[#0A192F] border border-[#233554] flex items-center justify-between text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-semibold text-white">
                                <span>{r.badge} {r.name} (ขั้น {m.step})</span>
                                <span className="font-mono text-[10px] text-blue-300">[{m.nfcCode}]</span>
                              </div>
                              <div className="text-slate-300">{m.title}</div>
                              <div className="text-[10px] text-emerald-400">
                                +{m.cityImpact} เมือง / +{m.personalReward} ผู้เล่น
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteRoleMission(m.id)}
                              className="text-slate-400 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                      {roleMissions.length === 0 && (
                        <div className="text-center text-xs text-slate-500 py-4">
                          ยังไม่มีภารกิจ 6 บทบาทในชุดสื่อนี้
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Cooperation Missions */}
                  <div className="bg-[#112240] border border-[#233554] rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      เพิ่มภารกิจความร่วมมือช่วยเหลือผู้อื่น (ผูก NFC)
                    </h3>

                    <form onSubmit={handleAddCoopMission} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          รหัสการ์ด NFC *
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น COOP-CARD-01 หรือเว้นว่างเพื่อสุ่ม"
                          value={newCoopNfc}
                          onChange={(e) => setNewCoopNfc(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500 uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ชื่อภารกิจความร่วมมือ *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="เช่น ร่วมมือตรวจสอบโครงการก่อสร้างสนามกีฬาชุมชน"
                          value={newCoopTitle}
                          onChange={(e) => setNewCoopTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          คำอธิบายความร่วมมือ
                        </label>
                        <textarea
                          rows={2}
                          placeholder="เช่น ต้องมีตัวละครรัฐบาลและประชาชนร่วมลงชื่อ..."
                          value={newCoopDesc}
                          onChange={(e) => setNewCoopDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            แต้มความร่วมมือ (+แต้ม)
                          </label>
                          <input
                            type="number"
                            value={newCoopPoints}
                            onChange={(e) => setNewCoopPoints(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            ดัชนีเมือง (+แต้ม)
                          </label>
                          <input
                            type="number"
                            value={newCoopCityImpact}
                            onChange={(e) => setNewCoopCityImpact(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>บันทึกภารกิจความร่วมมือ</span>
                      </button>
                    </form>

                    {/* Coop List */}
                    <div className="pt-4 border-t border-[#233554] space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-300">
                        รายการภารกิจร่วมมือ ({coopMissions.length} ภารกิจ)
                      </h4>
                      {coopMissions.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-[#0A192F] border border-[#233554] flex items-center justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-white">
                              <span>🤝 {c.title}</span>
                              <span className="font-mono text-[10px] text-emerald-300">[{c.nfcCode}]</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              +{c.coopPoints} แต้มร่วมมือ / +{c.cityImpact} เมือง
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoopMission(c.id)}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {coopMissions.length === 0 && (
                        <div className="text-center text-xs text-slate-500 py-4">
                          ยังไม่มีภารกิจความร่วมมือในชุดสื่อนี้
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* MODULE 3: TILE QUESTIONS */}
              {kitTab === 'tiles' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                  
                  {/* Add Tile Question Form */}
                  <div className="bg-[#112240] border border-[#233554] rounded-2xl p-6 shadow-xl h-fit space-y-4">
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-emerald-400" />
                      เพิ่มคำถามประจำช่องบอร์ดเกม (ผูก NFC)
                    </h3>

                    <form onSubmit={handleAddTileQuestion} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          รหัสการ์ด NFC *
                        </label>
                        <input
                          type="text"
                          placeholder="เช่น TILE-Q1-NFC หรือเว้นว่างเพื่อสุ่ม"
                          value={newTileNfc}
                          onChange={(e) => setNewTileNfc(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-blue-500 uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            หมวดหมู่คุณลักษณะ *
                          </label>
                          <select
                            value={newTileCategory}
                            onChange={(e) => {
                              setNewTileCategory(e.target.value);
                              const a = INTEGRITY_ATTRIBUTES[e.target.value as AttributeKey];
                              if (a) setNewTileCategoryTitle(`ช่อง${a.name}`);
                            }}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            {Object.keys(INTEGRITY_ATTRIBUTES).map((k) => (
                              <option key={k} value={k}>
                                {INTEGRITY_ATTRIBUTES[k as AttributeKey].name}
                              </option>
                            ))}
                            <option value="corruption_check">การตรวจสอบทุจริต</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            ชื่อหัวข้อช่อง
                          </label>
                          <input
                            type="text"
                            value={newTileCategoryTitle}
                            onChange={(e) => setNewTileCategoryTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          โจทย์คำถาม *
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="พิมพ์สถานการณ์หรือคำถามตัดสินใจ..."
                          value={newTileQuestionText}
                          onChange={(e) => setNewTileQuestionText(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-300">
                          ตัวเลือกคำตอบ 3 ข้อ:
                        </label>
                        <input
                          type="text"
                          placeholder="ตัวเลือก 1"
                          value={newTileOpt1}
                          onChange={(e) => setNewTileOpt1(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0A192F] border border-[#233554] rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="ตัวเลือก 2"
                          value={newTileOpt2}
                          onChange={(e) => setNewTileOpt2(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0A192F] border border-[#233554] rounded-lg text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="ตัวเลือก 3"
                          value={newTileOpt3}
                          onChange={(e) => setNewTileOpt3(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0A192F] border border-[#233554] rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ข้อที่ถูกต้อง (ทางเลือกที่สุจริตที่สุด)
                        </label>
                        <select
                          value={newTileCorrect}
                          onChange={(e) => setNewTileCorrect(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                        >
                          <option value={0}>ตัวเลือกที่ 1</option>
                          <option value={1}>ตัวเลือกที่ 2</option>
                          <option value={2}>ตัวเลือกที่ 3</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            แต้มเมือง (+แต้ม)
                          </label>
                          <input
                            type="number"
                            value={newTileCity}
                            onChange={(e) => setNewTileCity(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            แต้มผู้เล่น (+แต้ม)
                          </label>
                          <input
                            type="number"
                            value={newTilePersonal}
                            onChange={(e) => setNewTilePersonal(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>บันทึกคำถามประจำช่อง</span>
                      </button>
                    </form>
                  </div>

                  {/* Tile Questions List */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-white">
                        รายการคำถามประจำช่อง ({tileQuestions.length} ข้อ)
                      </h3>
                      <span className="text-xs text-slate-400">
                        ชุดสื่อ: {selectedKitCode}
                      </span>
                    </div>

                    {tileQuestions.length === 0 ? (
                      <div className="bg-[#112240] border border-[#233554] rounded-2xl p-8 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                        <Radio className="w-8 h-8 text-slate-500 mx-auto" />
                        <p className="text-white font-medium">ยังไม่มีคำถามประจำช่องในชุดสื่อนี้</p>
                        <p className="text-slate-500 text-xs">
                          สามารถเพิ่มคำถามสำหรับช่องเดินบอร์ดเกมได้ผ่านฟอร์มทางด้านซ้าย
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tileQuestions.map((t, idx) => (
                          <div
                            key={t.id}
                            className="p-4 rounded-xl bg-[#112240] border border-[#233554] flex items-start justify-between gap-4"
                          >
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="w-6 h-6 rounded-lg bg-[#0A192F] text-xs font-bold text-white flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-600/40 font-semibold">
                                  {t.categoryTitle}
                                </span>
                                <span className="font-mono text-[10px] text-blue-300">
                                  [{t.nfcCode}]
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-white font-medium">
                                {t.question}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-300">
                                {t.options.map((opt, oIdx) => (
                                  <div
                                    key={oIdx}
                                    className={`px-2 py-1 rounded-lg border ${
                                      oIdx === t.correctOptionIndex
                                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-semibold'
                                        : 'bg-[#0A192F] border-[#233554]'
                                    }`}
                                  >
                                    {oIdx + 1}. {opt}
                                  </div>
                                ))}
                              </div>
                              <div className="text-[10px] text-emerald-400">
                                รางวัลตอบถูก: +{t.pointsCity} แต้มเมือง / +{t.pointsPersonal} แต้มส่วนบุคคล
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteTileQuestion(t.id)}
                              className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* MODULE 4: CERTIFICATE CONFIG */}
              {kitTab === 'certificate' && (
                <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        เทมเพลตเกียรติบัตรประจำชุดสื่อ: {selectedKitCode}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ปรับแต่งข้อความและข้อมูลผู้ลงนามในเกียรติบัตรสำหรับผู้เล่นที่ใช้ชุดสื่อนี้
                      </p>
                    </div>

                    {certSaveSuccess && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-600/40">
                        <CheckCircle2 className="w-4 h-4" />
                        บันทึกเรียบร้อย
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveCertificate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ชื่อหัวข้อเกียรติบัตร *
                        </label>
                        <input
                          type="text"
                          value={certConfig.title}
                          onChange={(e) => setCertConfig({ ...certConfig, title: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          คำนำหน้าเลขที่เกียรติบัตร *
                        </label>
                        <input
                          type="text"
                          value={certConfig.certificateNoPrefix}
                          onChange={(e) => setCertConfig({ ...certConfig, certificateNoPrefix: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        คำบรรยายรอง (Subtitle) *
                      </label>
                      <input
                        type="text"
                        value={certConfig.subtitle}
                        onChange={(e) => setCertConfig({ ...certConfig, subtitle: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        ข้อความรับรองในเนื้อหาเกียรติบัตร *
                      </label>
                      <textarea
                        rows={3}
                        value={certConfig.bodyTemplate}
                        onChange={(e) => setCertConfig({ ...certConfig, bodyTemplate: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ชื่อผู้อำนวยการ / ผู้ลงนาม *
                        </label>
                        <input
                          type="text"
                          value={certConfig.directorName}
                          onChange={(e) => setCertConfig({ ...certConfig, directorName: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          ตำแหน่งผู้ลงนาม *
                        </label>
                        <input
                          type="text"
                          value={certConfig.directorTitle}
                          onChange={(e) => setCertConfig({ ...certConfig, directorTitle: e.target.value })}
                          className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        ชื่อองค์กร / โครงการ *
                      </label>
                      <input
                        type="text"
                        value={certConfig.organizationName}
                        onChange={(e) => setCertConfig({ ...certConfig, organizationName: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        ภาพพื้นหลังเกียรติบัตรเฉพาะชุดสื่อนี้ (ถ้าต้องการเปลี่ยน)
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer px-4 py-2 bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#233554] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>อัปโหลดภาพพื้นหลัง</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCertBgUpload}
                            className="hidden"
                          />
                        </label>
                        {certConfig.customBgUrl && (
                          <button
                            type="button"
                            onClick={() => setCertConfig({ ...certConfig, customBgUrl: undefined })}
                            className="text-xs text-rose-400 hover:underline"
                          >
                            ใช้พื้นหลังมาตรฐาน
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all mt-4"
                    >
                      <Check className="w-4 h-4" />
                      <span>บันทึกการตั้งค่าเกียรติบัตรสำหรับชุดสื่อ {selectedKitCode}</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ================= SECTION 2: STUDENT REPORTS & SCORES ================= */}
      {mainSection === 'students' && (
        <div className="bg-[#112240] border border-[#233554] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#233554] gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-300" />
                รายงานผลคะแนนและการทำข้อสอบของผู้เรียน
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ดูผลการทำแบบทดสอบก่อนเรียน/หลังเรียน และภาพภารกิจพฤติกรรมสุจริตที่ส่ง
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">กรองตามชุดสื่อ:</span>
              <select
                value={studentSearchKit}
                onChange={(e) => setStudentSearchKit(e.target.value)}
                className="px-3 py-1.5 bg-[#0A192F] border border-[#233554] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">ทั้งหมดทุกชุดสื่อ</option>
                {mediaKits.map((k) => (
                  <option key={k.id} value={k.code}>
                    {k.code} - {k.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs sm:text-sm space-y-2">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-white font-medium">ยังไม่มีข้อมูลผู้เรียนในระบบ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A192F] text-slate-300 uppercase tracking-wider text-[11px] border-b border-[#233554]">
                  <tr>
                    <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4">ชุดสื่อการสอน</th>
                    <th className="py-3 px-4">ข้อสอบก่อนเรียน (Pre)</th>
                    <th className="py-3 px-4">ข้อสอบหลังเรียน (Post)</th>
                    <th className="py-3 px-4">ภาพภารกิจ</th>
                    <th className="py-3 px-4">เกียรติบัตร</th>
                    <th className="py-3 px-4 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233554]/50">
                  {filteredStudents.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1E3A8A]/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        {u.prefix} {u.fullName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{u.status}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-300">
                        {u.mediaKitCode || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {u.preTestCompleted ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            ✓ {u.preTestScore || 100} แต้ม
                          </span>
                        ) : (
                          <span className="text-slate-500">ยังไม่ทำ</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.postTestCompleted ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            ✓ {u.postTestScore || 100} แต้ม
                          </span>
                        ) : (
                          <span className="text-slate-500">ยังไม่ทำ</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.behaviorImages && u.behaviorImages.filter(Boolean).length > 0 ? (
                          <span className="text-blue-300 font-semibold">
                            {u.behaviorImages.filter(Boolean).length} / 5 ภาพ
                          </span>
                        ) : (
                          <span className="text-slate-500">ยังไม่มี</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.certificateIssued ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-semibold border border-emerald-600/40">
                            ออกแล้ว
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">ยังไม่ออก</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForModal(u)}
                          className="px-2.5 py-1 bg-[#1E3A8A] hover:bg-blue-600 text-white rounded-lg text-[11px] font-medium transition-colors"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Student Detail Modal (Answers & Behavior Photos) */}
      {selectedStudentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#112240] border border-[#233554] rounded-3xl p-6 text-white max-h-[90vh] overflow-y-auto space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#233554]">
              <div>
                <h3 className="font-bold text-lg text-white">
                  ข้อมูลผู้เรียน: {selectedStudentForModal.prefix} {selectedStudentForModal.fullName}
                </h3>
                <p className="text-xs text-slate-400">
                  สถานะ: {selectedStudentForModal.status} • ชุดสื่อ: {selectedStudentForModal.mediaKitCode}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pre/Post Answers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-blue-300">ผลการทำแบบทดสอบ</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0A192F] border border-[#233554]">
                  <div className="text-slate-400">คะแนน Pre-test:</div>
                  <div className="text-base font-bold text-white mt-1">
                    {selectedStudentForModal.preTestCompleted ? `${selectedStudentForModal.preTestScore || 100} แต้ม` : 'ยังไม่ทำ'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0A192F] border border-[#233554]">
                  <div className="text-slate-400">คะแนน Post-test:</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">
                    {selectedStudentForModal.postTestCompleted ? `${selectedStudentForModal.postTestScore || 100} แต้ม` : 'ยังไม่ทำ'}
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Behavior Images */}
            <div className="space-y-2 pt-2 border-t border-[#233554]">
              <h4 className="text-xs font-bold text-amber-300">ภาพถ่ายภารกิจ 5 พฤติกรรมคุณลักษณะสุจริต</h4>
              
              {selectedStudentForModal.behaviorImages && selectedStudentForModal.behaviorImages.filter(Boolean).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedStudentForModal.behaviorImages.map((img, idx) => {
                    const titles = [
                      '1. กระบวนการคิด',
                      '2. ความซื่อสัตย์สุจริต',
                      '3. มีวินัย',
                      '4. อยู่อย่างพอเพียง',
                      '5. มีจิตสาธารณะ'
                    ];

                    return (
                      <div key={idx} className="p-2 rounded-xl bg-[#0A192F] border border-[#233554] space-y-1">
                        <div className="text-[10px] font-semibold text-slate-300 truncate">{titles[idx]}</div>
                        {img ? (
                          <img
                            src={img}
                            alt={titles[idx]}
                            className="w-full h-24 object-cover rounded-lg border border-[#233554]"
                          />
                        ) : (
                          <div className="w-full h-24 rounded-lg bg-[#112240] flex items-center justify-center text-[10px] text-slate-500">
                            ยังไม่มีภาพ
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-xs text-slate-400 py-6 bg-[#0A192F] rounded-xl border border-[#233554]">
                  ผู้เรียนยังไม่ได้อัปโหลดภาพภารกิจพฤติกรรมสุจริต
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#233554] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudentForModal(null)}
                className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
