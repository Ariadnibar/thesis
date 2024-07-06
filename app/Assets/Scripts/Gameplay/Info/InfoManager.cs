using UnityEngine;

namespace Gameplay.Info
{
    public class InfoManager : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TMPro.TMP_Text infoText;
        
        public static InfoManager Singleton { get; private set; }
        
        private void OnEnable()
        {
            if (Singleton != null)
            {
                Destroy(this);
                return;
            }
        
            Singleton = this;
            DontDestroyOnLoad(gameObject);
        }
        
        public void ShowInfo(string text)
        {
            infoText.text = text;
        }
    }
}
