using UnityEngine;
using Web;

namespace Gameplay.Quiz
{
    [RequireComponent(typeof(Collider))]
    public class QuizButtonController : MonoBehaviour, Interfaces.IInteractive
    {
        [Header("Visuals")]
        [SerializeField] private GameObject buttonNormal;
        [SerializeField] private GameObject buttonSelected;
        
        private System.Action<GetQuizSuccessResponseAnswer> _onInteract;
        
        private GetQuizSuccessResponseAnswer _answer;
        
        private bool _isDisabled;

        public void Initialize(GetQuizSuccessResponseAnswer answer,
            System.Action<GetQuizSuccessResponseAnswer> onInteract)
        {
            _answer = answer;
            _onInteract = onInteract;
        }

        public void Interact()
        {
            if (_isDisabled) return;
            
            _onInteract?.Invoke(_answer);
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
