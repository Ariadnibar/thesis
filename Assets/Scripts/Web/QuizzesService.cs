using System.Threading.Tasks;

namespace Web
{
    public struct GetQuizSuccessResponseAnswer
    {
        public string id;
        public string content;
        public bool isCorrect;
    }
    
    public struct GetQuizSuccessResponseQuestion
    {
        public string id;
        public string content;
        public int order;
        public GetQuizSuccessResponseAnswer[] answers;
    }
    
    public struct GetQuizSuccessResponse
    {
        public string id;
        public string name;
        public GetQuizSuccessResponseQuestion[] questions;
    }

    public struct AnswerQuestionRequestBody
    {
        public string answerId;
        public int points;
    }
    
    public struct GetHighScoresSuccessResponse
    {
        public string username;
        public int session_points;
    }
    
    public static class QuizzesService
    {
        public static async Task<HttpServiceResponse<GetQuizSuccessResponse>> GetQuiz(string id)
        {
            return await HttpService.Get<GetQuizSuccessResponse>($"quizzes/{id}");
        }
        
        public static async void AnswerQuestion(AnswerQuestionRequestBody body)
        {
            await HttpService.Post<object, AnswerQuestionRequestBody>($"quizzes/answer-question", body);
        }

        public static async Task<HttpServiceResponse<GetHighScoresSuccessResponse[]>> GetHighScores(int limit)
        {
            return await HttpService.Get<GetHighScoresSuccessResponse[]>($"quizzes/high-scores?limit={limit}");
        }
    }
}
