import { Card, Faction } from './types';
import cardsData from './data/cards.json';

export const CARDS: Card[] = cardsData as Card[];

export const FACTIONS: Faction[] = Array.from(new Set(CARDS.map(c => c.faction))).filter(f => f !== 'neutral');

export const DECK_SIZE_LIMIT = 26;
export const COST_LIMIT = 65;
export const MIN_UNIT_COUNT = 13;
export const LEADER_COUNT_REQUIRED = 1;
export const BRONZE_COPY_LIMIT = 2;
export const GOLD_COPY_LIMIT = 1;

export const getCardById = (id: string) => CARDS.find(c => c.id === id);
