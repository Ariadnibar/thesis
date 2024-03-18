using UnityEngine;
using UnityEngine.InputSystem;
using Unity.Netcode;
using Cinemachine;
using Interfaces;

namespace Entities.Player
{
    [RequireComponent(typeof(CharacterController), typeof(PlayerInput), typeof(Animator))]
    public class PlayerController : NetworkBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float movementSpeed = 10.0f;
        [SerializeField] private float sprintSpeed = 15.0f;
        [SerializeField] private float acceleration = 10.0f;
        [SerializeField] private float rotationSmoothTime = 0.12f;
        
        [Header("Jumping")]
        [SerializeField] private float jumpHeight = 1.2f;
        [SerializeField] private float jumpTimeout = 0.50f;
        [SerializeField] private float fallTimeout = 0.15f;
        [Space(10)]
        [SerializeField] private float groundedOffset = -0.14f;
        [SerializeField] private float groundedRadius = 0.28f;
        [SerializeField] private LayerMask groundLayers;
        [Space(10)]
        [SerializeField] private float gravity = -15.0f;
        [SerializeField] private float terminalVelocity = -53.0f;

        [Header("Animation")]
        [SerializeField] private string animationNameSpeed;
        [SerializeField] private string animationNameGrounded;
        [SerializeField] private string animationNameJump;
        [SerializeField] private string animationNameFreeFall;
        [SerializeField] private string animationNameMotionSpeed;
        
        [Header("Camera")]
        [SerializeField] private float topClamp = 70.0f;
        [SerializeField] private float bottomClamp = -30.0f;
        
        [Header("Audio")]
        [SerializeField] private AudioClip landingAudioClip;
        [SerializeField] private AudioClip[] footstepAudioClips;
        [SerializeField] [Range(0.0f, 1.0f)] private float footstepAudioVolume = 0.5f;

        [Header("References")]
        [SerializeField] private GameObject cameraTarget;
        [SerializeField] private CinemachineVirtualCamera virtualCamera;
        [SerializeField] private AudioListener audioListener;
        
        private float _speed;
        private float _targetRotation;
        private float _rotationVelocity;
        
        private bool _isGrounded;
        private float _verticalVelocity;
        private float _jumpTimeoutDelta;
        private float _fallTimeoutDelta;
        
        private int _animationIdSpeed;
        private int _animationIdGrounded;
        private int _animationIdJump;
        private int _animationIdFreeFall;
        private int _animationIdMotionSpeed;
        
        private float _cameraTargetYaw;
        private float _cameraTargetPitch;

        private readonly NetworkVariable<float> _animationBlend = new(0.0f, NetworkVariableReadPermission.Everyone,
            NetworkVariableWritePermission.Owner);
        
        private readonly NetworkVariable<float> _animationMotionSpeed = new(0.0f,
            NetworkVariableReadPermission.Everyone, NetworkVariableWritePermission.Owner);
        
        private CharacterController _controller;
        private PlayerInput _playerInput;
        private Animator _animator;
        
        private System.Action _onMessageSend;
        private System.Action _onLeaveChat;
        
        // Input
        private Vector2 _move = Vector2.zero;
        private Vector2 _look = Vector2.zero;
        private bool _jump;
        private bool _sprint;
        private bool _interact;
        private bool _interactLeft;
        private bool _interactRight;
        
        // Interactions
        public IInteractive Interactive { get; set; }
        public IInteractiveLeftRight InteractiveLeftRight { get; set; }
        
        // === Unity Events ===
        
        private void Start()
        {
            _controller = GetComponent<CharacterController>();
            _playerInput = GetComponent<PlayerInput>();
            _animator = GetComponent<Animator>();
            
            _jumpTimeoutDelta = jumpTimeout;
            _fallTimeoutDelta = fallTimeout;

            _cameraTargetYaw = cameraTarget.transform.rotation.eulerAngles.y;
            
            _animationIdSpeed = Animator.StringToHash(animationNameSpeed);
            _animationIdGrounded = Animator.StringToHash(animationNameGrounded);
            _animationIdJump = Animator.StringToHash(animationNameJump);
            _animationIdFreeFall = Animator.StringToHash(animationNameFreeFall);
            _animationIdMotionSpeed = Animator.StringToHash(animationNameMotionSpeed);
        }

        private void Update()
        {
            Jump();
            Gravity();
            CheckGrounded();
            Move();
            
            Interact();
            InteractLeft();
            InteractRight();
        }

        private void LateUpdate()
        {
            RotateCamera();
        }
        
        // === NetworkBehaviour Events ===
        
        public override void OnNetworkSpawn()
        {
            if (!IsOwner)
            {
                virtualCamera.Priority = 0;

                return;
            }
            
            audioListener.enabled = true;
            
            virtualCamera.Priority = 1;
        }
        
        // === API ===

        public void ToggleChatControls(bool enable, System.Action onMessageSend, System.Action onLeaveChat)
        {
            if (!IsOwner) return;
            
            _onMessageSend = onMessageSend;
            _onLeaveChat = onLeaveChat;
            
            _playerInput.SwitchCurrentActionMap(enable ? "Chat" : "Player");
        }
        
        // === Helpers ===

        private void Jump()
        {
            if (_isGrounded)
            {
                _fallTimeoutDelta = fallTimeout;
                
                _animator.SetBool(_animationIdJump, false);
                _animator.SetBool(_animationIdFreeFall, false);
                
                // Jump
                if (_jump && _jumpTimeoutDelta <= 0.0f)
                {
                    _verticalVelocity = Mathf.Sqrt(jumpHeight * -2.0f * gravity);
                    
                    _animator.SetBool(_animationIdJump, true);
                }

                if (_jumpTimeoutDelta >= 0.0f)
                    _jumpTimeoutDelta -= Time.deltaTime;

                return;
            }
            
            _jumpTimeoutDelta = jumpTimeout;
            
            if (_fallTimeoutDelta >= 0.0f)
                _fallTimeoutDelta -= Time.deltaTime;
            else
                _animator.SetBool(_animationIdFreeFall, true);
            
            _jump = false;
        }

        private void Gravity()
        {
            // Cap vertical velocity if grounded
            if (_isGrounded &&_verticalVelocity < 0.0f)
            {
                _verticalVelocity = -2.0f;
                
                return;
            }
            
            if (_verticalVelocity <= terminalVelocity)
                return;
            
            _verticalVelocity += gravity * Time.deltaTime;
        }

        private void CheckGrounded()
        {
            var transformPos = transform.position;
            
            var spherePosition = new Vector3(transformPos.x, transformPos.y - groundedOffset, transformPos.z);
            
            _isGrounded = Physics.CheckSphere(spherePosition, groundedRadius, groundLayers,
                QueryTriggerInteraction.Ignore);
            
            _animator.SetBool(_animationIdGrounded, _isGrounded);
        }

        private void Move()
        {
            var targetSpeed = _move == Vector2.zero ? 0.0f : _sprint ? sprintSpeed : movementSpeed;
            
            var controllerVelocity = _controller.velocity;
            var currentHorizontalSpeed = new Vector3(controllerVelocity.x, 0.0f, controllerVelocity.z).magnitude;
            
            const float speedOffset = 0.1f;

            if (currentHorizontalSpeed < targetSpeed - speedOffset ||
                currentHorizontalSpeed > targetSpeed + speedOffset)
            {
                var lerp = Mathf.Lerp(currentHorizontalSpeed, targetSpeed * _move.magnitude,
                    Time.deltaTime * acceleration);

                // Round to 3 decimal places
                _speed = Mathf.Round(lerp * 1000.0f) / 1000.0f;
            }
            else
            {
                _speed = targetSpeed;
            }

            if (IsOwner)
            {
                _animationBlend.Value = Mathf.Lerp(_animationBlend.Value, targetSpeed, Time.deltaTime * acceleration);
                if (_animationBlend.Value < 0.01f) _animationBlend.Value = 0f;
            }

            if (_move != Vector2.zero)
            {
                _targetRotation = Mathf.Atan2(_move.x, _move.y) * Mathf.Rad2Deg + cameraTarget.transform.eulerAngles.y;

                var rotation = Mathf.SmoothDampAngle(transform.eulerAngles.y, _targetRotation, ref _rotationVelocity,
                    rotationSmoothTime);
                
                transform.rotation = Quaternion.Euler(0.0f, rotation, 0.0f);
            }

            var moveDirection =
                (Quaternion.Euler(0.0f, _targetRotation, 0.0f) * Vector3.forward).normalized *
                (_speed * Time.deltaTime) + new Vector3(0.0f, _verticalVelocity, 0.0f) * Time.deltaTime;
            
            _controller.Move(moveDirection);
 
            if (IsOwner)
                _animationMotionSpeed.Value = _move.magnitude;
            
            _animator.SetFloat(_animationIdSpeed, _animationBlend.Value);
            _animator.SetFloat(_animationIdMotionSpeed, _animationMotionSpeed.Value);
        }

        private void Interact()
        {
            if (!IsOwner || !_interact) return;
            
            Interactive?.Interact();
            
            _interact = false;
        }

        private void InteractLeft()
        {
            if (!IsOwner || !_interactLeft) return;
            
            InteractiveLeftRight?.InteractLeft();
            
            _interactLeft = false;
        }
        
        private void InteractRight()
        {
            if (!IsOwner || !_interactRight) return;
            
            InteractiveLeftRight?.InteractRight();
            
            _interactRight = false;
        }

        private void RotateCamera()
        {
            if (_look.sqrMagnitude >= 0.01f)
            {
                _cameraTargetYaw += _look.x;
                _cameraTargetPitch += _look.y;
            }
            
            ClampAngle(ref _cameraTargetYaw, float.MinValue, float.MaxValue);
            ClampAngle(ref _cameraTargetPitch, bottomClamp, topClamp);

            cameraTarget.transform.rotation = Quaternion.Euler(_cameraTargetPitch, _cameraTargetYaw, 0.0f);
        }
        
        private static void ClampAngle(ref float angle, float min, float max)
        {
            if (angle < -360.0f)
                angle += 360.0f;

            if (angle > 360.0f)
                angle -= 360.0f;

            angle = Mathf.Clamp(angle, min, max);
        }
        
        // === Player Input Callbacks ===
        
        private void OnMove(InputValue value)
        {
            if (!IsOwner) return;
            
            _move = value.Get<Vector2>();
        }
        
        private void OnLook(InputValue value)
        {
            if (!IsOwner) return;
            
            _look = value.Get<Vector2>();
        }
        
        private void OnJump(InputValue value)
        {
            if (!IsOwner) return;

            _jump = value.isPressed;
        }
        
        private void OnSprint(InputValue value)
        {
            if (!IsOwner || _move == Vector2.zero) return;
            
            _sprint = value.isPressed;
        }
        
        private void OnInteract(InputValue value)
        {
            if (!IsOwner) return;
            
            _interact = value.isPressed;
        }
        
        private void OnInteractLeft(InputValue value)
        {
            if (!IsOwner) return;
            
            _interactLeft = value.isPressed;
        }
        
        private void OnInteractRight(InputValue value)
        {
            if (!IsOwner) return;
            
            _interactRight = value.isPressed;
        }
        
        private void OnSendMessage(InputValue value)
        {
            if (!IsOwner) return;
            
            _onMessageSend?.Invoke();
        }
        
        private void OnLeaveChat(InputValue value)
        {
            if (!IsOwner) return;
            
            _onLeaveChat?.Invoke();
            
            _playerInput.SwitchCurrentActionMap("Player");
            
            _onMessageSend = null;
            _onLeaveChat = null;
        }
        
        // === Animation Callbacks ===
        
        private void OnFootstep(AnimationEvent animationEvent)
        {
            if (!IsOwner || animationEvent.animatorClipInfo.weight <= 0.5f || footstepAudioClips.Length <= 0) return;
            
            var index = Random.Range(0, footstepAudioClips.Length);
            AudioSource.PlayClipAtPoint(footstepAudioClips[index], transform.TransformPoint(_controller.center),
                footstepAudioVolume);
        }

        private void OnLand(AnimationEvent animationEvent)
        {
            if (!IsOwner || animationEvent.animatorClipInfo.weight <= 0.5f) return;

            AudioSource.PlayClipAtPoint(landingAudioClip, transform.TransformPoint(_controller.center),
                footstepAudioVolume);
        }
    }
}
