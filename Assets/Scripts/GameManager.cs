using Unity.Netcode;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour
{
    [Header("Multiplayer")]
    [SerializeField] private GameObject[] playerPrefabs;

    public static GameManager Singleton { get; private set; }
    
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

    // Called per joined client
    private void OnSceneLoaded(ulong clientId, string sceneName, LoadSceneMode loadSceneMode)
    {
        Debug.Log($"Client {clientId} loaded scene {sceneName}");
        
        if (!NetworkManager.Singleton.IsServer) return;
        
        var playerPrefab = playerPrefabs[NetworkManager.Singleton.ConnectedClients.Count - 1];
        
        var player = Instantiate(playerPrefab).GetComponent<NetworkObject>();
        player.SpawnAsPlayerObject(clientId, true);
    }
}
