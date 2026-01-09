
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, Flashcard, Deck } from './types';
import { parseRawTextToFlashcards } from './services/geminiService';
import CardDisplay from './components/CardDisplay';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.CREATE);
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedDecks, setSavedDecks] = useState<Deck[]>([]);
  const [error, setError] = useState<string | null>(null);

  // States for renaming feature
  const [renamingDeckId, setRenamingDeckId] = useState<string | null>(null);
  const [newTitleInput, setNewTitleInput] = useState('');

  // States for custom delete confirmation
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);

  // Load decks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('smartflash_decks');
    if (stored) {
      try {
        setSavedDecks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored decks", e);
      }
    }
  }, []);

  // Save decks to localStorage
  useEffect(() => {
    localStorage.setItem('smartflash_decks', JSON.stringify(savedDecks));
  }, [savedDecks]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShuffle = () => {
    if (!currentDeck) return;
    const shuffledCards = shuffleArray(currentDeck.cards);
    setCurrentDeck({
      ...currentDeck,
      cards: shuffledCards
    });
    setCurrentIndex(0);
  };

  const handleGenerate = async () => {
    if (!rawText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const cards = await parseRawTextToFlashcards(rawText);
      if (cards.length === 0) {
        throw new Error("No flashcards could be extracted. Please check your text format.");
      }
      
      const newDeck: Deck = {
        id: Date.now().toString(),
        title: rawText.split('\n')[0].substring(0, 30) || 'Untitled Deck',
        cards,
        createdAt: Date.now()
      };

      setSavedDecks(prev => [newDeck, ...prev]);
      setCurrentDeck(newDeck);
      setCurrentIndex(0);
      setView(AppView.REVIEW);
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating cards.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteDeck = () => {
    if (!deletingDeckId) return;
    
    setSavedDecks(prev => prev.filter(d => d.id !== deletingDeckId));
    if (currentDeck?.id === deletingDeckId) {
      setCurrentDeck(null);
      setView(AppView.DASHBOARD);
    }
    setDeletingDeckId(null);
  };

  const startRename = (deck: Deck) => {
    setRenamingDeckId(deck.id);
    setNewTitleInput(deck.title);
  };

  const saveRename = () => {
    if (!renamingDeckId || !newTitleInput.trim()) return;
    
    setSavedDecks(prev => prev.map(deck => 
      deck.id === renamingDeckId ? { ...deck, title: newTitleInput.trim() } : deck
    ));
    
    if (currentDeck?.id === renamingDeckId) {
      setCurrentDeck(prev => prev ? { ...prev, title: newTitleInput.trim() } : null);
    }
    
    setRenamingDeckId(null);
    setNewTitleInput('');
  };

  const startReview = (deck: Deck, shuffle: boolean = false) => {
    const deckToReview = { ...deck };
    if (shuffle) {
      deckToReview.cards = shuffleArray(deck.cards);
    }
    setCurrentDeck(deckToReview);
    setCurrentIndex(0);
    setView(AppView.REVIEW);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setView(AppView.DASHBOARD)}
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <i className="fa-solid fa-bolt text-white text-sm"></i>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">SmartFlash <span className="text-indigo-600">AI</span></span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setView(AppView.DASHBOARD)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === AppView.DASHBOARD ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                My Decks
              </button>
              <button 
                onClick={() => setView(AppView.CREATE)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === AppView.CREATE ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <i className="fa-solid fa-plus mr-2"></i>
                New Deck
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* CREATE VIEW */}
        {view === AppView.CREATE && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Generate Flashcards</h1>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                Paste your notes, vocabulary lists, or any text. Our AI will intelligently extract terms and definitions for you.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8">
                <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1 uppercase tracking-wider">
                  Source Text
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Example:&#10;ここ: chỗ này, đây&#10;• そこ: chỗ đó, đó&#10;• あそこ: chỗ kia, kia"
                  className="w-full h-80 p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all text-slate-800 text-lg font-medium leading-relaxed resize-none outline-none"
                />
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {error}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !rawText.trim()}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-100 transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoading ? (
                      <>
                        <i className="fa-solid fa-circle-notch animate-spin"></i>
                        Magic in progress...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                        Generate Deck
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-language"></i>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Multilingual</h3>
                <p className="text-sm text-slate-500">Perfect for Japanese, Vietnamese, English, or any language combinations.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-microchip"></i>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">AI Extraction</h3>
                <p className="text-sm text-slate-500">Handles messy formatting, bullet points, and even long descriptive notes.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-mobile-screen"></i>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Responsive</h3>
                <p className="text-sm text-slate-500">Study on your phone, tablet or desktop with seamless transitions.</p>
              </div>
            </div>
          </div>
        )}

        {/* REVIEW VIEW */}
        {view === AppView.REVIEW && currentDeck && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setView(AppView.DASHBOARD)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                <i className="fa-solid fa-arrow-left"></i>
                Back to Decks
              </button>
              <h1 className="text-2xl font-bold text-slate-800 truncate max-w-md">{currentDeck.title}</h1>
              <div className="flex gap-4">
                <button 
                  onClick={handleShuffle}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Shuffle Cards"
                >
                  <i className="fa-solid fa-shuffle"></i>
                  <span className="text-sm font-semibold">Shuffle</span>
                </button>
                <button 
                  onClick={() => {
                    setCurrentIndex(0);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Restart"
                >
                  <i className="fa-solid fa-rotate-left"></i>
                  <span className="text-sm font-semibold">Restart</span>
                </button>
              </div>
            </div>

            <CardDisplay 
              key={currentDeck.cards[currentIndex].id}
              card={currentDeck.cards[currentIndex]}
              currentIndex={currentIndex}
              totalCards={currentDeck.cards.length}
              onNext={() => setCurrentIndex(prev => Math.min(currentDeck.cards.length - 1, prev + 1))}
              onPrev={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            />

            {currentIndex === currentDeck.cards.length - 1 && (
              <div className="mt-12 text-center animate-bounce">
                <p className="text-indigo-600 font-bold text-lg">🎉 You've reached the end!</p>
                <button 
                  onClick={handleShuffle}
                  className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-bold hover:bg-indigo-100 transition-colors"
                >
                  Shuffle & Learn Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === AppView.DASHBOARD && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Your Decks</h1>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                {savedDecks.length} TOTAL
              </span>
            </div>

            {savedDecks.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-box-open text-3xl"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">No decks yet</h2>
                <p className="text-slate-500 mb-8">Start by creating your first study set.</p>
                <button 
                  onClick={() => setView(AppView.CREATE)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
                >
                  Create New Deck
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedDecks.map(deck => (
                  <div 
                    key={deck.id}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:border-indigo-100 flex flex-col"
                  >
                    <div className="p-6 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest px-2 py-1 bg-indigo-50 rounded-md">
                          {deck.cards.length} CARDS
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); startRename(deck); }}
                            className="text-slate-300 hover:text-indigo-600 transition-all p-1"
                            title="Rename Deck"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeletingDeckId(deck.id); }}
                            className="text-slate-300 hover:text-red-500 transition-all p-1"
                            title="Delete Deck"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">
                        {deck.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Created {new Date(deck.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex border-t border-slate-100">
                      <button 
                        onClick={() => startReview(deck, true)}
                        className="flex-1 py-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-bold flex items-center justify-center gap-2 text-slate-600"
                        title="Shuffle and start study"
                      >
                        <i className="fa-solid fa-shuffle text-xs"></i>
                        Shuffle
                      </button>
                      <button 
                        onClick={() => startReview(deck)}
                        className="flex-1 py-4 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors border-l border-slate-100 font-bold flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-play text-xs"></i>
                        Study
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rename Modal */}
      {renamingDeckId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Rename Deck</h3>
              <input 
                type="text"
                value={newTitleInput}
                onChange={(e) => setNewTitleInput(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium mb-8"
                placeholder="Enter new deck title..."
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setRenamingDeckId(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveRename}
                  disabled={!newTitleInput.trim()}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDeckId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-trash-can text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Deck?</h3>
              <p className="text-slate-500 mb-8">This action cannot be undone. Are you sure you want to remove this study set?</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeletingDeckId(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteDeck}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-xl font-bold text-slate-800">SmartFlash is thinking...</p>
          <p className="mt-2 text-slate-500">Creating your study deck in seconds</p>
        </div>
      )}
    </div>
  );
};

export default App;
