namespace Durak.Client
{
    partial class Window
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            Navigation = new SplitContainer();
            Logger = new RichTextBox();
            LoggerHint = new Label();
            IPAndPort = new TextBox();
            IPAndPortHint = new Label();
            ConnectToServer = new Button();
            ((System.ComponentModel.ISupportInitialize)Navigation).BeginInit();
            Navigation.Panel1.SuspendLayout();
            Navigation.SuspendLayout();
            SuspendLayout();
            // 
            // Navigation
            // 
            Navigation.Dock = DockStyle.Fill;
            Navigation.FixedPanel = FixedPanel.Panel1;
            Navigation.IsSplitterFixed = true;
            Navigation.Location = new Point(0, 0);
            Navigation.Name = "Navigation";
            // 
            // Navigation.Panel1
            // 
            Navigation.Panel1.BackColor = SystemColors.Control;
            Navigation.Panel1.Controls.Add(Logger);
            Navigation.Panel1.Controls.Add(LoggerHint);
            Navigation.Panel1.Controls.Add(IPAndPort);
            Navigation.Panel1.Controls.Add(IPAndPortHint);
            Navigation.Panel1.Controls.Add(ConnectToServer);
            Navigation.Size = new Size(800, 390);
            Navigation.SplitterDistance = 150;
            Navigation.SplitterWidth = 1;
            Navigation.TabIndex = 0;
            // 
            // Logger
            // 
            Logger.Dock = DockStyle.Fill;
            Logger.Location = new Point(0, 53);
            Logger.Name = "Logger";
            Logger.ReadOnly = true;
            Logger.Size = new Size(150, 311);
            Logger.TabIndex = 5;
            Logger.Text = "";
            // 
            // LoggerHint
            // 
            LoggerHint.AutoSize = true;
            LoggerHint.Dock = DockStyle.Top;
            LoggerHint.Location = new Point(0, 38);
            LoggerHint.Name = "LoggerHint";
            LoggerHint.Size = new Size(47, 15);
            LoggerHint.TabIndex = 4;
            LoggerHint.Text = "Logger:";
            LoggerHint.TextAlign = ContentAlignment.BottomLeft;
            // 
            // IPAndPort
            // 
            IPAndPort.Dock = DockStyle.Top;
            IPAndPort.Location = new Point(0, 15);
            IPAndPort.Name = "IPAndPort";
            IPAndPort.Size = new Size(150, 23);
            IPAndPort.TabIndex = 2;
            // 
            // IPAndPortHint
            // 
            IPAndPortHint.AutoSize = true;
            IPAndPortHint.Dock = DockStyle.Top;
            IPAndPortHint.Location = new Point(0, 0);
            IPAndPortHint.Name = "IPAndPortHint";
            IPAndPortHint.Size = new Size(68, 15);
            IPAndPortHint.TabIndex = 1;
            IPAndPortHint.Text = "IP and Port:";
            // 
            // ConnectToServer
            // 
            ConnectToServer.Dock = DockStyle.Bottom;
            ConnectToServer.Location = new Point(0, 364);
            ConnectToServer.Name = "ConnectToServer";
            ConnectToServer.Size = new Size(150, 26);
            ConnectToServer.TabIndex = 0;
            ConnectToServer.Text = "Connect";
            ConnectToServer.UseVisualStyleBackColor = true;
            ConnectToServer.Click += ConnectToServer_Click;
            // 
            // Window
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(800, 390);
            Controls.Add(Navigation);
            Name = "Window";
            Text = "Durak Client";
            Navigation.Panel1.ResumeLayout(false);
            Navigation.Panel1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)Navigation).EndInit();
            Navigation.ResumeLayout(false);
            ResumeLayout(false);
        }

        #endregion

        private SplitContainer Navigation;
        private Label IPAndPortHint;
        private Button ConnectToServer;
        private TextBox IPAndPort;
        private RichTextBox Logger;
        private Label LoggerHint;
    }
}
