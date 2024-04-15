using System.Net.Sockets;
using System.Text;

namespace Durak.Client
{
    public partial class Window : Form
    {

        public Window()
        {
            InitializeComponent();
        }

        private void ConnectToServer_Click(object sender, EventArgs e)
        {
            Task.Run(ConnectToServerHandler);
            ConnectToServer.Enabled = false;
        }
    }
}
