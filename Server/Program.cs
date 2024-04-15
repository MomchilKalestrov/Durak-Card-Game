using System.Threading.Tasks;
using Durak.Server;

namespace Durak;

class Program
{
    internal static void Main(string[] args)
    {
        Server.Server server = new Server.Server();
        Task.Run(server.StartServer);
        server.StartGame();
    }
}