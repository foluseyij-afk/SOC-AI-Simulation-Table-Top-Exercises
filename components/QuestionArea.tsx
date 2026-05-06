
import React, { useState } from 'react';
// Fixed: Imported SimulationStep instead of missing ScenarioQuestion and imported UserResponse
import { SimulationStep, UserResponse } from '../types';

interface QuestionAreaProps {
  // Fixed: Used SimulationStep as the correct type for the question
  question: SimulationStep;
  onAnswer: (response: UserResponse) => void;
  currentIndex: number;
  totalQuestions: number;
}

const QuestionArea: React.FC<QuestionAreaProps> = ({ question, onAnswer, currentIndex, totalQuestions }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null || isSubmitted) return;
    setIsSubmitted(true);
  };

  const handleContinue = () => {
    if (selectedIdx !== null) {
      // Fixed: Removed questionId as SimulationStep does not have an ID property
      onAnswer({
        selectedOptionIndex: selectedIdx,
        pointsReceived: question.options[selectedIdx].points
      });
      // Reset for next question
      setSelectedIdx(null);
      setIsSubmitted(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl mt-6">
      <div className="px-6 py-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
        <h4 className="font-bold text-slate-100 uppercase tracking-widest text-sm">
          Decision Point {currentIndex + 1} of {totalQuestions}
        </h4>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-8 rounded-full ${i < currentIndex ? 'bg-blue-500' : i === currentIndex ? 'bg-blue-400' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <p className="text-xl font-medium text-slate-100 mb-6 leading-snug">
          {/* Fixed: Used question.question property instead of non-existent question.text */}
          {question.question}
        </p>

        <div className="space-y-4">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isSubmitted}
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                selectedIdx === idx 
                  ? isSubmitted 
                    ? option.points >= 8 ? 'bg-green-500/20 border-green-500 text-green-100' : 
                      option.points >= 4 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-100' : 
                      'bg-red-500/20 border-red-500 text-red-100'
                    : 'bg-blue-500/20 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full border shrink-0 mono font-bold ${
                  selectedIdx === idx ? 'bg-blue-500 text-white border-blue-400' : 'border-slate-600 bg-slate-800'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm md:text-base">{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        {isSubmitted && selectedIdx !== null && (
          <div className="mt-8 animate-fadeIn">
            <div className={`p-4 rounded-lg mb-6 ${
              question.options[selectedIdx].points >= 8 ? 'bg-green-900/30 border-l-4 border-green-500' : 
              question.options[selectedIdx].points >= 4 ? 'bg-yellow-900/30 border-l-4 border-yellow-500' : 
              'bg-red-900/30 border-l-4 border-red-500'
            }`}>
              <h5 className="font-bold mb-1 flex items-center gap-2">
                {question.options[selectedIdx].points >= 8 ? 'Excellent Choice' : 
                 question.options[selectedIdx].points >= 4 ? 'Acceptable Decision' : 'Suboptimal Response'}
                <span className="text-sm font-normal opacity-70">({question.options[selectedIdx].points}/10 pts)</span>
              </h5>
              <p className="text-sm text-slate-300 italic mb-4">
                {question.options[selectedIdx].feedback}
              </p>
              <hr className="border-slate-700 mb-4" />
              <h6 className="text-xs font-bold uppercase text-slate-500 mb-1">Debrief Explanation</h6>
              <p className="text-sm text-slate-300">
                {question.explanation}
              </p>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center gap-2 group shadow-lg"
            >
              {currentIndex + 1 === totalQuestions ? 'Finalize Incident Review' : 'Proceed to Next Phase'}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}

        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            disabled={selectedIdx === null}
            className={`mt-8 w-full font-bold py-4 rounded-lg transition-all ${
              selectedIdx !== null 
                ? 'bg-slate-100 text-slate-900 hover:bg-white shadow-lg' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Lock In Choice
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionArea;