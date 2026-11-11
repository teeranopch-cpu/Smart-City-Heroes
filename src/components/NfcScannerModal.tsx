import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Users, 
  Newspaper, 
  Target, 
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { 
  GameRoom, 
  RoleMission, 
  CooperationMission, 
  TileQuestion, 
  ROLES,
  INTEGRITY_ATTRIBUTES,
  AttributeKey
} from '../types';
import { StorageService } from '../storage';

interface NfcScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoom: GameRoom;
  onApplyRoleMission: (mission: RoleMission, playerId: string) => void;
  onApplyCooperation: (mission: CooperationMission, primaryPlayerId: string, partnerPlayerId: string) => void;
  onApplyTileQuestion: (question: TileQuestion, playerId: string, isCorrect: boolean) => void;
}

export const NfcScannerModal: React.FC<NfcScannerModalProps> = ({
  isOpen,
  onClose,
  activeRoom,
  onApplyRoleMission,
  onApplyCooperation,
  onApplyTileQuestion
}) => {
  const [nfcInput, setNfcInput] = useState<string>('');
  const [isNfcSupported, setIsNfcSupported] = useState<boolean>(false);
  const [isScanningNfc, setIsScanningNfc] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [partnerPlayerId, setPartnerPlayerId] = useState<string>('');

  // Found card item
  const [foundItem, setFoundItem] = useState<{
    type: 'role_mission' | 'cooperation' | 'tile_question';
    item: RoleMission | CooperationMission | TileQuestion;
  } | null>(null);

  const [notFoundCode, setNotFoundCode] = useState<string>('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [answeredQuestion, setAnsweredQuestion] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setNfcInput('');
      setFoundItem(null);
      setNotFoundCode('');
      setSelectedOptionIndex(null);
      setAnsweredQuestion(false);
      setScanStatusMessage('');

      if (activeRoom.players.length > 0) {
        setSelectedPlayerId(activeRoom.players[activeRoom.currentTurnIndex]?.id || activeRoom.players[0].id);
        if (activeRoom.players.length > 1) {
          setPartnerPlayerId(activeRoom.players[1].id);
        }
      }

      // Check Web NFC API availability
      if (typeof window !== 'undefined' && 'NDEFReader' in window) {
        setIsNfcSupported(true);
      } else {
        setIsNfcSupported(false);
      }
    }
  }, [isOpen, activeRoom]);

  if (!isOpen) return null;

  // Real Web NFC API reader
  const handleStartWebNfcScan = async () => {
    if (!('NDEFReader' in window)) {
      setScanStatusMessage('อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับ Web NFC API กรุณาใช้การกรอกรหัสการ์ด');
      return;
    }

    try {
      setIsScanningNfc(true);
      setScanStatusMessage('กำลังรอการแตะบัตร NFC เข้ากับอุปกรณ์...');
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();

      ndef.onreading = (event: any) => {
        const serialNumber = event.serialNumber || '';
        let textContent = '';
        if (event.message && event.message.records) {
          for (const record of event.message.records) {
            if (record.recordType === 'text') {
              const textDecoder = new TextDecoder(record.encoding || 'utf-8');
              textContent = textDecoder.decode(record.data);
            }
          }
        }
        const scannedCode = textContent.trim() || serialNumber || 'NFC-UNKNOWN';
        setScanStatusMessage(`ตรวจพบการ์ด NFC: ${scannedCode}`);
        setIsScanningNfc(false);
        lookupCard(scannedCode);
      };

      ndef.onreadingerror = () => {
        setScanStatusMessage('เกิดข้อผิดพลาดในการอ่าน NFC โปรดลองอีกครั้ง');
        setIsScanningNfc(false);
      };
    } catch (err: any) {
      setIsScanningNfc(false);
      setScanStatusMessage(`ไม่สามารถเปิดใช้งาน NFC ได้: ${err.message || 'โปรดเปิด NFC ในการตั้งค่า'}`);
    }
  };

  const lookupCard = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    setNfcInput(cleanCode);

    const match = StorageService.findNfcItem(cleanCode, activeRoom.mediaKitCode);
    if (match) {
      setFoundItem(match);
      setNotFoundCode('');
      setSelectedOptionIndex(null);
      setAnsweredQuestion(false);
    } else {
      setFoundItem(null);
      setNotFoundCode(cleanCode);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    lookupCard(nfcInput);
  };

  // Quick helper to preview registered cards for this room's Media Kit
  const existingRoleMissions = StorageService.getRoleMissions(activeRoom.mediaKitCode);
  const existingCoopMissions = StorageService.getCooperationMissions(activeRoom.mediaKitCode);
  const existingTileQuestions = StorageService.getTileQuestions(activeRoom.mediaKitCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#112240] border border-[#233554] rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233554]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-500/40 text-blue-300">
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                ระบบอ่านการ์ด NFC & ภารกิจสุจริต
              </h3>
              <p className="text-xs text-slate-300 font-light">
                แตะบัตร NFC หรือกรอกรหัสการ์ดภารกิจ และคำถามประจำช่อง
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E3A8A]/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Player for Mission */}
        <div className="mt-4 p-3 bg-[#0A192F] rounded-xl border border-[#233554] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ผู้เล่นที่ดำเนินการ:</span>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="px-2.5 py-1.5 bg-[#112240] border border-[#233554] rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
            >
              {activeRoom.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({ROLES[p.role].name} - ขั้น {p.missionStep}/3)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input / Scanner Section */}
        <div className="mt-5 space-y-4">
          
          {/* Real NFC Scan Button (if supported) */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleStartWebNfcScan}
              disabled={isScanningNfc}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition-all ${
                isScanningNfc
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200 animate-pulse'
                  : 'bg-[#1E3A8A] hover:bg-blue-600 border-blue-500/40 text-white shadow-sm'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              {isScanningNfc ? 'กำลังรอแตะการ์ด NFC...' : 'แตะบัตร NFC (Web NFC API)'}
            </button>

            <span className="text-xs text-slate-400 hidden sm:inline">หรือ</span>

            {/* Manual Code Form */}
            <form onSubmit={handleManualSearch} className="flex-1 flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={nfcInput}
                  onChange={(e) => setNfcInput(e.target.value)}
                  placeholder="กรอกรหัสการ์ด เช่น NFC-GOV-01, NEWS-01"
                  className="w-full px-3.5 py-2 bg-[#0A192F] border border-[#233554] rounded-xl text-xs sm:text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-600 text-white rounded-xl text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                ค้นหา
              </button>
            </form>
          </div>

          {scanStatusMessage && (
            <div className="text-xs p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300">
              {scanStatusMessage}
            </div>
          )}

        </div>

        {/* Not Found State */}
        {notFoundCode && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-amber-600/40 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <AlertCircle className="w-4 h-4" />
              ไม่พบการ์ดรหัส "{notFoundCode}" ในฐานข้อมูล
            </div>
            <p className="text-slate-400 leading-relaxed">
              ยังไม่มีการผูกรหัสการ์ดนี้ในระบบหลังบ้าน (สามารถเพิ่มข้อมูลภารกิจหรือการ์ดข่าวสารผูกกับรหัส "{notFoundCode}" ได้ที่หน้า <b>ระบบแอดมิน (ครู)</b>)
            </p>
          </div>
        )}

        {/* Found Card Content Display */}
        {foundItem && (
          <div className="mt-6 p-5 bg-[#0A192F] border border-[#233554] rounded-2xl space-y-4 animate-fade-in">
            
            {/* 1) ROLE MISSION */}
            {foundItem.type === 'role_mission' && (() => {
              const mission = foundItem.item as RoleMission;
              const roleInfo = ROLES[mission.role];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      ภารกิจตัวละคร: {roleInfo.name} (ขั้นที่ {mission.step}/3)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      NFC: {mission.nfcCode}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{mission.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {mission.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#112240] border border-[#233554] flex items-center justify-around text-xs">
                    <div>
                      <span className="text-slate-400">ผลต่อดัชนีเมือง: </span>
                      <span className="font-bold text-emerald-400">+{mission.cityImpact} แต้ม</span>
                    </div>
                    <div>
                      <span className="text-slate-400">แต้มส่วนตัว: </span>
                      <span className="font-bold text-blue-300">+{mission.personalReward} แต้ม</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyRoleMission(mission, selectedPlayerId);
                      onClose();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium text-xs sm:text-sm shadow-md transition-colors"
                  >
                    ยืนยันสำเร็จภารกิจขั้นที่ {mission.step} (บันทึกแต้ม & ก้าวหน้า)
                  </button>
                </div>
              );
            })()}

            {/* 2) COOPERATION MISSION */}
            {foundItem.type === 'cooperation' && (() => {
              const coop = foundItem.item as CooperationMission;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      ภารกิจร่วมมือกับพลเมืองอื่น
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      NFC: {coop.nfcCode}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{coop.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {coop.description}
                    </p>
                  </div>

                  {/* Partner selection */}
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                      เลือกตัวละครพลเมืองที่ร่วมมือด้วย:
                    </label>
                    <select
                      value={partnerPlayerId}
                      onChange={(e) => setPartnerPlayerId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#112240] border border-[#233554] rounded-xl text-xs text-white"
                    >
                      {activeRoom.players
                        .filter((p) => p.id !== selectedPlayerId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.fullName} ({ROLES[p.role].name})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-[#112240] border border-[#233554] flex items-center justify-around text-xs">
                    <div>
                      <span className="text-slate-400">แต้มความร่วมมือ: </span>
                      <span className="font-bold text-emerald-400">+{coop.coopPoints} แต้ม (ทั้ง 2 คน)</span>
                    </div>
                    <div>
                      <span className="text-slate-400">ดัชนีเมือง: </span>
                      <span className="font-bold text-blue-300">+{coop.cityImpact} แต้ม</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onApplyCooperation(coop, selectedPlayerId, partnerPlayerId);
                      onClose();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium text-xs sm:text-sm shadow-md transition-colors border border-emerald-600/40"
                  >
                    ยืนยันความร่วมมือสำเร็จ (+แต้มความร่วมมือ)
                  </button>
                </div>
              );
            })()}

            {/* 3) TILE QUESTION */}
            {foundItem.type === 'tile_question' && (() => {
              const tile = foundItem.item as TileQuestion;
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {tile.categoryTitle || 'คำถามประจำช่อง'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      NFC: {tile.nfcCode}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-white leading-relaxed">
                    {tile.question}
                  </div>

                  {/* Options */}
                  {tile.options && tile.options.length > 0 ? (
                    <div className="space-y-2">
                      {tile.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!answeredQuestion) setSelectedOptionIndex(idx);
                          }}
                          className={`w-full p-3 rounded-xl border text-xs text-left transition-all ${
                            selectedOptionIndex === idx
                              ? 'bg-[#1E3A8A] border-blue-400 text-white font-semibold'
                              : 'bg-[#112240] border-[#233554] text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-mono mr-2">{idx + 1}.</span> {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#112240] rounded-xl text-xs text-slate-400">
                      (คำถามอัตนัย/อภิปรายในวง ผู้เล่นตอบด้วยวาจา และเพื่อนร่วมวงร่วมลงมติ)
                    </div>
                  )}

                  {/* Answer evaluation buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const isCorrect = tile.options && tile.options.length > 0
                          ? selectedOptionIndex === tile.correctOptionIndex
                          : true;
                        onApplyTileQuestion(tile, selectedPlayerId, isCorrect);
                        onClose();
                      }}
                      className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs sm:text-sm shadow-md transition-colors"
                    >
                      ยืนยันคำตอบที่ถูกต้อง (+แต้มเมืองและส่วนตัว)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyTileQuestion(tile, selectedPlayerId, false);
                        onClose();
                      }}
                      className="px-4 py-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 rounded-xl font-medium text-xs transition-colors"
                    >
                      ตอบไม่ถูกต้อง
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

      </div>
    </div>
  );
};
