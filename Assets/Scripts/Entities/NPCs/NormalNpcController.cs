using System.Net;
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
        
        [Header("References")]
        [SerializeField] private GameObject chatPanel;
        [SerializeField] private ScrollRect scroll;
        [SerializeField] private RectTransform messageSentPrefab;
        [SerializeField] private RectTransform messageReceivedPrefab;
        [SerializeField] private Button optionButtonPrefab;
        [SerializeField] private RectTransform optionsPanel;
        
        private float _height;
        private bool _isValid;
        private bool _isFirstDialogue = true;
        
        private NpcDialogue _currentDialogue;
        private PlayerController _currentPlayer;

        private void Awake()
        {
            if (!string.IsNullOrEmpty(npcId)) return;
            Debug.LogError("NPC ID is not set for " + name);
            Destroy(gameObject);
        }

        private async void Start()
        {
            var res = await NpcsService.GetNormalNpc(npcId);

            if (!res.Success)
            {
                _isValid = false;
                
                Debug.LogError(res.StatusCode switch
                {
                    HttpStatusCode.NotFound => "NPC not found",
                    _ => res.Message
                });

                return;
            }

            if (res.Data.type != "normal")
            {
                Debug.LogError("NPC is not a Normal NPC");
                
                _isValid = false;
            }
            
            _isValid = true;
            
            _currentDialogue = res.Data.dialogue;
        }

        private void LoadNpcDialogue()
        {
            if (!_isValid) return;
            
            AppendMessage(_currentDialogue.content, false);
            LoadOptions(_currentDialogue.options);
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
        
        private void LoadOptions(NpcDialogueOption[] options)
        {
            if (!_isValid) return;
            
            foreach (Transform child in optionsPanel)
                Destroy(child.gameObject);

            foreach (var option in options)
            {
                var button = Instantiate(optionButtonPrefab, optionsPanel);
                button.GetComponentInChildren<TMPro.TMP_Text>().text = option.content;
                button.onClick.AddListener(() => OnOptionSelected(option));
            }
        }

        private async void GetNextDialogue(NpcDialogueOption option)
        {
            if (!_isValid) return;

            var res = await NpcsService.SelectNormalNpcDialogueOption(option.id);
            
            if (!res.Success)
            {
                Debug.LogError(res.StatusCode switch
                {
                    HttpStatusCode.NotFound => "Dialogue not found",
                    _ => res.Message
                });

                return;
            }
            
            if (res.StatusCode == HttpStatusCode.NoContent)
            {
                _currentPlayer.ToggleChatControls(false, null, null);
                OnLeaveChat();
                return;
            }
            
            _currentDialogue = res.Data;
            
            LoadNpcDialogue();
        }
        
        private void OnOptionSelected(NpcDialogueOption option)
        {
            if (!_isValid) return;
            
            if (option.action != "close")
                AppendMessage(option.content, true);
            
            GetNextDialogue(option);
        }
        
        private void OnLeaveChat()
        {
            chatPanel.SetActive(false);
            
            var body = new WriteNpcLogRequestBody { npcId = npcId };
            LoggingService.WriteNpcEndInteractionLog(body);
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!_isValid || !other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<PlayerController>();
            if (!playerController || !playerController.IsOwner) return;
            
            _currentPlayer = playerController;
            
            chatPanel.SetActive(true);
            
            // Disable the player's movement
            playerController.ToggleChatControls(true, null, OnLeaveChat);
            
            if (_isFirstDialogue)
            {
                _isFirstDialogue = false;
                LoadNpcDialogue();
            }
            
            // Write the log
            var body = new WriteNpcLogRequestBody { npcId = npcId };
            LoggingService.WriteNpcStartInteractionLog(body);
        }
    }
}
