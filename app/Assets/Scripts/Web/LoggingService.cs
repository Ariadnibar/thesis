namespace Web
{
    public struct WriteNpcLogRequestBody
    {
        public string npcId { get; set; }
    }
    
    public struct WriteSlideshowLogRequestBody
    {
        public string slideshowId { get; set; }
    }
    
    public struct WriteSlideshowSeenSlideLogRequestBody
    {
        public string slideshowId { get; set; }
        public int slideNumber { get; set; }
    }
    
    public struct WriteQuizLogRequestBody
    {
        public string quizId { get; set; }
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
        
        public static async void WriteSlideshowStartLog(WriteSlideshowSeenSlideLogRequestBody body)
        {
            await HttpService.Post<object, WriteSlideshowSeenSlideLogRequestBody>("logs/write/slideshow-start", body);
        }
        
        public static async void WriteSlideshowEndLog(WriteSlideshowLogRequestBody body)
        {
            await HttpService.Post<object, WriteSlideshowLogRequestBody>("logs/write/slideshow-end", body);
        }
        
        public static async void WriteSlideshowSlideSeenLog(WriteSlideshowSeenSlideLogRequestBody body)
        {
            await HttpService.Post<object, WriteSlideshowSeenSlideLogRequestBody>("logs/write/slideshow-seen-slide",
                body);
        }
        
        public static async void WriteQuizStartLog(WriteQuizLogRequestBody body)
        {
            await HttpService.Post<object, WriteQuizLogRequestBody>("logs/write/quiz-start", body);
        }
        
        public static async void WriteQuizEndLog(WriteQuizLogRequestBody body)
        {
            await HttpService.Post<object, WriteQuizLogRequestBody>("logs/write/quiz-end", body);
        }
    }
}
