import React, { useState, useEffect } from 'react';
import { ModuleType, DeviceType } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnnualPromptGenerator from './components/AnnualPromptGenerator';
import UnitPromptGenerator from './components/UnitPromptGenerator';
import SessionPromptGenerator from './components/SessionPromptGenerator';
import InclusiveSessionGenerator from './components/InclusiveSessionGenerator';
import EvaluationInstrumentGenerator from './components/EvaluationInstrumentGenerator';
import ExamsPromptGenerator from './components/ExamsPromptGenerator';
import MaterialsPromptGenerator from './components/MaterialsPromptGenerator';
import AIPages from './components/AIPages';
import MathExercisesGenerator from './components/MathExercisesGenerator';
import ScienceTechnologyGenerator from './components/ScienceTechnologyGenerator';
import GamesGenerator from './components/GamesGenerator';
import Chatbot from './components/Chatbot';
import LearningExperienceGenerator from './components/LearningExperienceGenerator';
import UnitsGenerator from './components/UnitsGenerator';
import LearningActivityGenerator from './components/LearningActivityGenerator';
import InstitutionSettings from './components/InstitutionSettings';
import TextToSpeech from './components/TextToSpeech';
import Welcome from './components/Welcome';
import { LogoProvider } from './components/LogoContext';
import { supabase } from './lib/supabase';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState<ModuleType>('welcome');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check sessionStorage for the current tab session
        const isAuthenticated = sessionStorage.getItem('is_authenticated') === 'true';
        if (isAuthenticated) {
          setSession({ user: { email: 'admin' } });
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem('is_authenticated');
    setSession(null);
  };

  // Inactivity timeout logic (3 hours)
  useEffect(() => {
    if (!session) return;

    let timeoutId: any;
    const TIMEOUT_DURATION = 3 * 60 * 60 * 1000; // 3 hours

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        alert('Tu sesión ha expirado por inactividad (3 horas). Por favor, ingresa de nuevo.');
      }, TIMEOUT_DURATION);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [session]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session) return <Login onLoginSuccess={() => setSession({ user: { email: 'admin' } })} />;

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return 'max-w-[375px] border-x border-slate-200 shadow-2xl';
      case 'tablet': return 'max-w-[768px] border-x border-slate-200 shadow-2xl';
      default: return 'max-w-5xl';
    }
  };

  return (
    <LogoProvider>
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      <Sidebar 
        activeModule={currentModule} 
        onModuleChange={setCurrentModule} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          onLogout={handleLogout} 
          device={device} 
          onDeviceChange={setDevice} 
          hasKey={hasApiKey}
          onSelectKey={handleSelectKey}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f8fafc]">
          <div className={`${getDeviceWidth()} mx-auto transition-all duration-500 bg-white min-h-full rounded-xl`}>
            <div className={`${device === 'desktop' ? 'p-0' : 'p-4 md:p-6'}`}>
              <div className={currentModule === 'welcome' ? '' : 'hidden'}>
                <Welcome />
              </div>
              <div className={currentModule === 'annual-prompt' ? '' : 'hidden'}>
                <AnnualPromptGenerator />
              </div>
              <div className={currentModule === 'units-prompt' ? '' : 'hidden'}>
                <UnitPromptGenerator />
              </div>
              <div className={currentModule === 'sessions-prompt' ? '' : 'hidden'}>
                <SessionPromptGenerator />
              </div>
              <div className={currentModule === 'inclusive-session' ? '' : 'hidden'}>
                <InclusiveSessionGenerator />
              </div>
              <div className={currentModule === 'evaluation-instruments' ? '' : 'hidden'}>
                <EvaluationInstrumentGenerator />
              </div>
              <div className={currentModule === 'exams-prompt' ? '' : 'hidden'}>
                <ExamsPromptGenerator />
              </div>
              <div className={currentModule === 'materials-prompt' ? '' : 'hidden'}>
                <MaterialsPromptGenerator />
              </div>
              <div className={currentModule === 'ai-pages' ? '' : 'hidden'}>
                <AIPages />
              </div>
              <div className={currentModule === 'math-exercises' ? '' : 'hidden'}>
                <MathExercisesGenerator />
              </div>
              <div className={currentModule === 'science-technology' ? '' : 'hidden'}>
                <ScienceTechnologyGenerator />
              </div>
              <div className={currentModule === 'games-generator' ? '' : 'hidden'}>
                <GamesGenerator />
              </div>
              <div className={currentModule === 'chatbot' ? '' : 'hidden'}>
                <Chatbot />
              </div>
              <div className={currentModule === 'learning-experience' ? '' : 'hidden'}>
                <LearningExperienceGenerator />
              </div>
              <div className={currentModule === 'units' ? '' : 'hidden'}>
                <UnitsGenerator />
              </div>
              <div className={currentModule === 'learning-activity' ? '' : 'hidden'}>
                <LearningActivityGenerator />
              </div>
              <div className={currentModule === 'institution-settings' ? '' : 'hidden'}>
                <InstitutionSettings />
              </div>
              <div className={currentModule === 'text-to-speech' ? '' : 'hidden'}>
                <TextToSpeech />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </LogoProvider>
  );
};

export default App;
