using System.Threading.Tasks;

namespace Web
{
    public struct SendMessageRequestBody
    {
        public string content { get; set; }
        public string context { get; set; }
    }
        
    public struct SendMessageResponse
    {
        public string message { get; set; }
    }
    
    public static class OpenAIService
    {
        public static async Task<HttpServiceResponse<SendMessageResponse>> SendMessage(SendMessageRequestBody body)
        {
            return await HttpService.Post<SendMessageResponse, SendMessageRequestBody>("openai/send-message", body);
        }
    }
}
