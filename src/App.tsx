import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { ActivityTab } from './components/ActivityTab';
import { PromotionTab } from './components/PromotionTab';
import { WalletTab } from './components/WalletTab';
import { AccountTab } from './components/AccountTab';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { CustomerCareModal } from './components/CustomerCareModal';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { WinLossModal } from './components/WinLossModal';

// Games
import { WingoGame } from './components/games/WingoGame';
import { AviatorGame } from './components/games/AviatorGame';
import { MinesGame } from './components/games/MinesGame';
import { CricketGame } from './components/games/CricketGame';
import { SlotsGame } from './components/games/SlotsGame';
import { LimboGame } from './components/games/LimboGame';

const MainAppContent: React.FC = () => {
  const { currentToast, lastGameResult, setLastGameResult } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeGame, setActiveGame] = useState<string | null>(null);

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isCustomerCareOpen, setIsCustomerCareOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleSelectGame = (gameId: string) => {
    setActiveGame(gameId);
  };

  const handleBackFromGame = () => {
    setActiveGame(null);
  };

  return (
    <div className="min-h-screen bg-[#120204] text-neutral-100 flex justify-center selection:bg-rose-600 selection:text-white">
      {/* Mobile-optimized viewport wrapper with sleek max-width for desktop centered view */}
      <div className="w-full max-w-md min-h-screen bg-gradient-to-b from-[#1c0407] via-[#240609] to-[#120204] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.9)] border-x border-[#36090e]">
        {/* Sticky Header */}
        <Header
          showBack={activeGame !== null}
          onBack={handleBackFromGame}
          title={activeGame ? activeGame.toUpperCase() : undefined}
          onOpenCustomerService={() => setIsCustomerCareOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenLogin={() => setIsLoginOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-3.5 pt-3">
          {activeGame ? (
            /* ACTIVE GAME VIEW */
            <>
              {activeGame === 'wingo' && (
                <WingoGame
                  onBack={handleBackFromGame}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                />
              )}
              {activeGame === 'aviator' && (
                <AviatorGame
                  onBack={handleBackFromGame}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                />
              )}
              {activeGame === 'mines' && (
                <MinesGame
                  onBack={handleBackFromGame}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                />
              )}
              {activeGame === 'cricket' && (
                <CricketGame
                  onBack={handleBackFromGame}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                />
              )}
              {activeGame === 'slots' && (
                <SlotsGame
                  onBack={handleBackFromGame}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                />
              )}
              {activeGame === 'limbo' && (
                <LimboGame
                  onBack={handleBackFromGame}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                />
              )}
            </>
          ) : (
            /* TAB VIEWS */
            <>
              {activeTab === 'home' && (
                <HomeTab
                  onSelectGame={handleSelectGame}
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenCustomerCare={() => setIsCustomerCareOpen(true)}
                />
              )}
              {activeTab === 'activity' && <ActivityTab />}
              {activeTab === 'promotion' && <PromotionTab />}
              {activeTab === 'wallet' && (
                <WalletTab
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenCustomerCare={() => setIsCustomerCareOpen(true)}
                />
              )}
              {activeTab === 'account' && (
                <AccountTab
                  onOpenDeposit={() => setIsDepositOpen(true)}
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenCustomerCare={() => setIsCustomerCareOpen(true)}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                  onOpenLogin={() => setIsLoginOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Floating Mascot Customer Service Robot Button matching screenshots */}
        {!activeGame && (
          <button
            onClick={() => setIsCustomerCareOpen(true)}
            className="fixed bottom-20 right-4 sm:right-[calc(50%-200px)] z-30 w-12 h-12 rounded-full bg-white shadow-2xl border-2 border-rose-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            title="Customer Service"
          >
            {/* Cute mascot face with blush cheeks */}
            <div className="relative w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              {/* Eyes */}
              <div className="w-1.5 h-1.5 rounded-full bg-rose-900 absolute left-2 top-2.5" />
              <div className="w-1.5 h-1.5 rounded-full bg-rose-900 absolute right-2 top-2.5" />
              {/* Cheeks */}
              <div className="w-2 h-1 rounded-full bg-rose-400 absolute left-1 top-4" />
              <div className="w-2 h-1 rounded-full bg-rose-400 absolute right-1 top-4" />
              {/* Smile */}
              <div className="w-2.5 h-1 border-b-2 border-rose-900 rounded-full absolute top-4" />
            </div>
          </button>
        )}

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            setActiveGame(null); // Exit active game when user taps a bottom tab
          }}
        />

        {/* Global Toast Notification */}
        {currentToast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4">
            <div
              className={`px-3 py-1.5 rounded-lg ${
                currentToast.type === 'success'
                  ? 'bg-emerald-950/95 border border-emerald-500 text-emerald-200'
                  : currentToast.type === 'error'
                  ? 'bg-rose-950/95 border border-rose-500 text-rose-200'
                  : 'bg-[#3b0f16]/95 border border-amber-500/60 text-amber-200'
              }`}
            >
              {currentToast.message}
            </div>
          </div>
        )}

        {/* Modals */}
        <DepositModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          onOpenCustomerCare={() => {
            setIsDepositOpen(false);
            setIsCustomerCareOpen(true);
          }}
        />

        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          onOpenCustomerCare={() => {
            setIsWithdrawOpen(false);
            setIsCustomerCareOpen(true);
          }}
        />

        <CustomerCareModal
          isOpen={isCustomerCareOpen}
          onClose={() => setIsCustomerCareOpen(false)}
        />

        <AdminPanel
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onOpenCustomerService={() => {
            setIsLoginOpen(false);
            setIsCustomerCareOpen(true);
          }}
        />

        <WinLossModal
          data={lastGameResult}
          onClose={() => setLastGameResult(null)}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
