using Unity.Netcode;
using UnityEngine;
using UnityEngine.SceneManagement;
using Web;

public class GameManager : MonoBehaviour
{
    [Header("Multiplayer")]
    [SerializeField] private GameObject[] playerPrefabs;
    
    [Header("References")]
    [SerializeField] private TMPro.TMP_Text scoreText;

    public static GameManager Singleton { get; private set; }
    
    private string _highScoreUsername;
    private int _highScore;
    
    private int _score;
    private int _maxScore;
    
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
    
    public void AddScore(int points, int maxPoints)
    {
        _score += points;
        _maxScore += maxPoints;
        
        SetScore();
    }

    // Called per joined client
    private void OnSceneLoaded(ulong clientId, string sceneName, LoadSceneMode loadSceneMode)
    {
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
        
        if (res.Data.Length <= 0) return;
        
        _highScoreUsername = res.Data[0].username;
        _highScore = res.Data[0].session_points;
        
        SetScore();
    }

    private void SetScore()
    {
        var scoreString = "";

        scoreString += "<i>High Score</i>\n";
        scoreString += $"<b>{_highScoreUsername}\n{_highScore} pts</b>";

        scoreString += "\n\n";
        scoreString += "<i>Current Score</i>\n";
        scoreString += $"<b>{_score}/{_maxScore} pts</b>";
        
        scoreText.text = scoreString;
    }
}
