using UnityEngine;
using System.Net;
using Web;

namespace UI
{
    public class SignUpPage : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private TMPro.TMP_InputField usernameInputField;
        [SerializeField] private TMPro.TMP_InputField passwordInputField;
        [SerializeField] private TMPro.TMP_InputField confirmPasswordInputField;
        [SerializeField] private TMPro.TMP_Text feedbackText;
        
        [Header("References")]
        [SerializeField] private GameObject signUpPage;
        [SerializeField] private GameObject multiplayerPage;

        public async void SignUp()
        {
            feedbackText.text = "";

            if (string.IsNullOrEmpty(usernameInputField.text) ||
                string.IsNullOrEmpty(passwordInputField.text) ||
                string.IsNullOrEmpty(confirmPasswordInputField.text))
            {
                feedbackText.text = "Please fill in all fields";
                return;
            }
            
            if (passwordInputField.text != confirmPasswordInputField.text)
            {
                feedbackText.text = "Passwords do not match";
                return;
            }

            SignUpRequestBody body = new()
            {
                username = usernameInputField.text,
                password = passwordInputField.text,
                confirmPassword = confirmPasswordInputField.text
            };

            var res = await AuthService.SignUp(body);

            if (res.Success)
            {
                signUpPage.SetActive(false);
                multiplayerPage.SetActive(true);
                
                ClearData();
                
                return;
            }
            
            feedbackText.text = res.StatusCode switch
            {
                HttpStatusCode.BadRequest => "Invalid input",
                HttpStatusCode.Conflict => "Username already exists",
                _ => res.Message
            };
        }
        
        private void ClearData()
        {
            usernameInputField.text = "";
            passwordInputField.text = "";
            confirmPasswordInputField.text = "";
            feedbackText.text = "";
        }
    }
}
