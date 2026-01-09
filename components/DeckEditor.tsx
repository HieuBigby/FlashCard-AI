
import React, { useState } from 'react';
import { Deck, Flashcard } from '../types';

interface DeckEditorProps {
  deck: Deck;
  onBack: () => void;
  onUpdateCard: (cardId: string, updatedCard: Partial<Flashcard>) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: (newCard: Flashcard) => void;
  onStartReview: () => void;
}

const DeckEditor: React.FC<DeckEditorProps> = ({ deck, onBack, onUpdateCard, onDeleteCard, onAddCard, onStartReview }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [form, setForm] = useState({ term: '', definition: '', context: '' });

  const openAddModal = () => {
    setModalMode('add');
    setCurrentCardId(null);
    setForm({ term: '', definition: '', context: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (card: Flashcard) => {
    setModalMode('edit');
    setCurrentCardId(card.id);
    setForm({ 
      term: card.term, 
      definition: card.definition, 
      context: card.context || '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    if (!form.term.trim() || !form.definition.trim()) return;

    if (modalMode === 'add') {
      const newCard: Flashcard = {
        id: Date.now().toString(),
        term: form.term.trim(),
        definition: form.definition.trim(),
        context: form.context.trim() || undefined,
        isDone: false
      };
      onAddCard(newCard);
    } else if (modalMode === 'edit' && currentCardId) {
      onUpdateCard(currentCardId, {
        term: form.term.trim(),
        definition: form.definition.trim(),
        context: form.context.trim() || undefined
      });
    }
    closeModal();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <h1 className="text-2xl font-bold text-slate-800 truncate">Manage: {deck.title}</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all text-sm"
          >
            <i className="fa-solid fa-plus"></i>
            Add Card
          </button>
          <button 
            onClick={onStartReview}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm shadow-md shadow-indigo-100"
          >
            <i className="fa-solid fa-play"></i>
            Start Study
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{deck.cards.length} Cards in this deck</h2>
        </div>

        <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {deck.cards.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p>This deck is empty. Add some cards to get started!</p>
            </div>
          ) : (
            deck.cards.map((card) => (
              <div key={card.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-slate-800">{card.term}</h3>
                      {card.isDone && (
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Mastered</span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-2 leading-relaxed">{card.definition}</p>
                    {card.context && (
                      <p className="text-sm text-slate-400 italic">"{card.context}"</p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(card)}
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Edit Card"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={() => onDeleteCard(card.id)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Card"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
         <button 
          onClick={openAddModal}
          className="px-8 py-4 border-2 border-dashed border-slate-300 text-slate-500 rounded-3xl font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all w-full max-w-sm"
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Add New Flashcard
        </button>
      </div>

      {/* Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  {modalMode === 'add' ? 'Add New Card' : 'Edit Flashcard'}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Term</label>
                  <input 
                    type="text"
                    value={form.term}
                    onChange={(e) => setForm({ ...form, term: e.target.value })}
                    autoFocus
                    placeholder="e.g. こんにちは"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Definition</label>
                  <input 
                    type="text"
                    value={form.definition}
                    onChange={(e) => setForm({ ...form, definition: e.target.value })}
                    placeholder="e.g. Hello / Good day"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Context / Example (Optional)</label>
                  <textarea 
                    value={form.context}
                    onChange={(e) => setForm({ ...form, context: e.target.value })}
                    placeholder="Add an example sentence or hint..."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium h-24 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={closeModal}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all transform active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!form.term.trim() || !form.definition.trim()}
                  className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 transform active:scale-95"
                >
                  {modalMode === 'add' ? 'Create Card' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckEditor;
