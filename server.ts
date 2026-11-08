import express from "express";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Health check endpoints FIRST
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ status: "ok" });
});

app.use(express.json());

// =========================================
// 1. GOOGLE AUTHENTICATION API
// =========================================
interface UserSession {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  picture: string;
  provider: 'google' | 'guest';
  createdAt: string;
}

const mockSessions = new Map<string, UserSession>();

// Endpoint to handle Google One-Tap / ID Token or Google Login
app.post("/api/auth/google", (req, res) => {
  const { credential, userInfo } = req.body;

  let user: UserSession;

  if (userInfo && userInfo.email) {
    user = {
      id: `google_${Date.now()}`,
      googleId: userInfo.sub || `g_${Math.floor(Math.random() * 1000000)}`,
      name: userInfo.name || "Google Cowboy",
      email: userInfo.email,
      picture: userInfo.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      provider: "google",
      createdAt: new Date().toISOString(),
    };
  } else if (credential) {
    user = {
      id: `google_${Date.now()}`,
      googleId: `g_token_${Math.floor(Math.random() * 1000000)}`,
      name: "Verified Google High Roller",
      email: "frontier.player@gmail.com",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      provider: "google",
      createdAt: new Date().toISOString(),
    };
  } else {
    return res.status(400).json({ error: "Invalid Google credentials provided" });
  }

  mockSessions.set(user.id, user);

  res.json({
    status: "success",
    message: "Authenticated successfully with Google",
    user,
    token: `token_${user.id}`,
  });
});

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ authenticated: false, user: null });
  }

  const userId = authHeader.replace("Bearer token_", "");
  const user = mockSessions.get(userId);

  if (!user) {
    return res.json({ authenticated: false, user: null });
  }

  res.json({ authenticated: true, user });
});

// =========================================
// 2. FIAT PAYMENTS API (Stripe / Credit Card / PayPal)
// =========================================
app.post("/api/payments/fiat-checkout", (req, res) => {
  const { amountUsd, chipsAmount, paymentMethod, cardDetails, buyerName } = req.body;

  if (!amountUsd || !chipsAmount) {
    return res.status(400).json({ error: "Missing purchase details" });
  }

  const txnId = `TXN-FIAT-${Math.floor(100000 + Math.random() * 900000)}`;
  const receipt = {
    txnId,
    timestamp: new Date().toISOString(),
    amountUsd,
    chipsAmount,
    paymentMethod: paymentMethod || "Credit Card (Visa/Mastercard)",
    last4: cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : "4242",
    buyerName: buyerName || "Saloon Patron",
    status: "COMPLETED",
  };

  res.json({
    status: "success",
    message: "Fiat Payment processed successfully!",
    receipt,
  });
});

// =========================================
// 3. CRYPTO PAYMENTS API (Web3 / BTC / ETH / SOL / USDT)
// =========================================
app.post("/api/payments/crypto-checkout", (req, res) => {
  const { cryptoSymbol, amountUsd, chipsAmount, walletAddress, txHash } = req.body;

  const symbol = (cryptoSymbol || "SOL").toUpperCase();
  const rates: Record<string, number> = {
    SOL: 165.50,
    BTC: 64200.00,
    ETH: 3450.00,
    USDT: 1.00,
    USDC: 1.00,
  };

  const currentRate = rates[symbol] || 1.0;
  const cryptoAmount = (amountUsd / currentRate).toFixed(6);
  const hash = txHash || `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`;

  const depositReceipt = {
    txnId: `TXN-CRYPTO-${Math.floor(100000 + Math.random() * 900000)}`,
    timestamp: new Date().toISOString(),
    cryptoSymbol: symbol,
    cryptoAmount,
    amountUsd,
    chipsAmount,
    depositWallet: walletAddress || "8x2...f9A_PalaceVault",
    txHash: hash,
    status: "CONFIRMED_ON_CHAIN",
  };

  res.json({
    status: "success",
    message: `Web3 ${symbol} payment confirmed on-chain!`,
    receipt: depositReceipt,
  });
});

// =========================================
// 4. GOOGLE ADS CONFIG API
// =========================================
app.get("/api/ads/config", (req, res) => {
  res.json({
    publisherId: "ca-pub-3940256099942544", // Google AdSense Test Publisher ID
    clientSideAdsEnabled: true,
    bannerSlots: {
      topBanner: "6329399858",
      shopVideo: "8392019284",
    },
  });
});

// =========================================
// 5. PROJECT SOURCE ZIP DOWNLOAD API
// =========================================
app.get(["/api/download-zip", "/download-zip", "/euchre-paradise-source.zip"], (_req, res) => {
  const tmpZipPath = "/tmp/euchre-paradise-source.zip";
  const scriptPath = path.join(process.cwd(), "scripts", "create_zip.py");

  const sendZip = () => {
    res.download(tmpZipPath, "euchre-paradise-source.zip", (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: "Failed to download zip", details: String(err) });
      }
    });
  };

  if (fs.existsSync(tmpZipPath)) {
    sendZip();
  } else {
    execFile("python3", [scriptPath], (err) => {
      if (err) {
        res.status(500).json({ error: "Failed to generate zip", details: String(err) });
      } else {
        sendZip();
      }
    });
  }
});

// =========================================
// 5. VITE / STATIC SERVING LOGIC
// =========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
