// src/types.ts or src/types/index.ts

export interface Poll {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  startDate: string;
  endDate: string;
  contractStatus: number;
  status: "upcoming" | "active" | "ended";
  totalVotes: number;
  candidateCount: number;
  createdTime: number;
  isEligible: boolean;
  hasVoted: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  imageUrl: string;
  description: string;
  votes: number;
  percentage: number;
  pollId: string;
  pollTitle: string;
  isActive: boolean;
}

export interface PollAnalytics {
  totalVotes: number;
  participationRate: number;
  avgVotesPerHour: number;
  peakVotingHour: string;
  hourlyVotingPattern: { hour: string; votes: number }[];
}

export const PollStatus = {
  CREATED: 0,
  ACTIVE: 1,
  ENDED: 2,
  FINALIZED: 3,
  DISPUTED: 4,
} as const;

export type PollStatus = (typeof PollStatus)[keyof typeof PollStatus];

export interface Startpoll {
  id: string;
  title: string;
  candidateCount: number;
  status: PollStatus;
  minVotersRequired?: number;
}

export interface CandidatePoll {
  id: string;
  title: string;
  status: PollStatus;
}

export interface PollDetails {
  id: string;
  title: string;
  description: string;
  candidateCount: number;
  status: PollStatus;
  imageUrl: string;
  createdAt: string;
  minVotersRequired: number;
}

export interface DashboardPoll {
  id: string;
  title: string;
  status: PollStatus;
  candidateCount: number;
  totalVotes: number;
  minVotersRequired: number;
}
