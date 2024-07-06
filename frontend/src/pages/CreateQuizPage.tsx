import { QuizContextProvider } from '../contexts/QuizContext';
import QuizForm from '../components/QuizForm';

const CreateQuizPage = () => {
  return (
    <QuizContextProvider>
      <QuizForm />
    </QuizContextProvider>
  );
};

export default CreateQuizPage;
