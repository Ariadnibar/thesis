using UnityEngine;

namespace Gameplay.Info
{
    [RequireComponent(typeof(Collider))]
    public class InfoTrigger : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private bool showOnce;
        [SerializeField] [TextArea(3, 20)] private string infoText;

        private bool _shown;

        private void OnTriggerExit(Collider other)
        {
            if (!other.CompareTag("Player") || (_shown && showOnce)) return;
            
            InfoManager.Singleton.ShowInfo(infoText);
            
            _shown = true;
        }
    }
}
