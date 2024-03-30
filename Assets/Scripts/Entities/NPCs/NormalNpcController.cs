using System.Net;
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
        }
    }
}
