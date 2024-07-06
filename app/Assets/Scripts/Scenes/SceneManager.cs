using Unity.Netcode;
using UnityEngine.SceneManagement;

namespace Scenes
{
    public static class SceneManager
    {
        public static void LoadSceneNetwork(string sceneName)
        {
            NetworkManager.Singleton.SceneManager.LoadScene(sceneName, LoadSceneMode.Single);
        }
    }
}
