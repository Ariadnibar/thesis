using UnityEngine;

namespace Gameplay.Quiz
{
    [RequireComponent(typeof(Collider))]
    public class QuizButtonController : MonoBehaviour, Interfaces.IInteractive
    {
        [Header("Visuals")]
        [SerializeField] private GameObject buttonNormal;
        [SerializeField] private GameObject buttonSelected;
        
        private System.Action<bool> _onInteract;
        
        private int _answerIndex;
        private bool _isCorrect;
        private bool _isDisabled;
        
        public void Initialize(bool isCorrect, System.Action<bool> onInteract)
        {
            _isCorrect = isCorrect;
            _onInteract = onInteract;
        }

        public void Interact()
        {
            if (_isDisabled) return;
            
            _onInteract?.Invoke(_isCorrect);
        }
        
        public void SetButtonInteractable(bool interactable)
        {
            _isDisabled = !interactable;
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player") || _isDisabled) return;
            
            other.GetComponent<Entities.Player.PlayerController>().Interactive = this;
            
            buttonNormal.SetActive(false);
            buttonSelected.SetActive(true);
        }
        
        private void OnTriggerExit(Collider other)
        {
            if (!other.CompareTag("Player") || _isDisabled) return;
            
            other.GetComponent<Entities.Player.PlayerController>().Interactive = null;
            
            buttonNormal.SetActive(true);
            buttonSelected.SetActive(false);
        }
    }
}
