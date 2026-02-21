export type CardType = 'gold' | 'bronze';
export type CardCategory = 'Unit' | 'Spell';
export type Faction = 'monster' | 'nilfgaard' | 'northern_realms' | 'scoiatel' | 'skellige' | 'neutral' | string;

export interface Card {
  id: string;
  name: string;
  strength: number;
  cost: number;
  tags: string;
  ability: string;
  type: CardType;
  category: CardCategory;
  faction: Faction;
}

export interface Deck {
  id: string;
  name: string;
  faction: Faction;
  cardIds: string[]; // List of card IDs (can have duplicates for bronze)
  createdAt: number;
}

export interface SharedPool {
  deckAId: string | null;
  deckBId: string | null;
}

export type AppView = 'builder' | 'decks' | 'tracker';
