
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface CardDisplayProps {
  card: Flashcard;
  onNext: () => void;
  onPrev: () => void;
  onToggleDone: () => void;
  currentIndex: number;
  totalCards: number;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ card, onNext, onPrev, onToggleDone, currentIndex, totalCards }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-4">
      <div className="mb-6 flex justify-between w-full items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Card {currentIndex + 1}</span>
          <span className="text-xs text-slate-400">of {totalCards}</span>
        </div>
        <div className="h-2 flex-1 mx-6 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
          />
        </div>
        {card.isDone && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
            <i className="fa-solid fa-check"></i>
            MASTERED
          </span>
        )}
      </div>

      <div 
        className="relative w-full aspect-[16/10] perspective-1000 cursor-pointer group animate-in fade-in zoom-in-95 duration-300"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front Side */}
          <div className={`absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border flex flex-col items-center justify-center p-12 text-center group-hover:shadow-2xl transition-all ${card.isDone ? 'border-green-100' : 'border-slate-100'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 break-words w-full">
              {card.term}
            </h2>
            <div className="absolute bottom-8 text-xs text-slate-400 font-bold tracking-widest uppercase">
              Click to reveal answer
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 backface-hidden bg-indigo-50 rotate-y-180 rounded-3xl shadow-xl border border-indigo-100 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-full">
              <p className="text-2xl md:text-3xl text-indigo-900 font-medium mb-6 leading-relaxed">
                {card.definition}
              </p>
              {card.context && (
                <div className="mt-4 pt-4 border-t border-indigo-100">
                  <p className="text-sm text-indigo-600 italic">
                    "{card.context}"
                  </p>
                </div>
              )}
            </div>
            <div className="absolute bottom-8 text-xs text-indigo-400 font-bold tracking-widest uppercase">
              Term: {card.term}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-6 w-full">
        <div className="flex items-center justify-center gap-6 w-full">
          <button 
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            disabled={currentIndex === 0}
            className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-chevron-left text-xl"></i>
          </button>
          
          <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-10 py-3.5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 transform hover:scale-105 active:scale-95 min-w-[160px]"
          >
            {isFlipped ? 'Show Front' : 'Show Answer'}
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={currentIndex === totalCards - 1}
            className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <i className="fa-solid fa-chevron-right text-xl"></i>
          </button>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onToggleDone(); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border-2 ${
            card.isDone 
            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
            : 'bg-white border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50'
          }`}
        >
          <i className={`fa-solid ${card.isDone ? 'fa-check-circle' : 'fa-circle-check'}`}></i>
          {card.isDone ? 'Marked as Done' : 'Mark as Done'}
        </button>
      </div>
    </div>
  );
};

export default CardDisplay;
