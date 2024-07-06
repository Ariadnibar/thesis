using System.Threading.Tasks;

namespace Web
{
    public struct SignInRequestBody
    {
        public string username { get; set; }
        public string password { get; set; }
    }
    
    public struct SignUpRequestBody
    {
        public string username { get; set; }
        public string password { get; set; }
        public string confirmPassword { get; set; }
    }
    
    public struct AuthSuccessResponse
    {
        public string access_token { get; set; }
    }
    
    public static class AuthService
    {
        public static async Task<HttpServiceResponse<AuthSuccessResponse>> SignIn(SignInRequestBody body)
        {
            var response = await HttpService.Post<AuthSuccessResponse, SignInRequestBody>("auth/sign-in", body, false);

            if (response.Success) HttpService.BearerToken = response.Data.access_token;
            
            return response;
        }
        
        public static async Task<HttpServiceResponse<AuthSuccessResponse>> SignUp(SignUpRequestBody body)
        {
            var response = await HttpService.Post<AuthSuccessResponse, SignUpRequestBody>("auth/sign-up", body, false);
            
            if (response.Success) HttpService.BearerToken = response.Data.access_token;
            
            return response;
        }
    }
}
