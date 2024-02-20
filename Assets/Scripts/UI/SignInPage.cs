using UnityEngine;
using System.Net;
using Web;

namespace UI
{
    public class SignInPage : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private TMPro.TMP_InputField usernameInputField;
        [SerializeField] private TMPro.TMP_InputField passwordInputField;
        [SerializeField] private TMPro.TMP_Text feedbackText;
        
        [Header("References")]
        [SerializeField] private GameObject signInPage;
        [SerializeField] private GameObject multiplayerPage;

        public async void SignIn()
        {
            feedbackText.text = "";
            
            if (string.IsNullOrEmpty(usernameInputField.text) || string.IsNullOrEmpty(passwordInputField.text))
            {
                feedbackText.text = "Please fill in all fields";
                return;
            }
            
            SignInRequestBody body = new()
            {
                username = usernameInputField.text,
                password = passwordInputField.text
            };

            var res = await AuthService.SignIn(body);

            if (res.Success)
            {
                signInPage.SetActive(false);
                multiplayerPage.SetActive(true);
                
                ClearData();

                var profile = await UsersService.GetProfile();
                
                var stringifiedProfile = $"ID: {profile.Data.id}\n" +
                                        $"Username: {profile.Data.username}\n" +
                                        $"Active: {profile.Data.isActive}\n" +
                                        $"Created At: {profile.Data.createdAt}\n" +
                                        $"Updated At: {profile.Data.updatedAt}";
                
                Debug.Log(stringifiedProfile);
                
                return;
            }
            
            feedbackText.text = res.StatusCode switch
            {
                HttpStatusCode.Unauthorized => "Invalid credentials",
                _ => res.Message
            };
        }
        
        private void ClearData()
        {
            usernameInputField.text = "";
            passwordInputField.text = "";
            feedbackText.text = "";
        }
    }
}
