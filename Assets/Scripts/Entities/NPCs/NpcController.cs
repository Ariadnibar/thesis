using Entities.Player;
using UnityEngine;
using UnityEngine.UI;
using Web;

namespace Entities.NPCs
{
    [RequireComponent(typeof(Collider))]
    public class NpcController : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private string npcId;
        [SerializeField] [TextArea(3, 10)] private string prompt =
            "Act as a random stranger in a chat room and reply to the questions. Don't break character. Don't ever mention that you are an AI model.";
        
        [Header("References")]
        [SerializeField] private GameObject chatPanel;
        [SerializeField] private ScrollRect scroll;
        [SerializeField] private RectTransform messageSentPrefab;
        [SerializeField] private RectTransform messageReceivedPrefab;
        [SerializeField] private TMPro.TMP_InputField messageInput;
        
        private bool _firstMessage = true;
        private float _height;

        private void Awake()
        {
            if (!string.IsNullOrEmpty(npcId)) return;
            
            Debug.LogError("NPC ID is not set for " + name);
            
            Destroy(gameObject);
        }

        private async void OnMessageSend()
        {
            var message = messageInput.text;
            
            messageInput.text = "";
            AppendMessage(message, true);
            
            SendMessageRequestBody body;

            if (_firstMessage)
            {
                body = new SendMessageRequestBody
                {
                    npcId = npcId,
                    context = prompt,
                    content = message
                };
            }
            else
            {
                body = new SendMessageRequestBody
                {
                    npcId = npcId,
                    content = message
                };
            }

            var res = await OpenAIService.SendMessage(body);

            if (!res.Success)
            {
                Debug.LogError(res.Message);
                
                AppendMessage("An error occurred while sending the message", false);
                
                return;
            }
            
            if (_firstMessage) _firstMessage = false;
            
            AppendMessage(res.Data.message, false);
        }
        
        private void OnLeaveChat()
        {
            chatPanel.SetActive(false);
            
            var body = new WriteNpcLogRequestBody { npcId = npcId };
            LoggingService.WriteNpcEndInteractionLog(body);
        }
        
        private void AppendMessage(string message, bool userMessage)
        {
            scroll.content.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, 0);

            var item = Instantiate(userMessage ? messageSentPrefab : messageReceivedPrefab, scroll.content);
            item.GetChild(0).GetChild(0).GetComponent<TMPro.TMP_Text>().text = message;
            item.anchoredPosition = new Vector2(0, -_height);
            LayoutRebuilder.ForceRebuildLayoutImmediate(item);
            _height += item.sizeDelta.y;
            scroll.content.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, _height);
            scroll.verticalNormalizedPosition = 0;
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<PlayerController>();
            if (!playerController || !playerController.IsOwner) return;
            
            chatPanel.SetActive(true);
            
            // Disable the player's movement
            playerController.ToggleChatControls(true, OnMessageSend, OnLeaveChat);
            
            // Focus the input field
            messageInput.Select();
            
            // Write the log
            var body = new WriteNpcLogRequestBody { npcId = npcId };
            LoggingService.WriteNpcStartInteractionLog(body);
        }
    }
}
