using Unity.Services.Relay;
using UnityEngine;
using Network;

namespace UI
{
    public class MultiplayerPage : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private TMPro.TMP_InputField codeInputField;
        [SerializeField] private TMPro.TMP_Text feedbackText;
        [Header("Scenes")]
        [SerializeField] private string sceneToLoad;

        public async void CreateHost()
        {
            feedbackText.text = "";
            
            try
            {
                await RelayManager.Singleton.CreateHost();
                
                Scenes.SceneManager.LoadSceneNetwork(sceneToLoad);
            }
            catch (RelayServiceException e)
            {
                feedbackText.text = e.Reason switch
                {
                    _ => "Something went wrong"
                };
            }
        }
        
        public async void JoinHost()
        {
            feedbackText.text = "";
            
            if (string.IsNullOrEmpty(codeInputField.text))
            {
                feedbackText.text = "Please enter a code";
                return;
            }

            try
            {
                await RelayManager.Singleton.JoinHost(codeInputField.text);
            }
            catch (RelayServiceException e)
            {
                feedbackText.text = e.Reason switch
                {
                    RelayExceptionReason.InvalidRequest => "Invalid code",
                    RelayExceptionReason.JoinCodeNotFound => "Code not found",
                    _ => "Something went wrong"
                };
            }
        }
    }
}
