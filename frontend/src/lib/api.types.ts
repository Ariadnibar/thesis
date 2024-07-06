export interface ApiSignInResponse {
  access_token: string;
}

interface ApiFetchQuizResponseAnswer {
  id: string;
  content: string;
  isCorrect: boolean;
  questionId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiFetchQuizResponseQuestion {
  id: string;
  content: string;
  order: number;
  quizId: string;
  createdAt: string;
  updatedAt: string;
  answers: ApiFetchQuizResponseAnswer[];
}

export interface ApiFetchQuizResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  questions: ApiFetchQuizResponseQuestion[];
}

export type ApiFetchQuizzesResponse = ApiFetchQuizResponse[];

interface ApiCreateAnswerRequest {
  content: string;
  isCorrect: boolean;
}

interface ApiCreateQuestionRequest {
  content: string;
  order: number;
  answers: ApiCreateAnswerRequest[];
}

export interface ApiCreateQuizRequest {
  name: string;
  questions: ApiCreateQuestionRequest[];
}

export enum ApiLogAction {
  NPC_AI_SENT_MESSAGE = 'npc-ai-sent-message',
  NPC_NORMAL_SELECTED_OPTION = 'npc-normal-selected-option',
}

export interface ApiFetchNPCStatsResponse {
  interactions: {
    type: ApiLogAction.NPC_AI_SENT_MESSAGE | ApiLogAction.NPC_NORMAL_SELECTED_OPTION;
    interactions: number;
    users: number;
  }[];
}

export type ApiFetchQuizStatsResponse = {
  name: string;
  avg_points: number;
}[];

export type ApiFetchNPCDialogueOptionsStatsResponse = {
  npc: string;
  dialogueOptions: {
    content: string;
    clicks: number;
  }[];
}[];
