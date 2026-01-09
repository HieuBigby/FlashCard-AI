
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface CardDisplayProps {
  card: Flashcard;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalCards: number;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onNext, onPrev, currentIndex, totalCards }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // We rely on the parent (App.tsx) providing a 'key' to this component
  // which forces a full remount and resets the isFlipped state to false.

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-8">
      <div className="mb-6 flex justify-between w-full items-center px-4">
        <span className="text-sm font-medium text-slate-500">Card {currentIndex + 1} of {totalCards}</span>
        <div className="h-1.5 flex-1 mx-4 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
      </div>

      <div 
        className="relative w-full aspect-[16/10] perspective-1000 cursor-pointer group animate-in fade-in zoom-in-95 duration-300"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center p-12 text-center group-hover:shadow-2xl transition-shadow">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 break-words w-full">
              {card.term}
            </h2>
            <div className="absolute bottom-8 text-sm text-slate-400 font-medium tracking-wide">
              CLICK TO FLIP
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden bg-indigo-50 rotate-y-180 rounded-3xl shadow-xl border border-indigo-100 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-full">
              <p className="text-2xl md:text-3xl text-indigo-900 font-medium mb-6 leading-relaxed">
                {card.definition}
              </p>
              {card.context && (
                <div className="mt-4 pt-4 border-t border-indigo-200">
                  <p className="text-sm text-indigo-600 italic">
                    "{card.context}"
                  </p>
                </div>
              )}
            </div>
            <div className="absolute bottom-8 text-sm text-indigo-400 font-medium tracking-wide">
              TERM: {card.term}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-6">
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          disabled={currentIndex === 0}
          className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <i className="fa-solid fa-chevron-left text-xl"></i>
        </button>
        
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          {isFlipped ? 'Show Front' : 'Show Answer'}
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          disabled={currentIndex === totalCards - 1}
          className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <i className="fa-solid fa-chevron-right text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default CardDisplay;
