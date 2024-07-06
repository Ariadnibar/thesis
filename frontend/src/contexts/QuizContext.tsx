import { createContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { type Quiz, type Question, type Answer } from '../lib/types';
import { ApiFetchQuizResponse } from '../lib/api.types';

interface QuizContextType {
  quiz: Quiz;
  setQuiz: (quiz: Quiz) => void;
  resetQuiz: () => void;

  editing: boolean;

  validationError: string | null;
  validateQuiz: () => boolean;

  updateName: (name: string) => void;

  addQuestion: () => void;
  updateQuestion: (question: Question) => void;
  updateQuestionOrder: (questionId: string, direction: 'up' | 'down') => void;
  removeQuestion: (id: string) => void;

  addAnswer: (questionId: string) => void;
  updateAnswer: (answer: Answer) => void;
  removeAnswer: (id: string) => void;
}

const initialState: QuizContextType = {
  quiz: {
    id: uuidv4(),
    name: '',
    questions: [],
  },
  setQuiz: () => {},
  resetQuiz: () => {},

  editing: false,

  validationError: null,
  validateQuiz: () => false,

  updateName: () => {},

  addQuestion: () => {},
  updateQuestion: () => {},
  updateQuestionOrder: () => {},
  removeQuestion: () => {},

  addAnswer: () => {},
  updateAnswer: () => {},
  removeAnswer: () => {},
};

const QuizContext = createContext<QuizContextType>(initialState);

interface Props {
  children: React.ReactNode;
  quizToEdit?: ApiFetchQuizResponse;
}

export const QuizContextProvider = ({ children, quizToEdit }: Props) => {
  const [quiz, setQuiz] = useState<Quiz>(initialState.quiz);
  const [editing, setEditing] = useState<boolean>(initialState.editing);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (quizToEdit) {
      setQuiz({
        id: quizToEdit.id,
        name: quizToEdit.name,
        questions: quizToEdit.questions.map((question) => ({
          id: question.id,
          content: question.content,
          order: question.order,
          createdAt: new Date(question.createdAt),
          answers: question.answers.map((answer) => ({
            id: answer.id,
            content: answer.content,
            isCorrect: answer.isCorrect,
            createdAt: new Date(answer.createdAt),
          })),
        })),
      });

      setEditing(true);
    }
  }, [quizToEdit]);

  const resetQuiz = () => {
    setQuiz(initialState.quiz);
  };

  const validateQuiz = (): boolean => {
    setValidationError(null);

    if (!quiz.name) {
      setValidationError('Quiz name is required');
      return false;
    }

    if (quiz.questions.length === 0) {
      setValidationError('At least one question is required');
      return false;
    }

    return quiz.questions.every((question) => {
      if (!question.content) {
        setValidationError('Question content is required');
        return false;
      }

      if (question.answers.length === 0) {
        setValidationError('At least one answer is required');
        return false;
      }

      if (!question.answers.some((answer) => answer.isCorrect)) {
        setValidationError('At least one correct answer is required');
        return false;
      }

      return question.answers.every((answer) => {
        if (!answer.content) {
          setValidationError('Answer content is required');
          return false;
        }

        return true;
      });
    });
  };

  const updateName = (name: string) => {
    setQuiz((prev) => ({
      ...prev,
      name,
    }));
  };

  const addQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: uuidv4(),
          content: '',
          order: prev.questions.length + 1,
          createdAt: new Date(),
          answers: [],
        },
      ],
    }));
  };

  const updateQuestion = (question: Question) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === question.id ? { ...q, ...question } : q)),
    }));
  };

  const updateQuestionOrder = (questionId: string, direction: 'up' | 'down') => {
    const question = quiz.questions.find((q) => q.id === questionId);

    if (!question) {
      return;
    }

    const index = quiz.questions.indexOf(question);
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= quiz.questions.length) {
      return;
    }

    const newQuestions = [...quiz.questions];
    newQuestions[index] = newQuestions[newIndex];
    newQuestions[newIndex] = question;

    setQuiz((prev) => ({
      ...prev,
      questions: newQuestions.map((q, i) => ({ ...q, order: i + 1 })),
    }));
  };

  const removeQuestion = (id: string) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  const addAnswer = (questionId: string) => {
    const question = quiz.questions.find((q) => q.id === questionId);

    if (!question) {
      return;
    }

    updateQuestion({
      ...question,
      answers: [
        ...question.answers,
        {
          id: uuidv4(),
          content: '',
          createdAt: new Date(),
          isCorrect: false,
        },
      ],
    });
  };

  const updateAnswer = (answer: Answer) => {
    const question = quiz.questions.find((q) => q.answers.some((a) => a.id === answer.id));

    if (!question) {
      return;
    }

    updateQuestion({
      ...question,
      answers: question.answers.map((a) => (a.id === answer.id ? { ...a, ...answer } : a)),
    });
  };

  const removeAnswer = (id: string) => {
    const question = quiz.questions.find((q) => q.answers.some((a) => a.id === id));

    if (!question) {
      return;
    }

    updateQuestion({
      ...question,
      answers: question.answers.filter((a) => a.id !== id),
    });
  };

  return (
    <QuizContext.Provider
      value={{
        quiz,
        setQuiz,
        resetQuiz,

        editing,

        validationError,
        validateQuiz,

        updateName,

        addQuestion,
        updateQuestion,
        updateQuestionOrder,
        removeQuestion,

        addAnswer,
        updateAnswer,
        removeAnswer,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export default QuizContext;
