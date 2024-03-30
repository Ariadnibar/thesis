using System.Net;
using Entities.Player;
using UnityEngine;
using UnityEngine.UI;
using Web;

namespace Entities.NPCs
{
    [RequireComponent(typeof(Collider))]
    public class AiNpcController : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private string npcId;
        
        [Header("References")]
        [SerializeField] private GameObject chatPanel;
        [SerializeField] private ScrollRect scroll;
        [SerializeField] private RectTransform messageSentPrefab;
        [SerializeField] private RectTransform messageReceivedPrefab;
        [SerializeField] private TMPro.TMP_InputField messageInput;
        
        private float _height;
        private bool _isValid;

        private void Awake()
        {
            if (!string.IsNullOrEmpty(npcId)) return;
            Debug.LogError("NPC ID is not set for " + name);
            Destroy(gameObject);
        }

        private async void Start()
        {
            var res = await NpcsService.GetAiNpc(npcId);
            
            _isValid = res.Success;

            if (!res.Success)
                Debug.LogError(res.StatusCode switch
                {
                    HttpStatusCode.NotFound => "NPC not found",
                    _ => res.Message
                });
        }

        private async void OnMessageSend()
        {
            if (!_isValid) return;
            
            var message = messageInput.text;
            
            messageInput.text = "";
            AppendMessage(message, true);

            var body = new AiSendMessageRequestBody
            {
                npcId = npcId,
                content = message
            };

            var res = await NpcsService.AiSendMessage(body);

            if (!res.Success)
            {
                Debug.LogError(res.Message);
                
                AppendMessage("An error occurred while sending the message", false);
                
                return;
            }
            
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
            if (!_isValid || !other.CompareTag("Player")) return;
            
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
