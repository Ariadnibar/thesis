using Cinemachine;
using UnityEngine;
using Web;

namespace Gameplay.Quiz
{
    public class QuizController : MonoBehaviour
    {
        [Header("Quiz")]
        [SerializeField] private string quizId = "";

        [Header("Configuration")]
        [SerializeField] private QuizConfigSO config;
        
        [Header("Visuals")]
        [SerializeField] private GameObject questionPanel;
        [SerializeField] private GameObject answersPanel;
        [SerializeField] private TMPro.TMP_Text questionText;
        [SerializeField] private TMPro.TMP_Text answersText;
        [SerializeField] private TMPro.TMP_Text feedbackText;
        [SerializeField] private CinemachineVirtualCamera virtualCamera;
        
        [Header("Quiz Buttons")]
        [SerializeField] private GameObject buttonsParent;
        [SerializeField] private Transform buttonsStartPoint;
        [SerializeField] private Transform buttonsEndPoint;
        [SerializeField] private GameObject buttonsPrefab;

        private bool _isValid = true;
        private GetQuizSuccessResponse _quiz;
        private GetQuizSuccessResponseQuestion _currentQuestion;
        
        private int _score;

        private void Awake()
        {
            if (quizId != "") return;
            
            ShowFeedback("Quiz ID not set!");
            _isValid = false;
        }
        
        private async void Start()
        {
            if (!_isValid) return;

            var res = await QuizzesService.GetQuiz(quizId);

            if (res.Success)
            {
                _quiz = res.Data;
                
                foreach (var question in _quiz.questions)
                {
                    if (question.order != 1) continue;
                    
                    _currentQuestion = question;
                    break;
                }
                
                UpdateQuestion();

                return;
            }
            
            var feedback = res.StatusCode switch
            {
                System.Net.HttpStatusCode.NotFound => "Quiz not found",
                _ => res.Message
            };
            
            ShowFeedback(feedback);
            
            _isValid = false;
        }
        
        private void UpdateQuestion()
        {
            questionText.text = _currentQuestion.content;

            var answers = "";
            
            for (var i = 0; i < _currentQuestion.answers.Length; i++)
                answers += $"{i + 1}. {_currentQuestion.answers[i].content}\n\n";
            
            answersText.text = answers;
            
            SpawnQuizButtons();
            
            // Enable buttons
            foreach (Transform child in buttonsParent.transform)
                child.GetComponent<QuizButtonController>().SetButtonInteractable(true);
        }
        
        private void SpawnQuizButtons()
        {
            // Clear previous buttons
            foreach (Transform child in buttonsParent.transform)
                Destroy(child.gameObject);
            
            // Spawn new buttons
            var distance = Vector3.Distance(buttonsStartPoint.position, buttonsEndPoint.position);
            var spacing = distance / (_currentQuestion.answers.Length + 1);
            
            var baseSpacing = buttonsStartPoint.right * spacing;
            
            for (var i = 0; i < _currentQuestion.answers.Length; i++)
            {
                var position = buttonsStartPoint.position + (baseSpacing * (i + 1));
                var button = Instantiate(buttonsPrefab, position, Quaternion.identity, buttonsParent.transform);
                button.GetComponent<QuizButtonController>()
                    .Initialize(_currentQuestion.answers[i].isCorrect, OnButtonInteract);
            }
        }
        
        private void OnButtonInteract(bool isCorrect)
        {
            // Disable buttons
            foreach (Transform child in buttonsParent.transform)
                child.GetComponent<QuizButtonController>().SetButtonInteractable(false);
            
            _score += isCorrect ? config.SuccessfulAnswerPoints : config.WrongAnswerPoints;
            
            // Color answers
            // var answers = "";
            // foreach (var answer in _currentQuestion.answers)
            // {
            //     var color = answer.isCorrect ? "#00FF00" : "#FF0000";
            //     answers += $"<color={color}>{answer.content}</color>\n\n";
            // }
            //
            // for (var i = 0; i < _currentQuestion.answers.Length; i++)
            // {
            //     var answer = i == _currentQuestion.CorrectAnswerIndex
            //         ? $"<color=#00FF00>{_currentQuestion.Answers[i]}</color>"
            //         : $"<color=#FF0000>{_currentQuestion.Answers[i]}</color>";
            //     
            //     answers += $"{i + 1}. {answer}\n\n";
            // }
            // answersText.text = answers;
            
            // Log to database
            // await Core.Database.LogQuizAnswer(quizId, _currentQuestionIndex, _currentQuestion.Question,
            //     _currentQuestion.Answers[answerIndex], answerIndex == _currentQuestion.CorrectAnswerIndex);

            if (FindNextQuestion())
            {
                Invoke(nameof(UpdateQuestion), config.QuizNextQuestionWaitTime);
            }
            else
            {
                // Log to database
                // await Core.Database.LogQuizScore(quizId, _score);
                
                Invoke(nameof(OnQuizComplete), config.QuizCompleteWaitTime);
            }
        }
        
        private bool FindNextQuestion()
        {
            foreach (var question in _quiz.questions)
            {
                if (question.order != _currentQuestion.order + 1) continue;
                
                _currentQuestion = question;
                
                return true;
            }
            
            return false;
        }
        
        private void OnQuizComplete()
        {
            var totalScore = config.SuccessfulAnswerPoints * _quiz.questions.Length;
            var normalizedScore = (float) _score / totalScore;
            
            answersText.text = $"Score: {_score}/{totalScore}\n\n{normalizedScore:P}";
            
            questionText.text = normalizedScore >= config.SuccessThreshold
                ? $"<color=#00FF00>{config.QuizCompleteSuccessMessage}</color>"
                : $"<color=#FF0000>{config.QuizCompleteFailureMessage}</color>";
            
            // Center answers text
            answersText.alignment = TMPro.TextAlignmentOptions.Center;
            
            // Remove buttons
            foreach (Transform child in buttonsParent.transform)
                Destroy(child.gameObject);
        }
        
        private void ShowFeedback(string feedback)
        {
            questionPanel.SetActive(false);
            answersPanel.SetActive(false);
            
            feedbackText.text = feedback;
            feedbackText.gameObject.SetActive(true);
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!_isValid || !other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<Entities.Player.PlayerController>();
            if (!playerController) return;
            
            if (playerController.IsLocalPlayer)
                virtualCamera.gameObject.SetActive(true);
        }
        
        private void OnTriggerExit(Collider other)
        {
            if (!_isValid || !other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<Entities.Player.PlayerController>();
            if (!playerController) return;
            
            if (playerController.IsLocalPlayer)
                virtualCamera.gameObject.SetActive(false);
        }
    }
}
