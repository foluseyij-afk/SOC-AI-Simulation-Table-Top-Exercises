
import React from 'react';

interface ScenarioCardProps {
  title: string;
  context: string;
  artifacts: string[];
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ title, context, artifacts }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 bg-slate-900 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-blue-400">{title}</h2>
      </div>
      
      <div className="p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SITUATION REPORT
        </h3>
        <p className="text-slate-300 leading-relaxed mb-6 bg-slate-900 p-4 rounded-lg border border-slate-700 italic">
          "{context}"
        </p>

        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          INTEL ARTIFACTS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {artifacts.map((artifact, idx) => (
            <div key={idx} className="bg-slate-900 p-3 rounded border border-slate-700 flex items-center gap-3">
              <span className="text-blue-500 mono text-xs font-bold">#0{idx + 1}</span>
              <span className="text-slate-400 text-xs mono truncate">{artifact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
