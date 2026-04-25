
import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_FILE = path.join(__dirname, "credentials.json");

// Default credentials
const DEFAULT_CREDENTIALS = {
  username: "Admin",
  password: "Admin"
};

function getCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, "utf-8"));
    } catch (e) {
      return DEFAULT_CREDENTIALS;
    }
  }
  return DEFAULT_CREDENTIALS;
}

function saveCredentials(creds: any) {
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const currentCreds = getCredentials();

    if (username === currentCreds.username && password === currentCreds.password) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  });

  app.post("/api/auth/update", (req, res) => {
    const { newUsername, newPassword, currentUsername, currentPassword } = req.body;
    const currentCreds = getCredentials();

    // Verify current credentials before updating
    if (currentUsername === currentCreds.username && currentPassword === currentCreds.password) {
      saveCredentials({ username: newUsername, password: newPassword });
      res.json({ success: true, message: "Credenciales actualizadas correctamente" });
    } else {
      res.status(401).json({ success: false, message: "Credenciales actuales incorrectas" });
    }
  });

  app.get("/api/auth/check", (req, res) => {
    // This is just to check if the server is up and running
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
