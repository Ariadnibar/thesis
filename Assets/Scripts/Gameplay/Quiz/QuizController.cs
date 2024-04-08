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
                    .Initialize(_currentQuestion.answers[i], OnButtonInteract);
            }
        }
        
        private void OnButtonInteract(GetQuizSuccessResponseAnswer answer)
        {
            // Disable buttons
            foreach (Transform child in buttonsParent.transform)
                child.GetComponent<QuizButtonController>().SetButtonInteractable(false);
            
            var points = answer.isCorrect ? config.SuccessfulAnswerPoints : config.WrongAnswerPoints;

            _score += points;
            
            // Update text
            GameManager.Singleton.AddScore(points, config.SuccessfulAnswerPoints);

            var body = new AnswerQuestionRequestBody { answerId = answer.id, points = points };
            QuizzesService.AnswerQuestion(body);

            if (FindNextQuestion())
            {
                Invoke(nameof(UpdateQuestion), config.QuizNextQuestionWaitTime);
            }
            else
            {
                _score = Mathf.Max(0, _score);
                
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
            
            // Log to database
            var body = new WriteQuizLogRequestBody { quizId = quizId };
            LoggingService.WriteQuizStartLog(body);
        }
        
        private void OnTriggerExit(Collider other)
        {
            if (!_isValid || !other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<Entities.Player.PlayerController>();
            if (!playerController) return;
            
            if (playerController.IsLocalPlayer)
                virtualCamera.gameObject.SetActive(false);
            
            // Log to database
            var body = new WriteQuizLogRequestBody { quizId = quizId };
            LoggingService.WriteQuizEndLog(body);
        }
    }
}
