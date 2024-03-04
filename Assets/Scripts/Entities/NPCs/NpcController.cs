using Entities.Player;
using UnityEngine;

namespace Entities.NPCs
{
    [RequireComponent(typeof(Collider))]
    public class NpcController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private GameObject chatPanel;
        [SerializeField] private TMPro.TMP_InputField messageInput;

        private void Awake()
        {
            messageInput.onFocusSelectAll = true;
        }
        
        private void OnMessageSend()
        {
            Debug.Log("Message sent: " + messageInput.text);
            
            messageInput.text = "";
        }
        
        private void OnLeaveChat()
        {
            chatPanel.SetActive(false);
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            
            chatPanel.SetActive(true);
            
            // Disable the player's movement
            other.GetComponent<PlayerController>().ToggleChatControls(true, OnMessageSend, OnLeaveChat);
            
            // Focus the input field
            messageInput.Select();
        }
    }
}
