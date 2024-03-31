using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Web
{
    public struct NpcDialogueOption
    {
        public string id;
        public string action;
        public string content;
        
        [JsonProperty(Required = Required.AllowNull)]
        public string nextDialogueId;
    }
    
    public struct NpcDialogue
    {
        public string id;
        public string content;
        public NpcDialogueOption[] options;
    }
    
    public struct GetNormalNpcSuccessResponse
    {
        public string id;
        public string type;
        public NpcDialogue dialogue;
    }
    
    public struct GetAiNpcSuccessResponse
    {
        public string id;
        public string type;
        public string context;
    }
    
    public struct AiSendMessageRequestBody
    {
        public string npcId { get; set; }
        public string content { get; set; }
    }
    
    public struct AiSendMessageResponse
    {
        public string message { get; set; }
    }
    
    public static class NpcsService
    {
        public static async Task<HttpServiceResponse<GetNormalNpcSuccessResponse>> GetNormalNpc(string id)
        {
            return await HttpService.Get<GetNormalNpcSuccessResponse>($"npcs/{id}");
        }
        
        public static async Task<HttpServiceResponse<GetAiNpcSuccessResponse>> GetAiNpc(string id)
        {
            return await HttpService.Get<GetAiNpcSuccessResponse>($"npcs/{id}");
        }
        
        public static async Task<HttpServiceResponse<AiSendMessageResponse>> AiSendMessage(AiSendMessageRequestBody body)
        {
            return await HttpService.Post<AiSendMessageResponse, AiSendMessageRequestBody>("npcs/ai/send-message",
                body);
        }

        public static async Task<HttpServiceResponse<NpcDialogue>> SelectNormalNpcDialogueOption(string optionId)
        {
            return await HttpService.Get<NpcDialogue>($"npcs/normal/select-option/{optionId}");
        }
    }
}
