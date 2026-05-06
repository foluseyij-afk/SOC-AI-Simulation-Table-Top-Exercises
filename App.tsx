
import React, { useState, useEffect, useCallback } from 'react';
import { startSimulation, getNextStep, generateFinalAssessment } from './services/geminiService';
// Fixed: Imported UserResponse from types
import { Difficulty, ThreatType, SimulationState, SimulationStep, TrainingResult, UserResponse } from './types';
import ScenarioCard from './components/ScenarioCard';
import QuestionArea from './components/QuestionArea';
import FinalFeedback from './components/FinalFeedback';

const THREAT_TYPES: ThreatType[] = [
  'Malware Outbreak', 
  'Cloud Security Breach', 
  'Endpoint Compromise', 
  'Account Takeover', 
  'Insider Threat', 
  'DDoS / Network Attack'
];

const DIFFICULTIES: Difficulty[] = ['Entry-Level', 'Mid-Level', 'Senior-Level'];

const App: React.FC = () => {
  const [appState, setAppState] = useState<'SETUP' | 'SIMULATING' | 'RESULT'>('SETUP');
  const [difficulty, setDifficulty] = useState<Difficulty>('Entry-Level');
  const [threatType, setThreatType] = useState<ThreatType>('Malware Outbreak');
  
  const [currentStep, setCurrentStep] = useState<SimulationStep | null>(null);
  const [simState, setSimState] = useState<SimulationState>({
    currentStep: 0,
    maxSteps: 5,
    history: [],
    overallContext: '',
    threatLevel: 20
  });

  const [isLoading, setIsLoading] = useState(false);
  const [finalResult, setFinalResult] = useState<TrainingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startNewSim = async () => {
    setIsLoading(true);
    setError(null);
    setAppState('SIMULATING');
    try {
      const firstStep = await startSimulation(difficulty, threatType);
      setCurrentStep(firstStep);
      setSimState({
        currentStep: 1,
        maxSteps: 5,
        history: [],
        overallContext: firstStep.context,
        threatLevel: 20
      });
    } catch (err) {
      setError("Failed to initialize the cyber range. The adversary may have blocked our connection.");
      setAppState('SETUP');
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed: Correctly typed response parameter
  const handleAnswer = async (response: UserResponse) => {
    const selectedOption = currentStep!.options[response.selectedOptionIndex];
    
    const newHistory = [...simState.history, {
      question: currentStep!.question,
      choice: selectedOption.text,
      points: selectedOption.points,
      consequence: selectedOption.consequence
    }];

    const newThreatLevel = Math.min(100, Math.max(0, simState.threatLevel + (10 - selectedOption.points) * 2));
    
    const nextState = {
      ...simState,
      currentStep: simState.currentStep + 1,
      history: newHistory,
      threatLevel: newThreatLevel
    };

    setSimState(nextState);

    if (currentStep?.isFinal || nextState.currentStep > simState.maxSteps) {
      setIsLoading(true);
      try {
        const assessment = await generateFinalAssessment(difficulty, threatType, nextState);
        const totalScore = newHistory.reduce((sum, h) => sum + h.points, 0);
        setFinalResult({
          totalScore,
          maxPossibleScore: simState.maxSteps * 10,
          ...assessment
        });
        setAppState('RESULT');
      } catch (err) {
        setError("Error processing debrief.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const step = await getNextStep(difficulty, threatType, nextState);
        setCurrentStep(step);
      } catch (err) {
        setError("Link to simulation lost. Please reset.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (appState === 'SETUP') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-blue-500 mb-2">SOC SHIELD: BRIEFING ROOM</h1>
            <p className="text-slate-400">Configure your simulation environment and threat parameters.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Experience Level</label>
              <div className="space-y-3">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      difficulty === d ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="font-bold">{d}</span>
                    <p className="text-xs opacity-70 mt-1">
                      {d === 'Entry-Level' ? 'Foundational incidents, clear artifacts.' : d === 'Mid-Level' ? 'Coordinated attacks, requires pivot analysis.' : 'Advanced Persistent Threats (APT), stealthy indicators.'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Threat Vector</label>
              <div className="grid grid-cols-1 gap-2">
                {THREAT_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setThreatType(t)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      threatType === t ? 'bg-slate-100 text-slate-900 border-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startNewSim}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] uppercase tracking-widest flex items-center justify-center gap-3"
          >
            Initiate Simulation
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 mono">ADJUSTING REALITY...</h2>
        <p className="text-slate-400 max-w-md text-center italic">
          "Simulating consequences and projecting next-stage threat vectors based on your actions."
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight">SOC SHIELD</h1>
              <p className="text-[10px] text-blue-400 mono font-bold uppercase tracking-[0.2em]">{difficulty} // {threatType}</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:block">
              <p className="text-[10px] text-slate-500 uppercase mono mb-1 text-right">System Stability</p>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className={`h-full transition-all duration-1000 ${simState.threatLevel > 70 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`}
                  style={{ width: `${100 - simState.threatLevel}%` }}
                ></div>
              </div>
            </div>
            <button 
              onClick={() => setAppState('SETUP')}
              className="text-[10px] font-bold bg-red-900/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded uppercase hover:bg-red-900/40 transition-colors"
            >
              Abort Sim
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-200 flex items-center gap-4 animate-shake">
              <span className="text-2xl">⚠️</span>
              <p className="text-sm font-bold uppercase mono">{error}</p>
            </div>
          )}

          {appState === 'RESULT' && finalResult ? (
            <FinalFeedback result={finalResult} scenario={currentStep!} onRestart={() => setAppState('SETUP')} />
          ) : currentStep ? (
            <div className="animate-fadeIn">
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl mb-6">
                <div className="p-6 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                   <h2 className="text-xl font-bold text-blue-400 uppercase tracking-tighter">Current Intelligence: {currentStep.title}</h2>
                   <div className="mono text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">
                     PHASE {simState.currentStep}
                   </div>
                </div>
                <div className="p-6">
                  <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 italic text-slate-300 leading-relaxed border-l-4 border-blue-500">
                    {currentStep.context}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStep.artifacts.map((a, i) => (
                      <div key={i} className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-xs text-blue-300/80 flex gap-3">
                        <span className="opacity-30">[{i+1}]</span>
                        <span className="truncate">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed: Removed as any cast as currentStep is now correctly typed */}
              <QuestionArea 
                question={currentStep} 
                onAnswer={handleAnswer}
                currentIndex={simState.currentStep - 1}
                totalQuestions={simState.maxSteps}
              />
            </div>
          ) : null}
        </div>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex justify-between items-center opacity-40 grayscale">
          <p className="text-[10px] mono uppercase tracking-[0.3em]">Neural Range Interface v4.0.1</p>
          <div className="hidden md:flex gap-6 text-[10px] mono">
            <span>UPTIME: 99.99%</span>
            <span>SECURE_BOOT: ENABLED</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; animation-iteration-count: 2; }
      `}</style>
    </div>
  );
};

export default App;
