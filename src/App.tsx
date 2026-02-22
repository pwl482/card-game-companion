/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Save, 
  Play, 
  ChevronLeft, 
  Info, 
  LayoutGrid, 
  Library, 
  Gamepad2,
  X,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Deck, AppView, Faction, CardType } from './types';
import { 
  CARDS, 
  FACTIONS, 
  DECK_SIZE_LIMIT, 
  COST_LIMIT, 
  MIN_UNIT_COUNT,
  LEADER_COUNT_REQUIRED,
  BRONZE_COPY_LIMIT, 
  GOLD_COPY_LIMIT,
  getCardById 
} from './constants';

// --- Components ---

interface CardDisplayProps {
  card: Card;
  count?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
}

const CardDisplay: React.FC<CardDisplayProps> = ({ 
  card, 
  count = 0, 
  onAdd, 
  onRemove, 
  disabled = false
}) => {
  const isGold = card.type === 'gold';
  
  return (
    <motion.div 
      layout
      className={`relative p-3 rounded-xl border-2 transition-all ${
        isGold 
          ? 'bg-amber-900/20 border-amber-500/40 shadow-amber-900/10' 
          : 'bg-wood-800/50 border-wood-700 shadow-black/20'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
          isGold ? 'bg-amber-500/20 text-amber-200' : 'bg-wood-700 text-parchment-300'
        }`}>
          {card.type}
        </span>
        <span className="font-mono text-sm font-bold text-parchment-300">
          Cost: {card.cost}
        </span>
      </div>
      
      <h3 className="font-bold text-parchment-100 leading-tight mb-1">{card.name}</h3>
      <div className="flex gap-2 text-[11px] text-parchment-300/80 mb-2">
        <span className="font-medium italic">{card.faction}</span>
        <span>•</span>
        <span>{card.tags}</span>
      </div>

      <p className="text-xs text-parchment-200 bg-black/20 p-2 rounded border border-wood-700/50 mb-2">
        {card.ability}
      </p>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <span className="text-lg font-black text-parchment-100">{card.strength}</span>
          <span className="text-[10px] text-parchment-300/50 uppercase font-bold">STR</span>
        </div>
        
        {(onAdd || onRemove) && (
          <div className="flex items-center gap-3 bg-wood-900 rounded-full px-2 py-1 shadow-inner border border-wood-700">
            {onRemove && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="p-1 text-parchment-300/60 hover:text-red-400 transition-colors"
              >
                <Minus size={16} />
              </button>
            )}
            <span className="font-mono font-bold text-parchment-100 min-w-[1ch] text-center">{count}</span>
            {onAdd && (
              <button 
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                disabled={disabled}
                className={`p-1 transition-colors ${disabled ? 'text-wood-700' : 'text-parchment-300/60 hover:text-emerald-400'}`}
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState<AppView>('builder');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [activeDeck, setActiveDeck] = useState<Partial<Deck>>({
    name: '',
    faction: 'monster',
    cardIds: []
  });
  const [otherDeckId, setOtherDeckId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyInDeck, setShowOnlyInDeck] = useState(false);
  const [trackingDeck, setTrackingDeck] = useState<{ deck: Deck, drawnIndices: Set<number> } | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Load decks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('custom_decks');
    if (saved) setDecks(JSON.parse(saved));
  }, []);

  // Save decks to localStorage
  const saveDecksToStorage = (newDecks: Deck[]) => {
    setDecks(newDecks);
    localStorage.setItem('custom_decks', JSON.stringify(newDecks));
  };

  const otherDeck = useMemo(() => 
    decks.find(d => d.id === otherDeckId), 
  [decks, otherDeckId]);

  // Shared Pool Logic: Calculate how many copies of neutral cards are used by the "other" deck
  const neutralUsageInOtherDeck = useMemo(() => {
    if (!otherDeck) return {};
    const counts: Record<string, number> = {};
    otherDeck.cardIds.forEach(id => {
      const card = getCardById(id);
      if (card?.faction === 'neutral') {
        counts[id] = (counts[id] || 0) + 1;
      }
    });
    return counts;
  }, [otherDeck]);

  const currentDeckCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeDeck.cardIds?.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, [activeDeck.cardIds]);

  const totalCost = useMemo(() => {
    return activeDeck.cardIds?.reduce((sum, id) => sum + (getCardById(id)?.cost || 0), 0) || 0;
  }, [activeDeck.cardIds]);

  const unitCount = useMemo(() => {
    return activeDeck.cardIds?.reduce((sum, id) => {
      const card = getCardById(id);
      return sum + (card?.category === 'Unit' ? 1 : 0);
    }, 0) || 0;
  }, [activeDeck.cardIds]);

  const leaderCount = useMemo(() => {
    return activeDeck.cardIds?.reduce((sum, id) => {
      const card = getCardById(id);
      return sum + (card?.category === 'Leader' ? 1 : 0);
    }, 0) || 0;
  }, [activeDeck.cardIds]);

  const filteredCards = useMemo(() => {
    return CARDS.filter(card => {
      const matchesFaction = card.faction === activeDeck.faction || card.faction === 'neutral';
      const matchesSearch = 
        card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.ability.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isInDeck = (currentDeckCounts[card.id] || 0) > 0;
      const matchesFilter = !showOnlyInDeck || isInDeck;

      return matchesFaction && matchesSearch && matchesFilter;
    }).sort((a, b) => {
      if (b.cost !== a.cost) return b.cost - a.cost;
      return a.name.localeCompare(b.name);
    });
  }, [activeDeck.faction, searchQuery, showOnlyInDeck, currentDeckCounts]);

  const handleAddCard = (card: Card) => {
    const currentCount = currentDeckCounts[card.id] || 0;
    const otherCount = neutralUsageInOtherDeck[card.id] || 0;
    const limit = card.type === 'gold' ? GOLD_COPY_LIMIT : BRONZE_COPY_LIMIT;

    // Restriction: 25 cards max
    if ((activeDeck.cardIds?.length || 0) >= DECK_SIZE_LIMIT) return;
    
    // Restriction: Copy limits (shared if neutral)
    if (card.faction === 'neutral') {
      if (currentCount + otherCount >= limit) return;
    } else {
      if (currentCount >= limit) return;
    }

    setActiveDeck(prev => ({
      ...prev,
      cardIds: [...(prev.cardIds || []), card.id]
    }));
  };

  const handleRemoveCard = (cardId: string) => {
    setActiveDeck(prev => {
      const index = prev.cardIds?.lastIndexOf(cardId);
      if (index === undefined || index === -1) return prev;
      const newIds = [...(prev.cardIds || [])];
      newIds.splice(index, 1);
      return { ...prev, cardIds: newIds };
    });
  };

  const handleSaveDeck = () => {
    if (!activeDeck.name || (activeDeck.cardIds?.length || 0) === 0) return;
    if (leaderCount !== LEADER_COUNT_REQUIRED) return;
    
    const newDeck: Deck = {
      id: activeDeck.id || Date.now().toString(),
      name: activeDeck.name,
      faction: activeDeck.faction as Faction,
      cardIds: activeDeck.cardIds || [],
      createdAt: activeDeck.createdAt || Date.now()
    };

    const updatedDecks = activeDeck.id 
      ? decks.map(d => d.id === activeDeck.id ? newDeck : d)
      : [...decks, newDeck];

    saveDecksToStorage(updatedDecks);
    setView('decks');
    setActiveDeck({ name: '', faction: 'monster', cardIds: [] });
    setOtherDeckId(null);
  };

  const handleDeleteDeck = (id: string) => {
    const updated = decks.filter(d => d.id !== id);
    saveDecksToStorage(updated);
    if (otherDeckId === id) setOtherDeckId(null);
  };

  const startTracking = (deck: Deck) => {
    const initialDrawn = new Set<number>();
    deck.cardIds.forEach((id, index) => {
      const card = getCardById(id);
      if (card?.category === 'Leader') {
        initialDrawn.add(index);
      }
    });
    setTrackingDeck({ deck, drawnIndices: initialDrawn });
    setView('tracker');
  };

  const toggleDrawn = (index: number) => {
    if (!trackingDeck) return;
    const newDrawn = new Set(trackingDeck.drawnIndices);
    if (newDrawn.has(index)) {
      newDrawn.delete(index);
    } else {
      newDrawn.add(index);
    }
    setTrackingDeck({ ...trackingDeck, drawnIndices: newDrawn });
  };

  return (
    <div className="min-h-screen bg-wood-950 text-parchment-100 font-sans pb-24">
      {/* Header */}
      <header className="bg-wood-900 border-b border-wood-800 sticky top-0 z-30 px-4 py-4 shadow-xl shadow-black/20">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black tracking-tighter text-parchment-100 flex items-center gap-2">
            <img src="${import.meta.env.BASE_URL}icon-192.png" alt="Gwent Icon" className="w-8 h-8 object-contain" />
            GWENT COMPANION
          </h1>
          {view === 'builder' && (
            <button 
              onClick={handleSaveDeck}
              disabled={!activeDeck.name || totalCost > COST_LIMIT || leaderCount !== LEADER_COUNT_REQUIRED}
              className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all active:scale-95"
            >
              <Save size={18} />
              {activeDeck.id ? 'Update' : 'Save'}
            </button>
          )}
        </div>
        
        {/* Pinned Stats Bar for Builder */}
        {view === 'builder' && (
          <div className="max-w-md mx-auto mt-4 pt-4 border-t border-wood-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-parchment-300/60 uppercase">Cards</span>
                <span className={`text-lg font-black transition-colors ${
                  (activeDeck.cardIds?.length || 0) === DECK_SIZE_LIMIT 
                    ? 'text-emerald-400' 
                    : (activeDeck.cardIds?.length || 0) > DECK_SIZE_LIMIT 
                      ? 'text-red-400' 
                      : 'text-amber-400'
                }`}>
                  {activeDeck.cardIds?.length} / {DECK_SIZE_LIMIT}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-parchment-300/60 uppercase">Leader</span>
                <span className={`text-lg font-black transition-colors ${
                  leaderCount === LEADER_COUNT_REQUIRED ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {leaderCount} / {LEADER_COUNT_REQUIRED}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-parchment-300/60 uppercase">Units</span>
                <span className={`text-lg font-black transition-colors ${
                  unitCount >= MIN_UNIT_COUNT ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {unitCount} / {MIN_UNIT_COUNT}+
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-parchment-300/60 uppercase">Total Cost</span>
                <span className={`text-lg font-black transition-colors ${
                  totalCost > COST_LIMIT ? 'text-red-400' : 'text-parchment-100'
                }`}>
                  {totalCost} / {COST_LIMIT}
                </span>
              </div>
            </div>

            {/* Search & Filters - Pinned */}
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setShowOnlyInDeck(!showOnlyInDeck)}
                className={`p-3 rounded-xl border transition-all ${
                  showOnlyInDeck 
                    ? 'bg-emerald-700 border-emerald-600 text-white shadow-md shadow-emerald-900/20' 
                    : 'bg-wood-800 border-wood-700 text-parchment-300/60'
                }`}
                title="Filter: Only cards in deck"
              >
                <Filter size={20} />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment-300/40" size={18} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name, tags, ability..."
                  className="w-full bg-wood-800 border border-wood-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-sm text-parchment-100 placeholder:text-parchment-300/30"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        <AnimatePresence mode="wait">
          {/* --- DECK BUILDER VIEW --- */}
          {view === 'builder' && (
            <motion.div 
              key="builder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Deck Settings */}
              <section className="bg-wood-900 p-4 rounded-2xl border border-wood-800 shadow-xl shadow-black/10 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-parchment-300/40 tracking-widest">Deck Name</label>
                  <input 
                    type="text" 
                    value={activeDeck.name}
                    onChange={e => setActiveDeck(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter deck name..."
                    className="w-full bg-wood-800 border border-wood-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all text-parchment-100 placeholder:text-parchment-300/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-parchment-300/40 tracking-widest">Faction</label>
                    <select 
                      value={activeDeck.faction}
                      onChange={e => setActiveDeck(prev => ({ ...prev, faction: e.target.value as Faction, cardIds: [] }))}
                      className="w-full bg-wood-800 border border-wood-700 rounded-xl px-3 py-3 focus:outline-none font-bold text-parchment-200"
                    >
                      {FACTIONS.map(f => (
                        <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-parchment-300/40 tracking-widest">Shared Pool With</label>
                    <select 
                      value={otherDeckId || ''}
                      onChange={e => setOtherDeckId(e.target.value || null)}
                      className="w-full bg-wood-800 border border-wood-700 rounded-xl px-3 py-3 focus:outline-none text-sm text-parchment-300"
                    >
                      <option value="">None</option>
                      {decks.filter(d => d.id !== activeDeck.id && d.faction !== activeDeck.faction).map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Card List */}
              <div className="grid grid-cols-1 gap-4">
                {filteredCards.map((card: Card) => {
                  const count = currentDeckCounts[card.id] || 0;
                  const otherCount = neutralUsageInOtherDeck[card.id] || 0;
                  const limit = card.type === 'gold' ? GOLD_COPY_LIMIT : BRONZE_COPY_LIMIT;
                  const isNeutral = card.faction === 'neutral';
                  const isAtLimit = isNeutral ? (count + otherCount >= limit) : (count >= limit);

                  return (
                    <CardDisplay 
                      key={card.id}
                      card={card}
                      count={count}
                      onAdd={() => handleAddCard(card)}
                      onRemove={() => handleRemoveCard(card.id)}
                      disabled={isAtLimit || (activeDeck.cardIds?.length || 0) >= DECK_SIZE_LIMIT}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* --- DECKS LIST VIEW --- */}
          {view === 'decks' && (
            <motion.div 
              key="decks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-parchment-200">My Saved Decks</h2>
                <button 
                  onClick={() => {
                    setActiveDeck({ name: '', faction: 'monster', cardIds: [] });
                    setView('builder');
                  }}
                  className="p-2 bg-wood-800 rounded-full border border-wood-700 text-emerald-400 shadow-lg"
                >
                  <Plus size={20} />
                </button>
              </div>

              {decks.length === 0 ? (
                <div className="text-center py-12 bg-wood-900/50 rounded-3xl border-2 border-dashed border-wood-800">
                  <Library className="mx-auto text-wood-700 mb-4" size={48} />
                  <p className="text-parchment-300/40 font-medium">No decks found. Start building!</p>
                </div>
              ) : (
                decks.map(deck => (
                  <div key={deck.id} className="bg-wood-900 p-4 rounded-2xl border border-wood-800 shadow-xl shadow-black/10 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-parchment-100">{deck.name}</h3>
                      <div className="flex gap-2 text-xs text-parchment-300/60 mt-1">
                        <span className="font-bold uppercase text-emerald-400">{deck.faction}</span>
                        <span>•</span>
                        <span>{deck.cardIds.length} cards</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startTracking(deck)}
                        className="p-2 text-emerald-400 hover:bg-emerald-900/20 rounded-xl transition-colors"
                      >
                        <Play size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          setActiveDeck(deck);
                          setView('builder');
                        }}
                        className="p-2 text-amber-400 hover:bg-amber-900/20 rounded-xl transition-colors"
                      >
                        <LayoutGrid size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteDeck(deck.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {/* --- TRACKER VIEW --- */}
          {view === 'tracker' && trackingDeck && (
            <motion.div 
              key="tracker"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <button onClick={() => setView('decks')} className="p-2 bg-wood-800 rounded-xl border border-wood-700 text-parchment-200">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-lg font-black text-parchment-100">{trackingDeck.deck.name}</h2>
                  <p className="text-xs text-parchment-300/40 uppercase font-bold tracking-wider">Game Companion Mode</p>
                </div>
              </div>

              <div className="bg-emerald-800 text-white p-6 rounded-3xl shadow-2xl shadow-black/40 flex justify-between items-center border border-emerald-700/50">
                <div>
                  <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Remaining in Deck</p>
                  <span className="text-4xl font-black">
                    {trackingDeck.deck.cardIds.length - trackingDeck.drawnIndices.size}
                  </span>
                </div>
                <Gamepad2 size={48} className="opacity-20" />
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-parchment-300/40 uppercase tracking-widest px-1">In Deck</h3>
                  {trackingDeck.deck.cardIds
                    .map((id, index) => ({ id, index, card: getCardById(id) }))
                    .filter(item => item.card && !trackingDeck.drawnIndices.has(item.index))
                    .sort((a, b) => {
                      if (b.card!.cost !== a.card!.cost) return b.card!.cost - a.card!.cost;
                      return a.card!.name.localeCompare(b.card!.name);
                    })
                    .map(({ id, index, card }) => (
                      <div 
                        key={`${id}-${index}`}
                        className="bg-wood-900 p-3 rounded-2xl border border-wood-800 shadow-lg flex justify-between items-center transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                            card!.type === 'gold' ? 'bg-amber-900/40 text-amber-200' : 'bg-wood-800 text-parchment-300'
                          }`}>
                            {card!.strength}
                          </div>
                          <div>
                            <p className="font-bold text-parchment-100 text-sm">{card!.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedCardId(`${id}-${index}`)}
                            className="p-1.5 text-parchment-300/40 hover:text-emerald-400 transition-colors bg-wood-800 rounded-lg"
                          >
                            <Info size={16} />
                          </button>
                          <button 
                            onClick={() => toggleDrawn(index)}
                            className="p-1.5 rounded-lg border-2 transition-all bg-wood-800 border-wood-700 text-parchment-300/20"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-black text-parchment-300/40 uppercase tracking-widest px-1">Drawn / Out of Deck</h3>
                  {trackingDeck.deck.cardIds
                    .map((id, index) => ({ id, index, card: getCardById(id) }))
                    .filter(item => item.card && trackingDeck.drawnIndices.has(item.index))
                    .sort((a, b) => {
                      if (b.card!.cost !== a.card!.cost) return b.card!.cost - a.card!.cost;
                      return a.card!.name.localeCompare(b.card!.name);
                    })
                    .map(({ id, index, card }) => (
                      <div 
                        key={`${id}-${index}`}
                        className="bg-wood-950 p-3 rounded-2xl border border-wood-900 shadow-sm flex justify-between items-center transition-all opacity-40 grayscale"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                            card!.type === 'gold' ? 'bg-amber-900/20 text-amber-400/50' : 'bg-wood-900 text-parchment-300/50'
                          }`}>
                            {card!.strength}
                          </div>
                          <div>
                            <p className="font-bold text-parchment-300/50 text-sm">{card!.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedCardId(`${id}-${index}`)}
                            className="p-1.5 text-parchment-300/20 hover:text-emerald-400 transition-colors bg-wood-900 rounded-lg"
                          >
                            <Info size={16} />
                          </button>
                          <button 
                            onClick={() => toggleDrawn(index)}
                            className="p-1.5 rounded-lg border-2 transition-all bg-emerald-700 border-emerald-600 text-white"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {/* Floating Detail Overlay */}
              <AnimatePresence>
                {selectedCardId && view === 'tracker' && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full max-w-sm bg-wood-900 p-6 rounded-3xl shadow-2xl border border-wood-700 relative"
                    >
                      {(() => {
                        const cardId = selectedCardId.split('-')[0];
                        const card = getCardById(cardId);
                        if (!card) return null;
                        return (
                          <>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-2xl font-black text-parchment-100">{card.name}</h4>
                                <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest">{card.faction} • {card.tags}</p>
                              </div>
                              <button 
                                onClick={() => setSelectedCardId(null)} 
                                className="p-2 bg-wood-800 rounded-full hover:bg-wood-700 transition-colors text-parchment-300"
                              >
                                <X size={20} />
                              </button>
                            </div>
                            <div className="bg-black/20 p-4 rounded-2xl border border-wood-800 mb-6">
                              <p className="text-parchment-200 leading-relaxed font-medium">{card.ability}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-wood-800 p-3 rounded-xl text-center border border-wood-700">
                                <p className="text-[10px] font-black text-parchment-300/40 uppercase mb-1">Strength</p>
                                <p className="text-xl font-black text-parchment-100">{card.strength}</p>
                              </div>
                              <div className="bg-wood-800 p-3 rounded-xl text-center border border-wood-700">
                                <p className="text-[10px] font-black text-parchment-300/40 uppercase mb-1">Cost</p>
                                <p className="text-xl font-black text-parchment-100">{card.cost}</p>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
              
              {trackingDeck.drawnIndices.size === trackingDeck.deck.cardIds.length && (
                <div className="text-center py-12">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
                  <p className="text-parchment-100 font-black text-xl">Deck Empty!</p>
                  <button 
                    onClick={() => startTracking(trackingDeck.deck)}
                    className="mt-4 text-emerald-400 font-bold"
                  >
                    Reset Tracker
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-wood-900 border-t border-wood-800 px-6 py-3 pb-8 z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button 
            onClick={() => setView('builder')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'builder' ? 'text-emerald-400' : 'text-parchment-300/30'}`}
          >
            <LayoutGrid size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Builder</span>
          </button>
          <button 
            onClick={() => setView('decks')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'decks' ? 'text-emerald-400' : 'text-parchment-300/30'}`}
          >
            <Library size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Decks</span>
          </button>
          <button 
            onClick={() => {
              if (trackingDeck) setView('tracker');
              else setView('decks');
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'tracker' ? 'text-emerald-400' : 'text-parchment-300/30'}`}
          >
            <Gamepad2 size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest">Tracker</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
