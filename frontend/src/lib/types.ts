interface StorageItem<T> {
  key: string;
  value?: T;
}

export interface StorageItems {
  token: StorageItem<string>;
}

export interface Quiz {
  id: string;
  name: string;
  questions: Question[];
}

export interface Question {
  id: string;
  content: string;
  order: number;
  createdAt: Date;
  answers: Answer[];
}

export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
  createdAt: Date;
}
