export interface RaceResult {
  points?: number;
  rank?: number
  number: number;
  country: string;
  driver: string;
  team: string;
  scores: number[];
  worst: number;
  tiebreaker?: number;
}

export interface History {
  years: Championship[];
}

export interface Championship {
  year: string;
  verano?: Leaderboard;
  invierno?: Leaderboard;
}

export interface Class {
  title: string;
  ageGroup: string;
  details: string[];
  categories: Category[];
  img: string;
}

export interface Leaderboard {
  year: number;
  season: string;
  classes: Class[];
  teams?: Team[];
}

export interface Team {
  name: string;
  logo: string;
  points: number;
}

export interface Category {
  name: string;
  results: RaceResult[];
}


export interface Pilot {
  name: string;
  kartNumber: number;
  categories: string[];
  biography: string;
  country: string;
  teamName: string;
  profileUrl: string;
  teamLogo: string;
}

