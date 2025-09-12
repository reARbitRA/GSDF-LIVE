
export enum Team {
  TOWN = 'Town',
  MAFIA = 'Mafia',
  INDEPENDENT = 'Independent',
  THIRD_PARTY = 'Third Party',
}

export interface Role {
  id: string;
  name: string;
  team: Team;
  description: string;
  abilities: string[];
  isCustom: boolean;
  category?: string;
}

export interface NexusNode extends Role {
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  from: string; // role ID
  to: string; // role ID
  type: 'synergy' | 'conflict' | 'information' | 'protection' | 'neutral';
  strength: 'normal' | 'strong';
  style: 'solid' | 'dashed' | 'dotted';
  description: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  roles: Role[];
  connections: Connection[];
  rules: string[];
  playerCount: {
    min: number;
    max: number;
  };
}

export interface Tournament {
  id: string;
  name: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  game: string;
  participants: number;
  maxParticipants: number;
  startDate: string;
}

export interface GeneratedRoleIdea {
  name: string;
  team: string;
  description: string;
}

export interface AIGenerationResponse {
  new_roles: GeneratedRoleIdea[];
  mechanic_suggestion: string;
}