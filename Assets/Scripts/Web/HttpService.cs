using System.Net;
using System.Threading.Tasks;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json;

namespace Web
{
    public struct HttpServiceResponse<T>
    {
        public bool Success { get; set; }
        public HttpStatusCode StatusCode { get; set; }
        public HttpRequestException Error { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
    }
    
    public static class HttpService
    {
        private const string BaseUrl = "http://localhost:3000";
        
        private static readonly HttpClient Client = new();
        
        public static string BearerToken { private get; set; }

        public static async Task<HttpServiceResponse<T>> Get<T>(string uri, bool useAuth = true)
        {
            if (useAuth)
                Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", BearerToken);
                
            var response = await Client.GetAsync($"{BaseUrl}/{uri}");
            
            try
            {
                response.EnsureSuccessStatusCode();
            } 
            catch (HttpRequestException exception)
            {
                return CreateErrorResponse<T>(response, exception);
            }
            
            Client.DefaultRequestHeaders.Authorization = null;
            
            return await CreateSuccessResponse<T>(response);
        }
        
        public static async Task<HttpServiceResponse<T>> Post<T, TV>(string uri, TV data, bool useAuth = true)
        {
            string json;

            try
            {
                json = JsonConvert.SerializeObject(data);
            }
            catch (JsonException)
            {
                return new HttpServiceResponse<T>
                {
                    Success = false,
                    Message = "Unable to serialize request body"
                };
            }
            
            if (useAuth)
                Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", BearerToken);
                
            var body = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            
            var response = await Client.PostAsync($"{BaseUrl}/{uri}", body);
            
            try
            {
                response.EnsureSuccessStatusCode();
            } 
            catch (HttpRequestException exception)
            {
                return CreateErrorResponse<T>(response, exception);
            }
            
            Client.DefaultRequestHeaders.Authorization = null;

            return await CreateSuccessResponse<T>(response);
        }
        
        private static async Task<T> ExtractContent<T>(HttpContent httpContent)
        {
            if (httpContent == null) return default;
            
            var data = await httpContent.ReadAsStringAsync();
            
            return JsonConvert.DeserializeObject<T>(data);
        }
        
        private static async Task<HttpServiceResponse<T>> CreateSuccessResponse<T>(HttpResponseMessage response)
        {
            T data;

            try
            {
                data = await ExtractContent<T>(response.Content); 
            }
            catch (JsonException)
            {
                return new HttpServiceResponse<T>
                {
                    Success = false,
                    Message = "Unable to parse JSON response"
                };
            }
            
            return new HttpServiceResponse<T>
            {
                Success = true,
                StatusCode = response.StatusCode,
                Data = data
            };
        }
        
        private static HttpServiceResponse<T> CreateErrorResponse<T>(HttpResponseMessage response, HttpRequestException exception)
        {
            return new HttpServiceResponse<T>
            {
                Success = false,
                StatusCode = response.StatusCode,
                Error = exception,
                Message = response.StatusCode switch
                {
                    HttpStatusCode.BadRequest => "Bad Request",
                    HttpStatusCode.Unauthorized => "Unauthorized",
                    HttpStatusCode.Conflict => "Conflict",
                    _ => "Unknown error"
                }
            };
        }
    }
}
