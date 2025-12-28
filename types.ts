export enum AudienceType {
  GENERAL = 'General Public',
  EXECUTIVE = 'Business Executives',
  ACADEMIC = 'Researchers & Academics',
  KIDS = 'Children (5-10 years)',
  TEENS = 'Students & Teens'
}

export enum ChartType {
  BAR = 'bar',
  PIE = 'pie',
  AREA = 'area',
  LINE = 'line',
  NONE = 'none'
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface ResearchResult {
  summary: string;
  groundingSources: GroundingSource[];
  chartData: ChartDataPoint[];
  chartType: ChartType;
  chartTitle: string;
  chartXAxis?: string;
  chartYAxis?: string;
  imagePrompt: string;
}

export interface GeneratedImage {
  url: string;
  mimeType: string;
}

export interface AppState {
  isLoading: boolean;
  step: 'idle' | 'researching' | 'structuring' | 'generating_image' | 'complete' | 'error';
  error: string | null;
  researchResult: ResearchResult | null;
  generatedImage: GeneratedImage | null;
}