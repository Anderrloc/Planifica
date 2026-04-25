
export type ModuleType = 'welcome' | 'annual-prompt' | 'units-prompt' | 'sessions-prompt' | 'evaluation-instruments' | 'exams-prompt' | 'materials-prompt' | 'ai-pages' | 'inclusive-session' | 'math-exercises' | 'science-technology' | 'games-generator' | 'chatbot' | 'learning-experience' | 'units' | 'learning-activity' | 'institution-settings' | 'text-to-speech';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
