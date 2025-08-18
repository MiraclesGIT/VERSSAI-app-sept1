
export interface DueDiligenceReport {
  id: string;
  startupName: string;
  startupLogo?: string;
  logoColor: string;
  reportType: 'micro' | 'basic' | 'dataroom';
  reportDate: string;
  startupId: string;
}

export interface DueDiligenceStats {
  micro: number;
  basic: number;
  dataroom: number;
}
