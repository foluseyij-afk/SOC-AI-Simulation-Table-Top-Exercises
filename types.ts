
export type Difficulty = 'Entry-Level' | 'Mid-Level' | 'Senior-Level';
export type ThreatType = 'Malware Outbreak' | 'Cloud Security Breach' | 'Endpoint Compromise' | 'Account Takeover' | 'Insider Threat' | 'DDoS / Network Attack';

export interface SimulationState {
  currentStep: number;
  maxSteps: number;
  history: Array<{
    question: string;
    choice: string;
    points: number;
    consequence: string;
  }>;
  overallContext: string;
  threatLevel: number; // 0 to 100
}

export interface ScenarioOption {
  text: string;
  points: number; // 0 to 10
  feedback: string;
  consequence: string; // Describes the narrative shift for the next step
}

export interface SimulationStep {
  title: string;
  context: string;
  question: string;
  options: ScenarioOption[];
  explanation: string;
  artifacts: string[];
  isFinal: boolean;
}

// Fixed missing UserResponse interface
export interface UserResponse {
  selectedOptionIndex: number;
  pointsReceived: number;
}

export interface TrainingResult {
  totalScore: number;
  maxPossibleScore: number;
  overallFeedback: string;
  strengths: string[];
  weaknesses: string[];
  narrativeSummary: string;
}