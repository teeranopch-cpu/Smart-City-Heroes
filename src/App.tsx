/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { PlayerLobby } from './components/PlayerLobby';
import { GameBoard } from './components/GameBoard';
import { PrePostTest } from './components/PrePostTest';
import { BehaviorPhotosMission } from './components/BehaviorPhotosMission';
import { CertificateView } from './components/CertificateView';
import { AdminDashboard } from './components/AdminDashboard';
import { GameSummaryModal } from './components/GameSummaryModal';
import { StorageService } from './storage';
import { UserAccount, GameRoom } from './types';
import { 
  Building2, 
  LogOut, 
  CheckCircle2, 
  FileText, 
  Users, 
  Gamepad2, 
  Award, 
  ArrowLeft,
  ShieldCheck,
  Camera,
  Lock
} from 'lucide-react';

export type UserStep = 'lobby' | 'pretest' | 'game' | 'posttest' | 'behavior_photos' | 'certificate';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<UserStep>('lobby');
  const [activeRoom, setActiveRoom] = useState<GameRoom | null>(null);
  const [summaryRoom, setSummaryRoom] = useState<GameRoom | null>(null);

  // Load persistent user and room sessions on start
  useEffect(() => {
    const user = StorageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const admin = StorageService.isAdminLoggedIn();
    setIsAdmin(admin);

    const savedRoom = StorageService.getActiveGameRoom();
    if (savedRoom && !savedRoom.isGameOver) {
      setActiveRoom(savedRoom);
    }
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveStep('lobby');
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveRoom(null);
    setActiveStep('lobby');
  };

  const handleAdminLogout = () => {
    StorageService.setAdminLoggedIn(false);
    setIsAdmin(false);
  };

  // When room is created or joined -> starts with Pre-test
  const handleStartRoomGame = (room: GameRoom) => {
    setActiveRoom(room);
    StorageService.saveActiveGameRoom(room);
    setActiveStep('pretest');
    const refreshedUser = StorageService.getCurrentUser();
    if (refreshedUser) setCurrentUser(refreshedUser);
  };

  const handleResumeGame = (room: GameRoom) => {
    setActiveRoom(room);
    StorageService.saveActiveGameRoom(room);
    setActiveStep('game');
  };

  const handleViewCertificate = (room: GameRoom) => {
    setActiveRoom(room);
    setActiveStep('certificate');
  };

  const handleUpdateRoom = (room: GameRoom) => {
    setActiveRoom(room);
    StorageService.saveActiveGameRoom(room);
  };

  const handleEndGame = (finalRoom: GameRoom) => {
    setSummaryRoom(finalRoom);
    StorageService.archiveGameRoom(finalRoom);
  };

  const handleTestCompleted = (type: 'pre' | 'post', updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    if (type === 'pre') {
      setActiveStep('game');
    } else {
      // Post-test completed -> goes to 5 Behavior Photos Mission
      setActiveStep('behavior_photos');
    }
  };

  const handlePhotosCompleted = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setActiveStep('certificate');
  };

  // 1) NOT LOGGED IN: SHOW ONLY LOGIN PAGE
  if (!currentUser && !isAdmin) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onAdminLoginSuccess={handleAdminLoginSuccess}
      />
    );
  }

  // 2) ADMIN LOGGED IN: SHOW ADMIN DASHBOARD
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A192F] text-white flex flex-col font-['Prompt',sans-serif]">
        <header className="sticky top-0 z-40 bg-[#0A192F]/95 backdrop-blur-md border-b border-[#233554] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-600/40 flex items-center justify-center text-amber-300">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="font-bold text-sm sm:text-base text-white">
                    ระบบจัดการครู / แอดมิน (Admin Portal)
                  </h1>
                  <p className="text-[11px] text-amber-300/80">
                    Smart Integrity City • บอร์ดเกมคุณลักษณะ 5 ประการ
                  </p>
                </div>
              </div>

              <button
                onClick={handleAdminLogout}
                className="px-3.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/50 text-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบแอดมิน</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-12">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  // 3) LOGGED IN USER: STEP-BY-STEP PROGRESS FLOW
  // Order: 1.Pre-test -> 2.Game -> 3.Post-test -> 4.Behavior Photos -> 5.Certificate
  const has5Photos = Boolean(
    currentUser?.behaviorImages && 
    currentUser.behaviorImages.length === 5 && 
    currentUser.behaviorImages.filter(Boolean).length === 5
  );

  const gameStepsConfig: Array<{ key: UserStep; label: string; icon: React.ReactNode }> = [
    { key: 'pretest', label: '1. ข้อสอบก่อนเรียน (Pre-test)', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'game', label: '2. กระดานบอร์ดเกม', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { key: 'posttest', label: '3. ข้อสอบหลังเรียน (Post-test)', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'behavior_photos', label: '4. ถ่ายภาพภารกิจ 5 พฤติกรรม', icon: <Camera className="w-3.5 h-3.5" /> },
    { key: 'certificate', label: '5. เกียรติบัตร', icon: <Award className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] text-white flex flex-col font-['Prompt',sans-serif]">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0A192F]/95 backdrop-blur-md border-b border-[#233554] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#112240] border border-blue-500/40 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                  SMART INTEGRITY CITY
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-light">
                  โรงเรียนสุจริต
                </span>
              </div>
            </div>

            {/* Middle: Back to Lobby Button when in a Game Session */}
            {activeStep !== 'lobby' && (
              <button
                onClick={() => setActiveStep('lobby')}
                className="px-3.5 py-1.5 bg-[#112240] hover:bg-[#1E3A8A] border border-[#233554] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่ห้องรับรอง (Lobby)</span>
              </button>
            )}

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="text-right text-xs">
                <div className="font-semibold text-white">
                  {currentUser?.prefix} {currentUser?.fullName}
                </div>
                <div className="text-[10px] text-blue-300">
                  {currentUser?.status}
                  {activeRoom?.roomCode ? ` • ห้อง: ${activeRoom.roomCode}` : ''}
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="ออกจากระบบเพื่อเปลี่ยนผู้ใช้"
                className="p-2 rounded-lg bg-[#112240] hover:bg-[#1E3A8A] border border-[#233554] text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Step-by-Step Flow Breadcrumbs (Only when in active game session) */}
        {activeStep !== 'lobby' && (
          <div className="bg-[#112240]/80 border-t border-[#233554] px-4 py-2 overflow-x-auto">
            <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1 sm:gap-2 text-xs">
              {gameStepsConfig.map((s) => {
                const isCurrent = activeStep === s.key;
                const isPast = 
                  (s.key === 'pretest' && currentUser?.preTestCompleted) ||
                  (s.key === 'posttest' && currentUser?.postTestCompleted) ||
                  (s.key === 'behavior_photos' && has5Photos) ||
                  (s.key === 'certificate' && currentUser?.certificateIssued);

                return (
                  <button
                    key={s.key}
                    onClick={() => setActiveStep(s.key)}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : isPast
                        ? 'text-emerald-400 hover:bg-[#0A192F]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : s.icon}
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        
        {/* 1) PLAYER LOBBY (Landing screen: สร้างห้อง, ห้องที่เคยเล่น, ค้นหาห้อง) */}
        {activeStep === 'lobby' && (
          <PlayerLobby
            currentUser={currentUser!}
            onStartRoomGame={handleStartRoomGame}
            onResumeGame={handleResumeGame}
            onViewCertificate={handleViewCertificate}
          />
        )}

        {/* 2) PRE-TEST (Occurs at start of game - 5 Attribute Questions) */}
        {activeStep === 'pretest' && (
          <div>
            <PrePostTest
              currentUser={currentUser}
              activeRoom={activeRoom}
              initialTab="pre"
              onTestCompleted={handleTestCompleted}
              onGoToNextStep={() => setActiveStep('game')}
              onBackToLobby={() => setActiveStep('lobby')}
            />
          </div>
        )}

        {/* 3) GAME BOARD */}
        {activeStep === 'game' && (
          <div>
            {activeRoom ? (
              <GameBoard
                room={activeRoom}
                onUpdateRoom={handleUpdateRoom}
                onEndGame={handleEndGame}
              />
            ) : (
              <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#112240] border border-[#233554] flex items-center justify-center mx-auto text-3xl">
                  🎲
                </div>
                <h2 className="text-xl font-bold text-white">ยังไม่มีห้องบอร์ดเกมที่กำลังเล่น</h2>
                <p className="text-xs text-slate-400">
                  กรุณาสร้างห้องใหม่หรือค้นหาห้องที่มีอยู่ในระบบจากห้องรับรอง
                </p>
                <button
                  onClick={() => setActiveStep('lobby')}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
                >
                  กลับสู่ห้องรับรอง (Lobby)
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4) POST-TEST (Separate step, occurs before behavior photos!) */}
        {activeStep === 'posttest' && (
          <div>
            <PrePostTest
              currentUser={currentUser}
              activeRoom={activeRoom}
              initialTab="post"
              onTestCompleted={handleTestCompleted}
              onGoToNextStep={() => setActiveStep('behavior_photos')}
              onBackToLobby={() => setActiveStep('lobby')}
            />
          </div>
        )}

        {/* 5) 5 BEHAVIOR PHOTOS MISSION (Must be completed before certificate) */}
        {activeStep === 'behavior_photos' && (
          <div>
            <BehaviorPhotosMission
              currentUser={currentUser}
              activeRoom={activeRoom}
              onPhotosCompleted={handlePhotosCompleted}
              onBackToPostTest={() => setActiveStep('posttest')}
            />
          </div>
        )}

        {/* 6) CERTIFICATE (Granted ONLY when 5 behavior photos are completed) */}
        {activeStep === 'certificate' && (
          <div>
            <CertificateView
              currentUser={currentUser}
              activeRoom={activeRoom}
              onGoToPostTest={() => setActiveStep('posttest')}
              onGoToBehaviorPhotos={() => setActiveStep('behavior_photos')}
              onBackToLobby={() => setActiveStep('lobby')}
            />
          </div>
        )}

      </main>

      {/* Global Game Summary Modal */}
      {summaryRoom && (
        <GameSummaryModal
          room={summaryRoom}
          onClose={() => setSummaryRoom(null)}
          onGoToPostTest={() => {
            setSummaryRoom(null);
            setActiveStep('posttest');
          }}
          onRestartNewRoom={() => {
            setSummaryRoom(null);
            setActiveRoom(null);
            setActiveStep('lobby');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#0A192F] border-t border-[#233554] py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>Smart Integrity City — บอร์ดเกมการศึกษาคุณลักษณะ 5 ประการ โรงเรียนสุจริต</div>
          <div>ฐานข้อมูล LocalStorage • เทคโนโลยี NFC</div>
        </div>
      </footer>

    </div>
  );
}
