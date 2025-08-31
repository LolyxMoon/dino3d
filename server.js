require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// Solana connection
const connection = new Connection(
    process.env.SOLANA_RPC || 'https://api.devnet.solana.com',
    'confirmed'
);

// Socket.IO setup
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// In-memory storage (para desarrollo - en producción usar base de datos)
const gameData = {
    sessions: new Map(),
    leaderboard: [],
    userStats: new Map()
};

console.log('🎒 Bags API Server Starting...');
console.log('📡 Solana RPC:', process.env.SOLANA_RPC);
console.log('🪙 Token Mint:', process.env.BAG_TOKEN_MINT);

// Middleware para validar wallet
function validateWallet(req, res, next) {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
    }
    
    try {
        new PublicKey(walletAddress);
        next();
    } catch (error) {
        return res.status(400).json({ error: 'Invalid wallet address' });
    }
}

// Utility functions
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function updateLeaderboard(walletAddress, score, burnTx) {
    const existingIndex = gameData.leaderboard.findIndex(
        entry => entry.walletAddress === walletAddress
    );
    
    const newEntry = {
        walletAddress,
        score,
        burnTx,
        timestamp: Date.now()
    };
    
    if (existingIndex >= 0) {
        if (score > gameData.leaderboard[existingIndex].score) {
            gameData.leaderboard[existingIndex] = newEntry;
        }
    } else {
        gameData.leaderboard.push(newEntry);
    }
    
    // Emit leaderboard update via WebSocket
    emitLeaderboardUpdate();
}

function updateUserStats(walletAddress, score, burnAmount) {
    const stats = gameData.userStats.get(walletAddress) || {
        bestScore: 0,
        totalSessions: 0,
        totalBurned: 0,
        solEarned: 0
    };
    
    stats.totalSessions++;
    stats.totalBurned += burnAmount;
    
    if (score > stats.bestScore) {
        stats.bestScore = score;
    }
    
    gameData.userStats.set(walletAddress, stats);
}

function emitLeaderboardUpdate() {
    const leaderboard = gameData.leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((entry, index) => ({
            rank: index + 1,
            score: entry.score,
            wallet: `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`,
            timestamp: entry.timestamp
        }));
    
    io.emit('leaderboard_update', leaderboard);
    console.log('📊 Leaderboard updated, emitted to clients');
}

// API ROUTES

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        sessions: gameData.sessions.size,
        leaderboard: gameData.leaderboard.length
    });
});

// Get user stats
app.get('/api/users/:walletAddress/stats', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        
        // Validate wallet address
        try {
            new PublicKey(walletAddress);
        } catch {
            return res.status(400).json({ error: 'Invalid wallet address' });
        }
        
        const stats = gameData.userStats.get(walletAddress) || {
            bestScore: 0,
            totalSessions: 0,
            totalBurned: 0,
            solEarned: 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error('❌ Error getting user stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Validate burn transaction and create session
app.post('/api/tokens/validate-burn', async (req, res) => {
    try {
        const { txSignature, walletAddress, amount } = req.body;
        
        console.log(`🔥 Validating burn: ${amount} tokens from ${walletAddress}`);
        console.log(`📝 Transaction: ${txSignature}`);
        
        // For now, we'll trust the frontend (in production, validate on blockchain)
        // TODO: Implement real transaction validation
        /*
        const transaction = await connection.getTransaction(txSignature, {
            commitment: 'confirmed'
        });
        
        if (!transaction) {
            return res.status(400).json({ error: 'Transaction not found' });
        }
        */
        
        // Create session
        const sessionId = generateSessionId();
        gameData.sessions.set(sessionId, {
            walletAddress,
            burnAmount: amount,
            burnTx: txSignature,
            startTime: Date.now(),
            isActive: true,
            score: 0
        });
        
        console.log(`✅ Session created: ${sessionId}`);
        
        res.json({ 
            sessionId,
            validated: true,
            message: 'Session created successfully'
        });
        
    } catch (error) {
        console.error('❌ Error validating burn:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit score
app.post('/api/scores/submit', validateWallet, async (req, res) => {
    try {
        const { walletAddress, score, burnTxSignature, sessionId } = req.body;
        
        console.log(`🎯 Score submission: ${score} from ${walletAddress}`);
        
        // Validate session
        const session = gameData.sessions.get(sessionId);
        if (!session || !session.isActive || session.walletAddress !== walletAddress) {
            return res.status(400).json({ error: 'Invalid or expired session' });
        }
        
        // Update leaderboard
        updateLeaderboard(walletAddress, score, burnTxSignature);
        
        // Update user stats
        updateUserStats(walletAddress, score, session.burnAmount);
        
        // Mark session as completed
        session.isActive = false;
        session.finalScore = score;
        session.endTime = Date.now();
        
        const leaderboardPosition = gameData.leaderboard
            .sort((a, b) => b.score - a.score)
            .findIndex(entry => entry.walletAddress === walletAddress) + 1;
        
        console.log(`✅ Score submitted: ${score}, position: ${leaderboardPosition}`);
        
        res.json({ 
            success: true, 
            score,
            leaderboardPosition,
            message: 'Score submitted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error submitting score:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get leaderboard
app.get('/api/scores/leaderboard', async (req, res) => {
    try {
        const sortedLeaderboard = gameData.leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 50)
            .map((entry, index) => ({
                rank: index + 1,
                score: entry.score,
                wallet: `${entry.walletAddress.slice(0, 6)}...${entry.walletAddress.slice(-4)}`,
                walletAddress: entry.walletAddress,
                burnTx: entry.burnTx,
                timestamp: entry.timestamp
            }));
        
        res.json(sortedLeaderboard);
    } catch (error) {
        console.error('❌ Error getting leaderboard:', error);
        res.status(500).json({ error: error.message });
    }
});

// Validate session
app.post('/api/sessions/validate', validateWallet, async (req, res) => {
    try {
        const { walletAddress, sessionId } = req.body;
        
        const session = gameData.sessions.get(sessionId);
        const isValid = session && 
                       session.isActive && 
                       session.walletAddress === walletAddress;
        
        res.json({ 
            isValid,
            session: isValid ? {
                sessionId,
                burnAmount: session.burnAmount,
                startTime: session.startTime,
                duration: Date.now() - session.startTime
            } : null
        });
        
    } catch (error) {
        console.error('❌ Error validating session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin endpoint to trigger SOL distribution
app.post('/api/distributions/execute', async (req, res) => {
    try {
        const { adminKey } = req.body;
        
        if (adminKey !== process.env.ADMIN_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const topPlayers = gameData.leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
        
        if (topPlayers.length === 0) {
            return res.json({ message: 'No players to reward' });
        }
        
        console.log('🏆 SOL Distribution triggered for top 3 players:');
        topPlayers.forEach((player, index) => {
            const prizes = ['50%', '30%', '20%'];
            console.log(`  ${index + 1}. ${player.walletAddress}: ${player.score} (${prizes[index]})`);
            
            // Update user SOL earned (simulation)
            const stats = gameData.userStats.get(player.walletAddress);
            if (stats) {
                const solAmount = [0.5, 0.3, 0.2][index];
                stats.solEarned += solAmount;
                gameData.userStats.set(player.walletAddress, stats);
            }
        });
        
        // Reset leaderboard after distribution
        gameData.leaderboard = [];
        emitLeaderboardUpdate();
        
        res.json({ 
            success: true, 
            message: 'SOL distributed to top 3 players',
            winners: topPlayers.length
        });
        
    } catch (error) {
        console.error('❌ Error distributing SOL:', error);
        res.status(500).json({ error: error.message });
    }
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // Send current leaderboard to new client
    emitLeaderboardUpdate();
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

// Periodic leaderboard updates
setInterval(() => {
    emitLeaderboardUpdate();
}, 10000); // Every 10 seconds

// Automatic SOL distribution (every 30 minutes)
setInterval(async () => {
    try {
        console.log('⏰ Automatic SOL distribution check...');
        
        const topPlayers = gameData.leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
        
        if (topPlayers.length > 0) {
            console.log('🎯 Auto-distributing SOL to top players...');
            // Trigger distribution (you can implement auto-admin here)
            // For now, just log
            topPlayers.forEach((player, index) => {
                const prizes = [0.5, 0.3, 0.2];
                console.log(`  Awarding ${prizes[index]} SOL to ${player.walletAddress}`);
            });
        }
    } catch (error) {
        console.error('❌ Automatic distribution failed:', error);
    }
}, 30 * 60 * 1000); // 30 minutes

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log('🚀 Bags API Server running!');
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Leaderboard: http://localhost:${PORT}/api/scores/leaderboard`);
    console.log('');
    console.log('✅ Ready to receive game sessions!');
});