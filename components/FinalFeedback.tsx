
import React from 'react';
import { TrainingResult } from '../types';

interface FinalFeedbackProps {
  result: TrainingResult;
  onRestart: () => void;
  scenario: any;
}

const FinalFeedback: React.FC<FinalFeedbackProps> = ({ result, onRestart, scenario }) => {
  const percentage = Math.round((result.totalScore / result.maxPossibleScore) * 100);
  
  const getGradeColor = () => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 75) return 'text-blue-400';
    if (percentage >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSubHeading = () => {
    if (percentage >= 90) return "Mission Success: Critical Systems Secured";
    if (percentage >= 70) return "Operational Success: Incident Contained";
    return "Mission Compromised: Review Protocols";
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-10 bg-slate-900 text-center border-b border-slate-700">
          <div className="inline-block p-4 rounded-full bg-slate-800 border-2 border-slate-700 mb-6 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <svg className={`w-16 h-16 ${getGradeColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-slate-100 mb-2 uppercase tracking-tighter">Mission Assessment</h2>
          <p className="text-slate-500 mono text-sm uppercase tracking-widest">{getSubHeading()}</p>
          
          <div className="mt-10 flex flex-col items-center">
            <div className="relative">
              <span className={`text-8xl font-black mono leading-none ${getGradeColor()}`}>{percentage}%</span>
              <span className="absolute -right-8 bottom-2 text-2xl font-bold text-slate-600">/100</span>
            </div>
            <span className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-[0.4em]">Final Readiness Rating</span>
          </div>
        </div>

        <div className="p-8 space-y-10">
          <section>
            <h3 className="text-xs font-black uppercase text-blue-500 tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Narrative Path Analysis
            </h3>
            <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-6 rounded-xl border border-slate-700/50 italic text-lg border-l-4 border-slate-600">
              {result.narrativeSummary}
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-xl">
              <h4 className="text-[10px] font-black uppercase text-green-500 tracking-widest mb-4">Demonstrated Competencies</h4>
              <ul className="space-y-3">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-slate-200 text-sm flex gap-3">
                    <span className="text-green-500 font-bold shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-xl">
              <h4 className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-4">Tactical Deficiencies</h4>
              <ul className="space-y-3">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="text-slate-200 text-sm flex gap-3">
                    <span className="text-red-400 font-bold shrink-0">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="bg-slate-900 p-6 rounded-xl border border-slate-700">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Command Summary</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {result.overallFeedback}
            </p>
          </section>
        </div>

        <div className="px-8 pb-10">
          <button
            onClick={onRestart}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-5 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
          >
            Acknowledge & Reassign
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalFeedback;
