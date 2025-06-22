import { CyberImplant } from '../types/tournament';

export const CYBER_IMPLANTS: CyberImplant[] = [
  {
    id: 'neural-1',
    name: 'NEURAL LINK v2.1',
    type: 'neural',
    level: 1,
    boost: 15,
    description: 'Améliore la coordination et les réflexes',
    color: '#00d4ff'
  },
  {
    id: 'neural-2',
    name: 'CORTEX ENHANCER',
    type: 'neural',
    level: 2,
    boost: 25,
    description: 'Augmente la capacité de calcul tactique',
    color: '#0099cc'
  },
  {
    id: 'ocular-1',
    name: 'CYBER EYES mk3',
    type: 'ocular',
    level: 1,
    boost: 20,
    description: 'Vision augmentée avec analyse balistique',
    color: '#00ff88'
  },
  {
    id: 'ocular-2',
    name: 'RETINAL SCANNER',
    type: 'ocular',
    level: 2,
    boost: 30,
    description: 'Détection de trajectoire avancée',
    color: '#00cc66'
  },
  {
    id: 'motor-1',
    name: 'SERVO ARMS',
    type: 'motor',
    level: 1,
    boost: 18,
    description: 'Bras cybernétiques pour précision maximale',
    color: '#ff6600'
  },
  {
    id: 'motor-2',
    name: 'NANO MUSCLES',
    type: 'motor',
    level: 2,
    boost: 28,
    description: 'Fibres musculaires synthétiques',
    color: '#ff4400'
  },
  {
    id: 'tactical-1',
    name: 'BATTLE AI',
    type: 'tactical',
    level: 1,
    boost: 22,
    description: 'IA tactique intégrée',
    color: '#ff00ff'
  },
  {
    id: 'tactical-2',
    name: 'QUANTUM PROCESSOR',
    type: 'tactical',
    level: 2,
    boost: 35,
    description: 'Processeur quantique pour stratégie avancée',
    color: '#cc00cc'
  }
];

export function getRandomImplants(count: number = 2): CyberImplant[] {
  const shuffled = [...CYBER_IMPLANTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function calculatePlayerRating(implants: CyberImplant[]): number {
  return implants.reduce((total, implant) => total + implant.boost, 100);
}

export function getImplantIcon(type: string): string {
  switch (type) {
    case 'neural': return '🧠';
    case 'ocular': return '👁️';
    case 'motor': return '🦾';
    case 'tactical': return '⚡';
    default: return '🔧';
  }
}