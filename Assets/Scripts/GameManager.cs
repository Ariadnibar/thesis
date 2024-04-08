using Unity.Netcode;
using UnityEngine;
using UnityEngine.SceneManagement;
using Web;

public class GameManager : MonoBehaviour
{
    [Header("Multiplayer")]
    [SerializeField] private GameObject[] playerPrefabs;
    
    [Header("References")]
    [SerializeField] private TMPro.TMP_Text highScoreText;
    [SerializeField] private TMPro.TMP_Text scoreText;

    public static GameManager Singleton { get; private set; }
    
    private int _score;
    
    private void OnEnable()
    {
        if (Singleton != null)
        {
            Destroy(this);
            return;
        }
        
        Singleton = this;
        DontDestroyOnLoad(gameObject);
        
        NetworkManager.Singleton.SceneManager.OnLoadComplete += OnSceneLoaded;
    }

    private void Awake()
    {
        GetHighScore();
    }
    
    public void AddScore(int score)
    {
        _score += score;
        scoreText.text = $"Current score:\n  {_score} points";
    }

    // Called per joined client
    private void OnSceneLoaded(ulong clientId, string sceneName, LoadSceneMode loadSceneMode)
    {
        Debug.Log($"Client {clientId} loaded scene {sceneName}");
        
        if (!NetworkManager.Singleton.IsServer) return;
        
        var playerPrefab = playerPrefabs[NetworkManager.Singleton.ConnectedClients.Count - 1];
        
        var player = Instantiate(playerPrefab).GetComponent<NetworkObject>();
        player.SpawnAsPlayerObject(clientId, true);
    }

    private async void GetHighScore()
    {
        var res = await QuizzesService.GetHighScores(1);

        if (!res.Success)
        {
            Debug.LogError(res.Error);
            
            return;
        }

        if (res.Data.Length > 0)
            highScoreText.text = $"High Score:\n  {res.Data[0].username}\n  {res.Data[0].session_points} points";
    }
}
