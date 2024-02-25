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
    
    public static class QuizzesService
    {
        public static async Task<HttpServiceResponse<GetQuizSuccessResponse>> GetQuiz(string id)
        {
            return await HttpService.Get<GetQuizSuccessResponse>($"quizzes/{id}");
        }
    }
}
