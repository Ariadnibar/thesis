namespace Web
{
    public struct WriteNpcLogRequestBody
    {
        public string npcId { get; set; }
    }
    
    public static class LoggingService
    {
        public static async void WriteNpcStartInteractionLog(WriteNpcLogRequestBody body)
        {
            await HttpService.Post<object, WriteNpcLogRequestBody>("logs/write/npc-start-interaction", body);
        }
        
        public static async void WriteNpcEndInteractionLog(WriteNpcLogRequestBody body)
        {
            await HttpService.Post<object, WriteNpcLogRequestBody>("logs/write/npc-end-interaction", body);
        }
    }
}
