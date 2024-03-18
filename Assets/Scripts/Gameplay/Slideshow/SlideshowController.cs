using UnityEngine;
using UnityEngine.UI;
using Cinemachine;

namespace Gameplay.Slideshow
{
    public class SlideshowController : MonoBehaviour, Interfaces.IInteractiveLeftRight
    {
        [Header("Configuration")]
        [SerializeField] private Image image;
        [SerializeField] private CinemachineVirtualCamera virtualCamera;
        [Space(10)]
        [SerializeField] private Sprite[] images;

        private int _currentImageIndex;
        
        private void Awake()
        {
            image.sprite = images[_currentImageIndex];
        }
        
        public void InteractLeft()
        {
            if (_currentImageIndex == 0) return;
            
            _currentImageIndex--;
            
            image.sprite = images[_currentImageIndex];
        }
        
        public void InteractRight()
        {
            if (_currentImageIndex == images.Length - 1) return;
            
            _currentImageIndex++;
            
            image.sprite = images[_currentImageIndex];
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<Entities.Player.PlayerController>();
            if (!playerController || !playerController.IsLocalPlayer) return;
            
            playerController.InteractiveLeftRight = this;
            
            virtualCamera.gameObject.SetActive(true);
        }
        
        private void OnTriggerExit(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<Entities.Player.PlayerController>();
            if (!playerController || !playerController.IsLocalPlayer) return;
            
            playerController.InteractiveLeftRight = null;
            
            virtualCamera.gameObject.SetActive(false);
        }
    }
}
