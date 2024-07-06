using UnityEngine;
using UnityEngine.Serialization;

namespace Gameplay.Quiz
{
    [CreateAssetMenu(fileName = "QuizConfiguration", menuName = "Quiz/Configuration")]
    public class QuizConfigSO : ScriptableObject
    {
        [Header("Feedback")]
        [SerializeField] private int quizNextQuestionWaitTime = 3;
        [SerializeField] private int quizCompleteWaitTime = 3;
        [SerializeField] private string quizCompleteSuccessMessage = "Congratulations!";
        [SerializeField] private string quizCompleteFailureMessage = "Better luck next time!";
        
        [Header("Scoring")]
        [SerializeField] [Range(0.0f, 1.0f)] private float successThreshold = 0.5f;
        [SerializeField] private int successfulAnswerPoints = 10;
        [SerializeField] private int wrongAnswerPoints = -5;
        
        public int QuizNextQuestionWaitTime => quizNextQuestionWaitTime;
        public int QuizCompleteWaitTime => quizCompleteWaitTime;
        public string QuizCompleteSuccessMessage => quizCompleteSuccessMessage;
        public string QuizCompleteFailureMessage => quizCompleteFailureMessage;
        
        public float SuccessThreshold => successThreshold;
        public int SuccessfulAnswerPoints => successfulAnswerPoints;
        public int WrongAnswerPoints => wrongAnswerPoints;
    }
}
