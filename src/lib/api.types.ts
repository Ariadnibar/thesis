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
