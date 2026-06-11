
import { GoogleGenAI, Type } from "@google/genai";
import { Difficulty, ThreatType, SimulationState, SimulationStep, TrainingResult } from "../types";


const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Gemini API key not found");
}

const ai = new GoogleGenAI({ apiKey })


const STEP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    context: { type: Type.STRING },
    question: { type: Type.STRING },
    explanation: { type: Type.STRING },
    artifacts: { type: Type.ARRAY, items: { type: Type.STRING } },
    isFinal: { type: Type.BOOLEAN },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          points: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          consequence: { type: Type.STRING }
        },
        required: ["text", "points", "feedback", "consequence"]
      }
    }
  },
  required: ["title", "context", "question", "options", "explanation", "artifacts", "isFinal"]
};

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 */
function shuffleOptions<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function startSimulation(difficulty: Difficulty, threat: ThreatType): Promise<SimulationStep> {
  const prompt = `Start a realistic SOC Tabletop Exercise.
  Difficulty: ${difficulty}
  Threat Type: ${threat}
  
  This is STEP 1 (Initial Detection). 
  Provide a detailed context with logs/artifacts.
  4 branching options ranging from critical mistakes to expert responses (weighted 0-10 pts).
  
  CRITICAL: 
  1. Randomize the order of quality for options (do not always put the best one first).
  2. The 'explanation' field should be a general debrief of the concepts and SHOULD NOT reference specific option letters (A, B, C, D) because they will be scrambled.
  3. Ensure complexity matches ${difficulty}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: STEP_SCHEMA,
    },
  });

  const step: SimulationStep = JSON.parse(response.text);
  step.options = shuffleOptions(step.options);
  return step;
}

export async function getNextStep(
  difficulty: Difficulty, 
  threat: ThreatType, 
  state: SimulationState
): Promise<SimulationStep> {
  const lastAction = state.history[state.history.length - 1];
  
  const prompt = `Continue the SOC Tabletop Exercise.
  Difficulty: ${difficulty}
  Threat Type: ${threat}
  Current Progress: Step ${state.currentStep + 1} of ${state.maxSteps}
  
  PREVIOUS ACTION TAKEN BY ANALYST: "${lastAction.choice}"
  NARRATIVE CONSEQUENCE OF THAT ACTION: "${lastAction.consequence}"
  
  Based on the consequence, generate the NEXT stage of the incident. 
  If the previous action was poor (low points), the situation should escalate (e.g., more systems infected, data exfiltrated).
  If it was good, the situation should move toward containment/analysis.
  
  CRITICAL: 
  1. Randomize the order of quality for options (do not always put the best one first).
  2. The 'explanation' field should be a general debrief and SHOULD NOT reference specific letters (A, B, C, D).
  
  If this is Step ${state.maxSteps}, set isFinal to true.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: STEP_SCHEMA,
    },
  });

  const step: SimulationStep = JSON.parse(response.text);
  step.options = shuffleOptions(step.options);
  return step;
}

export async function generateFinalAssessment(
  difficulty: Difficulty,
  threat: ThreatType,
  state: SimulationState
): Promise<Omit<TrainingResult, 'totalScore' | 'maxPossibleScore'>> {
  const historySummary = state.history.map((h, i) => `Step ${i+1}: ${h.choice} (${h.points}/10 pts) - ${h.consequence}`).join('\n');
  
  const prompt = `Evaluate the SOC Analyst's performance on this branching simulation.
  Level: ${difficulty}
  Scenario: ${threat}
  Full Narrative Path Taken:
  ${historySummary}
  
  Provide a JSON object with:
  - overallFeedback: Professional summary.
  - strengths: 3 items.
  - weaknesses: 3 items (tactical deficiencies or areas for improvement).
  - narrativeSummary: A paragraph explaining how their choices shaped the outcome.`;

  const feedbackSchema = {
    type: Type.OBJECT,
    properties: {
      overallFeedback: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
      narrativeSummary: { type: Type.STRING }
    },
    required: ["overallFeedback", "strengths", "weaknesses", "narrativeSummary"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-pro',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: feedbackSchema,
    },
  });

  return JSON.parse(response.text);
}
