import NPCDialogueOptionsStatistics from '../components/statistics/NPCDialogueOptionsStatistics';
import NPCStatistics from '../components/statistics/NPCStatistics';
import QuizStatistics from '../components/statistics/QuizStatistics';

const StatisticsPage = () => {
  return (
    <main className='flex flex-col gap-8'>
      <NPCStatistics />
      <NPCDialogueOptionsStatistics />
      <QuizStatistics />
    </main>
  );
};

export default StatisticsPage;
