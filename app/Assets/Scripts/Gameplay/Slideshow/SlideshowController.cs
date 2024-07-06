using UnityEngine;
using UnityEngine.UI;
using Cinemachine;
using Web;

namespace Gameplay.Slideshow
{
    public class SlideshowController : MonoBehaviour, Interfaces.IInteractiveLeftRight
    {
        [Header("Configuration")]
        [SerializeField] private string slideshowId;
        [Space(10)]
        [SerializeField] private Image image;
        [SerializeField] private CinemachineVirtualCamera virtualCamera;
        [Space(10)]
        [SerializeField] private Sprite[] images;

        private int _currentImageIndex;
        
        private void Awake()
        {
            if (string.IsNullOrEmpty(slideshowId))
            {
                Debug.LogError("Slideshow ID is not set for " + name);
                Destroy(gameObject);
                
                return;
            }

            image.sprite = images[_currentImageIndex];
        }
        
        public void InteractLeft()
        {
            if (_currentImageIndex == 0) return;
            
            _currentImageIndex--;
            
            image.sprite = images[_currentImageIndex];
            
            LogSlideSeen();
        }
        
        public void InteractRight()
        {
            if (_currentImageIndex == images.Length - 1) return;
            
            _currentImageIndex++;
            
            image.sprite = images[_currentImageIndex];

            LogSlideSeen();
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<Entities.Player.PlayerController>();
            if (!playerController || !playerController.IsLocalPlayer) return;
            
            playerController.InteractiveLeftRight = this;
            
            virtualCamera.gameObject.SetActive(true);
            
            // Log to database
            var body = new WriteSlideshowSeenSlideLogRequestBody
            {
                slideshowId = slideshowId,
                slideNumber = _currentImageIndex
            };
            LoggingService.WriteSlideshowStartLog(body);
        }
        
        private void OnTriggerExit(Collider other)
        {
            if (!other.CompareTag("Player")) return;
            
            var playerController = other.GetComponent<Entities.Player.PlayerController>();
            if (!playerController || !playerController.IsLocalPlayer) return;
            
            playerController.InteractiveLeftRight = null;
            
            virtualCamera.gameObject.SetActive(false);
            
            // Log to database
            var body = new WriteSlideshowLogRequestBody { slideshowId = slideshowId };
            LoggingService.WriteSlideshowEndLog(body);
        }

        private void LogSlideSeen()
        {
            var body = new WriteSlideshowSeenSlideLogRequestBody
            {
                slideshowId = slideshowId,
                slideNumber = _currentImageIndex
            };
            LoggingService.WriteSlideshowSlideSeenLog(body);
        }
    }
}
