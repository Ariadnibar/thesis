using System.Threading.Tasks;

namespace Web
{
    public static class UsersService
    {
        public struct GetProfileSuccessResponse
        {
            public string id { get; set; }
            public string username { get; set; }
            public bool isActive { get; set; }
            public string createdAt { get; set; }
            public string updatedAt { get; set; }
        }
        
        public static async Task<HttpServiceResponse<GetProfileSuccessResponse>> GetProfile()
        {
            var response = await HttpService.Get<GetProfileSuccessResponse>("users/profile");

            return response;
        }
    }
}
