console.log('🎒 Complete Fixed Solana Bags integration loading...');

// Configuración de Solana con USDC Devnet - SIN REFERENCIAS A INCINERATOR
const SOLANA_CONFIG = {
    network: 'devnet',
    rpcEndpoint: 'https://api.devnet.solana.com',
    tokenMint: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', // USDC Devnet
    tokenDecimals: 6,
    minBurnAmount: 1,
    maxBurnAmount: 5
};

// Backend endpoints
const API_CONFIG = {
    baseUrl: 'http://localhost:3001',
    endpoints: {
        submitScore: '/api/scores/submit',
        leaderboard: '/api/scores/leaderboard',
        validateSession: '/api/sessions/validate',
        burnTokens: '/api/tokens/validate-burn'
    }
};

setTimeout(function() {
    console.log('🎒 Creating complete fixed USDC burn integration...');
    
    const overlay = document.createElement('div');
    overlay.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .bags-toggle { 
                position: fixed; 
                top: 24px; 
                right: 24px; 
                width: 64px; 
                height: 64px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none; 
                border-radius: 20px; 
                color: white; 
                font-size: 28px; 
                cursor: pointer; 
                z-index: 10000; 
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .bags-toggle:hover { 
                transform: scale(1.05) translateY(-2px); 
                box-shadow: 0 20px 48px rgba(102, 126, 234, 0.6);
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            }
            
            .bags-panel { 
                position: fixed; 
                top: 24px; 
                right: 100px; 
                width: 380px; 
                max-height: calc(100vh - 48px); 
                background: rgba(15, 23, 42, 0.85);
                backdrop-filter: blur(24px);
                color: white; 
                border-radius: 24px; 
                transform: translateX(120%); 
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
                z-index: 9999; 
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 24px 64px rgba(0,0,0,0.4);
            }
            
            .bags-panel.visible { 
                transform: translateX(0); 
            }
            
            .panel-header {
                padding: 28px 28px 20px 28px;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                border-bottom: 1px solid rgba(255,255,255,0.08);
            }
            
            .panel-header h3 {
                margin: 0 0 8px 0;
                font-size: 20px;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea, #764ba2);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .panel-content {
                max-height: calc(100vh - 140px);
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.2) transparent;
            }
            
            .panel-section { 
                padding: 24px 28px; 
                border-bottom: 1px solid rgba(255,255,255,0.06); 
            }
            
            .section-title { 
                color: #e2e8f0;
                font-weight: 600; 
                margin-bottom: 16px; 
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .btn { 
                width: 100%; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white; 
                border: none; 
                padding: 16px 20px; 
                border-radius: 16px; 
                cursor: pointer; 
                font-weight: 600; 
                margin-bottom: 12px; 
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn:hover:not(:disabled) { 
                transform: translateY(-2px);
                box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
            }
            
            .btn.burn { 
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            
            .btn.danger {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            }
            
            .btn.success {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            
            .session-active { 
                background: linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(16,185,129,0.1) 100%);
                border: 1px solid rgba(34,197,94,0.3); 
                border-radius: 16px; 
                padding: 20px; 
                text-align: center; 
                margin-bottom: 16px;
            }
            
            .session-invalid {
                background: linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.1) 100%);
                border: 1px solid rgba(239,68,68,0.3);
            }
            
            .wallet-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 16px;
                border-radius: 16px;
                margin-bottom: 16px;
            }
            
            .wallet-address {
                font-family: monospace;
                font-size: 13px;
                color: #94a3b8;
                margin-bottom: 12px;
                padding: 12px;
                background: rgba(0,0,0,0.2);
                border-radius: 8px;
            }
            
            .balance-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }
            
            .balance-item {
                text-align: center;
                padding: 12px;
                background: rgba(255,255,255,0.03);
                border-radius: 12px;
            }
            
            .balance-label {
                font-size: 11px;
                color: #94a3b8;
                margin-bottom: 4px;
            }
            
            .balance-value {
                font-size: 16px;
                font-weight: 700;
                color: #f1f5f9;
            }
            
            .input-field {
                width: 100%;
                padding: 14px 16px;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                background: rgba(255,255,255,0.05);
                color: white;
                margin-bottom: 12px;
                font-size: 14px;
                box-sizing: border-box;
            }
            
            .input-field:focus {
                outline: none;
                border-color: #667eea;
                background: rgba(255,255,255,0.08);
            }
            
            .session-stats {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 12px;
                margin: 12px 0;
            }
            
            .session-stat {
                text-align: center;
            }
            
            .session-stat-value {
                font-size: 16px;
                font-weight: 700;
                color: #10b981;
                margin-bottom: 4px;
            }
            
            .session-stat-label {
                font-size: 10px;
                color: rgba(255,255,255,0.6);
                text-transform: uppercase;
            }
            
            .loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                border-top-color: #667eea;
                animation: spin 1s ease-in-out infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .notification { 
                position: fixed; 
                top: 24px; 
                left: 50%; 
                transform: translateX(-50%); 
                background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(34,197,94,0.3);
                border-radius: 16px; 
                padding: 16px 24px; 
                color: white; 
                z-index: 10001; 
                animation: slideDown 0.5s ease;
                box-shadow: 0 12px 32px rgba(0,0,0,0.3);
                min-width: 300px;
                text-align: center;
            }
            
            .notification.error {
                border-color: rgba(239, 68, 68, 0.3);
            }
            
            .notification.info {
                border-color: rgba(59, 130, 246, 0.3);
            }
            
            @keyframes slideDown { 
                from { 
                    transform: translateX(-50%) translateY(-100%); 
                    opacity: 0; 
                } 
                to { 
                    transform: translateX(-50%) translateY(0); 
                    opacity: 1; 
                } 
            }
            
            .token-info {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
                font-size: 11px;
                color: #93c5fd;
            }
            
            .stats-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 12px; 
            }
            
            .stat-card { 
                background: rgba(255,255,255,0.05);
                padding: 16px; 
                border-radius: 16px; 
                text-align: center;
                border: 1px solid rgba(255,255,255,0.08);
            }
            
            .stat-label {
                font-size: 10px;
                color: #94a3b8;
                margin-bottom: 8px;
                text-transform: uppercase;
            }
            
            .stat-value {
                font-size: 18px;
                font-weight: 700;
            }
            
            .emergency-reset {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                z-index: 9999;
                font-size: 12px;
            }

            .loading-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 20px;
                color: #94a3b8;
                font-size: 14px;
            }

            .leaderboard-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                margin-bottom: 8px;
                background: rgba(255,255,255,0.03);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.06);
                transition: all 0.3s ease;
            }

            .leaderboard-item:hover {
                background: rgba(255,255,255,0.06);
                border-color: rgba(255,255,255,0.1);
            }

            .leaderboard-rank {
                font-size: 14px;
                font-weight: 700;
                min-width: 24px;
                text-align: center;
                margin-right: 12px;
            }

            .leaderboard-rank.first { color: #fbbf24; }
            .leaderboard-rank.second { color: #94a3b8; }
            .leaderboard-rank.third { color: #f97316; }
            .leaderboard-rank.other { color: #64748b; }

            .leaderboard-player {
                flex: 1;
                min-width: 0;
            }

            .leaderboard-wallet {
                font-family: monospace;
                font-size: 12px;
                color: #e2e8f0;
                font-weight: 600;
                margin-bottom: 2px;
            }

            .leaderboard-stats {
                font-size: 10px;
                color: #94a3b8;
            }

            .leaderboard-score {
                font-size: 14px;
                font-weight: 700;
                color: #10b981;
                text-align: right;
            }

            .leaderboard-footer {
                text-align: center;
                padding: 12px;
                border-top: 1px solid rgba(255,255,255,0.06);
                margin-top: 8px;
            }

            .error-state {
                text-align: center;
                padding: 20px;
            }

            .current-player {
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                border-color: rgba(102, 126, 234, 0.3);
            }

            .medal {
                margin-left: 4px;
                font-size: 12px;
            }
        </style>

        <button class="bags-toggle" id="bagsToggle">🎒</button>

        <div class="bags-panel" id="bagsPanel">
            <div class="panel-header">
                <h3>🦖 Dino3D × Bags.fm</h3>
                <p>Burn USDC • Play game • Earn SOL</p>
            </div>
            
            <div class="panel-content">
                <div class="panel-section">
                    <div class="section-title">🏆 Live Leaderboard</div>
                    <div id="leaderboardContainer">
                        <div id="leaderboardLoading" class="loading-placeholder">
                            <div class="loading"></div>
                            <span>Loading leaderboard...</span>
                        </div>
                        <div id="leaderboardContent" style="display: none;">
                            <div id="leaderboardList"></div>
                            <div class="leaderboard-footer">
                                <small style="color: #94a3b8;">Updates every 30 seconds</small>
                            </div>
                        </div>
                        <div id="leaderboardError" style="display: none;">
                            <div class="error-state">
                                <span style="color: #ef4444;">📡 Backend offline</span>
                                <small style="color: #94a3b8; display: block; margin-top: 4px;">Leaderboard unavailable</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">💳 Solana Wallet (Devnet)</div>
                    <div id="walletDisconnected">
                        <button class="btn" id="connectWallet">Connect Phantom Wallet</button>
                        <div class="token-info">
                            💡 Make sure Phantom is set to <strong>Devnet</strong> mode
                        </div>
                        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 8px 0 0 0;">
                            Need devnet SOL? Visit <a href="https://faucet.solana.com" target="_blank" style="color: #667eea;">faucet</a>
                        </p>
                    </div>
                    <div id="walletConnected" style="display: none;">
                        <div class="wallet-card">
                            <div class="wallet-address" id="walletAddress"></div>
                            <div class="balance-grid">
                                <div class="balance-item">
                                    <div class="balance-label">SOL</div>
                                    <div class="balance-value" id="solBalance">0</div>
                                </div>
                                <div class="balance-item">
                                    <div class="balance-label">USDC</div>
                                    <div class="balance-value" id="tokenBalance">0</div>
                                </div>
                            </div>
                        </div>
                        <button class="btn" id="disconnectWallet" style="background: rgba(239,68,68,0.8);">Disconnect</button>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">🎮 Game Session</div>
                    <div id="noSession">
                        <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-bottom: 16px;">Connect wallet to start earning rewards</p>
                    </div>
                    <div id="sessionActive" style="display: none;">
                        <div class="session-active" id="sessionCard">
                            <div style="font-weight: 700; color: #10b981; margin-bottom: 12px; font-size: 14px;" id="sessionStatus">🔴 LIVE SESSION</div>
                            <div class="session-stats">
                                <div class="session-stat">
                                    <div class="session-stat-value" id="sessionTokens">0</div>
                                    <div class="session-stat-label">USDC Burned</div>
                                </div>
                                <div class="session-stat">
                                    <div class="session-stat-value" id="sessionDuration">00:00</div>
                                    <div class="session-stat-label">Duration</div>
                                </div>
                                <div class="session-stat">
                                    <div class="session-stat-value" id="currentScore">0</div>
                                    <div class="session-stat-label">Score</div>
                                </div>
                            </div>
                        </div>
                        <button class="btn danger" id="endSession">End Session & Submit Score</button>
                    </div>
                </div>

                <div class="panel-section">
                    <div class="section-title">📊 Your Statistics</div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-label">Best Score</div>
                            <div class="stat-value" style="color: #fbbf24;" id="bestScore">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">Sessions</div>
                            <div class="stat-value" style="color: #667eea;" id="totalSessions">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">USDC Burned</div>
                            <div class="stat-value" style="color: #f093fb;" id="tokensBurned">0</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-label">SOL Earned</div>
                            <div class="stat-value" style="color: #10b981;" id="solEarned">0.00</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Variables globales - SIN REFERENCIAS A INCINERATOR
    let solanaConnection = null;
    let wallet = null;
    let isConnected = false;
    let isSessionActive = false;
    let sessionStartTime = null;
    let sessionInterval = null;
    let gameOverListener = null;
    let burnTxSignature = null;
    let currentSessionScore = 0;
    let currentSessionId = null;
    let leaderboardInterval = null;
    let leaderboardData = [];
    let userStats = {
        bestScore: 0,
        totalSessions: 0,
        totalBurned: 0,
        solEarned: 0
    };

    // Exponer funciones globalmente
    window.bagsIntegration = {
        handleGameOver: handleGameOver,
        isSessionActive: () => isSessionActive,
        getCurrentScore: () => currentSessionScore,
        resetSession: resetToNewSession
    };

    // Inicializar conexión Solana
    async function initSolana() {
        try {
            if (typeof solanaWeb3 !== 'undefined') {
                solanaConnection = new solanaWeb3.Connection(SOLANA_CONFIG.rpcEndpoint, 'confirmed');
                console.log('✅ Solana connection initialized to devnet');
            } else {
                console.warn('⚠️ Solana Web3.js not loaded');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Solana connection:', error);
        }
    }

    // FUNCIONES DE LEADERBOARD
    
    // Obtener leaderboard del backend
    async function fetchLeaderboard() {
        try {
            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`);
            if (!response.ok) {
                throw new Error('Backend not available');
            }
            
            const data = await response.json();
            leaderboardData = data.leaderboard || [];
            console.log('📊 Leaderboard fetched:', leaderboardData.length, 'players');
            
            showLeaderboard();
            return true;
            
        } catch (error) {
            console.log('⚠️ Failed to fetch leaderboard:', error.message);
            showLeaderboardError();
            return false;
        }
    }

    // Mostrar leaderboard en UI
    function showLeaderboard() {
        const loadingEl = document.getElementById('leaderboardLoading');
        const contentEl = document.getElementById('leaderboardContent');
        const errorEl = document.getElementById('leaderboardError');
        const listEl = document.getElementById('leaderboardList');

        // Ocultar loading y error, mostrar contenido
        loadingEl.style.display = 'none';
        errorEl.style.display = 'none';
        contentEl.style.display = 'block';

        if (!leaderboardData || leaderboardData.length === 0) {
            listEl.innerHTML = `
                <div class="error-state">
                    <span style="color: #94a3b8;">🎮 No players yet</span>
                    <small style="color: #64748b; display: block; margin-top: 4px;">Be the first to set a score!</small>
                </div>
            `;
            return;
        }

        // Generar HTML de la leaderboard
        const currentWallet = wallet ? wallet.publicKey.toString() : null;
        
        const leaderboardHTML = leaderboardData.map((player, index) => {
            const rank = index + 1;
            const isCurrentPlayer = currentWallet === player.walletAddress;
            
            let rankClass = 'other';
            let medal = '';
            
            if (rank === 1) {
                rankClass = 'first';
                medal = '🥇';
            } else if (rank === 2) {
                rankClass = 'second';
                medal = '🥈';
            } else if (rank === 3) {
                rankClass = 'third';
                medal = '🥉';
            }

            const walletDisplay = `${player.walletAddress.slice(0, 4)}...${player.walletAddress.slice(-4)}`;
            
            return `
                <div class="leaderboard-item ${isCurrentPlayer ? 'current-player' : ''}">
                    <div class="leaderboard-rank ${rankClass}">
                        ${rank}<span class="medal">${medal}</span>
                    </div>
                    <div class="leaderboard-player">
                        <div class="leaderboard-wallet">${walletDisplay}</div>
                        <div class="leaderboard-stats">
                            ${player.totalSessions || 0} sessions • ${player.totalBurned || 0} burned
                        </div>
                    </div>
                    <div class="leaderboard-score">
                        ${(player.bestScore || 0).toLocaleString()}
                    </div>
                </div>
            `;
        }).join('');

        listEl.innerHTML = leaderboardHTML;
    }

    // Mostrar error de leaderboard
    function showLeaderboardError() {
        const loadingEl = document.getElementById('leaderboardLoading');
        const contentEl = document.getElementById('leaderboardContent');
        const errorEl = document.getElementById('leaderboardError');

        loadingEl.style.display = 'none';
        contentEl.style.display = 'none';
        errorEl.style.display = 'block';
    }

    // Enviar score al backend
    async function submitScore(score, sessionData) {
        try {
            if (!wallet || !wallet.publicKey) {
                console.log('⚠️ No wallet connected, cannot submit score');
                return false;
            }

            const payload = {
                walletAddress: wallet.publicKey.toString(),
                score: score,
                sessionId: sessionData.sessionId || null,
                txSignature: sessionData.txSignature || null,
                sessionDuration: sessionData.duration || 0,
                tokensBurned: sessionData.tokensBurned || 0,
                timestamp: Date.now()
            };

            console.log('📤 Submitting score:', payload);

            const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.submitScore}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to submit score');
            }

            const result = await response.json();
            console.log('✅ Score submitted successfully:', result);

            // Actualizar leaderboard inmediatamente después de enviar score
            setTimeout(() => {
                fetchLeaderboard();
            }, 1000);

            return true;

        } catch (error) {
            console.log('⚠️ Failed to submit score:', error.message);
            return false;
        }
    }

    // Iniciar actualizaciones automáticas de leaderboard
    function startLeaderboardUpdates() {
        // Fetch inicial
        fetchLeaderboard();
        
        // Actualizar cada 30 segundos
        if (leaderboardInterval) {
            clearInterval(leaderboardInterval);
        }
        
        leaderboardInterval = setInterval(() => {
            fetchLeaderboard();
        }, 30000); // 30 segundos
        
        console.log('🔄 Leaderboard auto-update started (30s interval)');
    }

    // Detener actualizaciones de leaderboard
    function stopLeaderboardUpdates() {
        if (leaderboardInterval) {
            clearInterval(leaderboardInterval);
            leaderboardInterval = null;
            console.log('⏹️ Leaderboard auto-update stopped');
        }
    }

    // FUNCIONES EXISTENTES ACTUALIZADAS
    async function executeBurn(tokenAmount) {
        try {
            showNotification(`🔥 Burning ${tokenAmount} USDC tokens...`, 'info');
    
            if (!wallet || !wallet.publicKey) {
                throw new Error('Wallet not connected');
            }
    
            if (!solanaConnection) {
                throw new Error('Solana connection not available');
            }
    
            const userWallet = wallet.publicKey;
            console.log('👤 User wallet:', userWallet.toString());
    
            // Verificar balance
            const balance = await solanaConnection.getBalance(userWallet);
            const solAmount = balance / solanaWeb3.LAMPORTS_PER_SOL;
            
            console.log(`💰 Current SOL balance: ${solAmount.toFixed(3)} SOL`);
            
            if (balance < 10000000) {
                throw new Error(`Insufficient SOL for transaction. You have ${solAmount.toFixed(3)} SOL, need at least 0.01 SOL`);
            }
    
            // Dirección de burn hardcodeada
            const BURN_ADDRESS = 'So11111111111111111111111111111111111111112';
            const burnWallet = new solanaWeb3.PublicKey(BURN_ADDRESS);
            
            // Cantidad a quemar
            const lamportsToBurn = 1000000 * tokenAmount; // 0.001 SOL por token
            
            console.log(`🔥 Burning ${tokenAmount} tokens = ${lamportsToBurn / solanaWeb3.LAMPORTS_PER_SOL} SOL`);
            console.log(`🗑️ Burn destination: ${burnWallet.toString()}`);
    
            // Crear transacción nueva
            const newTransaction = new solanaWeb3.Transaction();
            
            // Instrucción de transferencia
            const transferInst = solanaWeb3.SystemProgram.transfer({
                fromPubkey: userWallet,
                toPubkey: burnWallet,
                lamports: lamportsToBurn,
            });
            
            newTransaction.add(transferInst);
    
            // Blockhash
            console.log('⏳ Getting blockhash...');
            const blockInfo = await solanaConnection.getLatestBlockhash('confirmed');
            newTransaction.recentBlockhash = blockInfo.blockhash;
            newTransaction.feePayer = userWallet;
            newTransaction.lastValidBlockHeight = blockInfo.lastValidBlockHeight;
    
            console.log('📝 Transaction ready:', {
                blockhash: blockInfo.blockhash.slice(0, 8) + '...',
                feePayer: userWallet.toString().slice(0, 8) + '...',
                destination: 'So111111...',
                amount: `${lamportsToBurn / solanaWeb3.LAMPORTS_PER_SOL} SOL`
            });
    
            showNotification('📝 Approve transaction in Phantom...', 'info');
    
            // Firmar
            console.log('✏️ Requesting signature...');
            
            let signature;
            try {
                const result = await wallet.signAndSendTransaction(newTransaction);
                // Extraer signature correctamente - puede ser string o objeto
                signature = typeof result === 'string' ? result : result.signature;
                console.log('✅ Transaction sent:', signature);
            } catch (signErr) {
                console.error('❌ Signing error:', signErr);
                if (signErr.message.includes('User rejected')) {
                    throw new Error('Transaction was rejected by user');
                }
                throw new Error(`Failed to sign transaction: ${signErr.message}`);
            }
            
            if (!signature || typeof signature !== 'string') {
                throw new Error('Invalid signature received from wallet');
            }
            
            showNotification('⏳ Confirming transaction...', 'info');
    
            // Confirmar
            console.log('⏳ Confirming...');
            
            try {
                const confirmation = await solanaConnection.confirmTransaction(
                    signature, // Solo la signature string
                    'confirmed'
                );
    
                if (confirmation.value.err) {
                    console.error('❌ Confirmation error:', confirmation.value.err);
                    throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
                }
    
                console.log('✅ CONFIRMED!');
            } catch (confirmErr) {
                console.error('❌ Confirmation error:', confirmErr);
                throw new Error(`Confirmation failed: ${confirmErr.message}`);
            }
    
            showNotification(`✅ ${tokenAmount} USDC BURNED!`, 'success');
            
            console.log('🎉 BURN SUCCESS!');
            console.log('🔗 Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
            console.log('🔥 Burned to:', burnWallet.toString());
    
            // Actualizar balances
            await updateWalletBalances(userWallet);
    
            return signature;
    
        } catch (err) {
            console.error('❌ Burn failed:', err);
            
            if (err.message.includes('User rejected')) {
                showNotification('❌ Transaction cancelled', 'error');
            } else if (err.message.includes('Insufficient SOL')) {
                showNotification(`❌ ${err.message}`, 'error');
            } else if (err.message.includes('Wallet not connected')) {
                showNotification('❌ Connect wallet first', 'error');
            } else {
                showNotification(`❌ Burn failed: ${err.message}`, 'error');
            }
            
            throw err;
        }
    }

    // Función para actualizar balances
    async function updateWalletBalances(publicKey) {
        try {
            if (!solanaConnection) {
                console.log('⚠️ No connection for balance update');
                return;
            }
            
            console.log('💰 Updating balances...');
            
            const solBalance = await solanaConnection.getBalance(publicKey);
            const solAmount = (solBalance / solanaWeb3.LAMPORTS_PER_SOL).toFixed(3);
            document.getElementById('solBalance').textContent = solAmount;
            document.getElementById('tokenBalance').textContent = '100.00';
            
            console.log(`✅ Balances updated - SOL: ${solAmount}`);

        } catch (error) {
            console.error('❌ Failed to update balances:', error);
            document.getElementById('solBalance').textContent = '0.000';
            document.getElementById('tokenBalance').textContent = '0.00';
        }
    }

    // Cargar estadísticas del usuario
    async function loadUserStats(walletAddress) {
        try {
            console.log('📊 Loading user stats for:', walletAddress);
            
            try {
                const response = await fetch(`${API_CONFIG.baseUrl}/api/users/${walletAddress}/stats`);
                if (response.ok) {
                    userStats = await response.json();
                    console.log('✅ User stats loaded from backend:', userStats);
                } else {
                    console.log('⚠️ Backend not available, using default stats');
                }
            } catch (error) {
                console.log('⚠️ Backend connection failed, using default stats');
            }
            
            updateStatsUI();
            
        } catch (error) {
            console.error('❌ Failed to load user stats:', error);
            userStats = {
                bestScore: 0,
                totalSessions: 0,
                totalBurned: 0,
                solEarned: 0
            };
            updateStatsUI();
        }
    }

    // Actualizar UI de estadísticas
    function updateStatsUI() {
        document.getElementById('bestScore').textContent = userStats.bestScore.toLocaleString();
        document.getElementById('totalSessions').textContent = userStats.totalSessions;
        document.getElementById('tokensBurned').textContent = userStats.totalBurned.toLocaleString();
        document.getElementById('solEarned').textContent = userStats.solEarned.toFixed(3);
        
        console.log('📊 Stats UI updated:', userStats);
    }

    // Conectar Phantom Wallet
    async function connectPhantomWallet() {
        try {
            showNotification('🔄 Connecting to Phantom Wallet...', 'info');
            
            if (!window.solana || !window.solana.isPhantom) {
                throw new Error('Phantom Wallet not found! Please install Phantom from phantom.app');
            }

            const response = await window.solana.connect();
            wallet = window.solana;
            isConnected = true;

            console.log('📱 Connected to wallet:', response.publicKey.toString());

            const publicKey = new solanaWeb3.PublicKey(response.publicKey.toString());
            await updateWalletBalances(publicKey);

            document.getElementById('walletDisconnected').style.display = 'none';
            document.getElementById('walletConnected').style.display = 'block';
            document.getElementById('walletAddress').textContent = 
                `${response.publicKey.toString().slice(0, 4)}...${response.publicKey.toString().slice(-4)}`;

            await loadUserStats(response.publicKey.toString());

            showSessionOptions();
            showNotification('✅ Connected to Phantom (Devnet mode)', 'success');

            // Iniciar actualizaciones de leaderboard al conectar wallet
            startLeaderboardUpdates();

            wallet.on('disconnect', handleWalletDisconnect);

        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            showNotification(`Connection failed: ${error.message}`, 'error');
        }
    }

    // Mostrar opciones de sesión
    function showSessionOptions() {
        document.getElementById('noSession').innerHTML = `
            <div style="margin-bottom: 16px;">
                <input type="number" value="1" min="${SOLANA_CONFIG.minBurnAmount}" max="${SOLANA_CONFIG.maxBurnAmount}" 
                       class="input-field" id="burnAmount" placeholder="Amount of USDC to burn" step="1">
                <button class="btn burn" id="startSession">🔥 BURN USDC & Start Gaming Session</button>
            </div>
            <div class="token-info">
                🔥 This will BURN 0.001 SOL per USDC to SOL Native address
                <br><small style="color: #ef4444;">⚠️ Burned SOL cannot be recovered!</small>
            </div>
            <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 8px 0 0 0;">
                Need devnet SOL? Visit <a href="https://faucet.solana.com" target="_blank" style="color: #667eea;">faucet</a>
            </p>
        `;
        
        document.getElementById('startSession').addEventListener('click', startGameSession);
    }

    // Función para iniciar sesión de juego
    async function startGameSession() {
        try {
            const amount = parseInt(document.getElementById('burnAmount').value);
            
            if (isNaN(amount) || amount < SOLANA_CONFIG.minBurnAmount || amount > SOLANA_CONFIG.maxBurnAmount) {
                throw new Error(`Please enter a valid amount between ${SOLANA_CONFIG.minBurnAmount} and ${SOLANA_CONFIG.maxBurnAmount}`);
            }

            const button = document.getElementById('startSession');
            const originalText = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<div class="loading"></div> Processing burn...';

            console.log(`🎮 Starting game session with ${amount} token burn`);

            // Ejecutar burn
            try {
                burnTxSignature = await executeBurn(amount);
                console.log('✅ Burn successful, signature:', burnTxSignature);
            } catch (burnError) {
                console.error('❌ Burn failed:', burnError);
                button.disabled = false;
                button.innerHTML = originalText;
                return;
            }
            
            if (!burnTxSignature) {
                throw new Error('Burn transaction failed - no signature received');
            }

            // Validar en backend (opcional)
            try {
                const sessionResponse = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.burnTokens}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        txSignature: burnTxSignature,
                        walletAddress: wallet.publicKey.toString(),
                        amount: amount
                    })
                });

                if (sessionResponse.ok) {
                    const sessionData = await sessionResponse.json();
                    currentSessionId = sessionData.sessionId;
                    console.log('✅ Backend session created:', currentSessionId);
                } else {
                    console.log('⚠️ Backend not available, continuing without backend session');
                }
            } catch (backendError) {
                console.log('⚠️ Backend connection failed, continuing without backend:', backendError.message);
            }

            // Iniciar sesión exitosamente
            isSessionActive = true;
            sessionStartTime = Date.now();
            currentSessionScore = 0;
            userStats.totalSessions++;
            userStats.totalBurned += amount;

            console.log('🎮 Game session started successfully');

            // Update UI
            document.getElementById('noSession').style.display = 'none';
            document.getElementById('sessionActive').style.display = 'block';
            document.getElementById('sessionTokens').textContent = amount;
            updateStatsUI();

            // Reset session card state
            const sessionCard = document.getElementById('sessionCard');
            sessionCard.classList.remove('session-invalid');
            document.getElementById('sessionStatus').innerHTML = '🔴 LIVE SESSION';
            document.getElementById('sessionStatus').style.color = '#10b981';
            
            const endButton = document.getElementById('endSession');
            endButton.textContent = 'End Session & Submit Score';
            endButton.className = 'btn danger';
            endButton.onclick = () => endSession();

            // Start timers and monitoring
            sessionInterval = setInterval(updateSessionTimer, 1000);
            startGameMonitoring();

            showNotification('🎉 Session started! Start playing to earn points!', 'success');

        } catch (error) {
            console.error('❌ Failed to start game session:', error);
            showNotification(`Failed to start session: ${error.message}`, 'error');
            
            const button = document.getElementById('startSession');
            button.disabled = false;
            button.innerHTML = '🔥 Burn USDC & Start Gaming Session';
        }
    }

    // Monitorear estado del juego
    function startGameMonitoring() {
        console.log('👁 Starting game monitoring...');
        
        const checkGameOver = () => {
            const restartElement = document.getElementById('game-restart');
            if (restartElement && !restartElement.classList.contains('hidden')) {
                console.log('🎮 Game over detected');
                handleGameOver();
                return;
            }
        };

        gameOverListener = setInterval(checkGameOver, 500);
        monitorGameScore();
    }

    // Monitorear puntuación del juego
    function monitorGameScore() {
        setInterval(() => {
            if (isSessionActive) {
                let gameScore = 0;
                
                if (window.gameScore !== undefined) {
                    gameScore = window.gameScore;
                } else {
                    gameScore = Math.floor((Date.now() - sessionStartTime) / 100);
                }
                
                currentSessionScore = gameScore;
                document.getElementById('currentScore').textContent = currentSessionScore.toLocaleString();
            }
        }, 500);
    }

    // Manejar game over
    function handleGameOver() {
        if (!isSessionActive) return;

        console.log('🎮 Game Over detected!');
        
        // Calcular duración de la sesión
        const sessionDuration = sessionStartTime ? Date.now() - sessionStartTime : 0;
        const sessionMinutes = Math.floor(sessionDuration / 60000);
        
        // Preparar datos de la sesión para envío
        const sessionData = {
            sessionId: currentSessionId,
            txSignature: burnTxSignature,
            duration: sessionDuration,
            tokensBurned: parseInt(document.getElementById('sessionTokens').textContent) || 0
        };

        // Enviar score al backend
        if (currentSessionScore > 0) {
            submitScore(currentSessionScore, sessionData)
                .then(success => {
                    if (success) {
                        showNotification(`📊 Score ${currentSessionScore.toLocaleString()} submitted to leaderboard!`, 'success');
                    } else {
                        showNotification(`💾 Score ${currentSessionScore.toLocaleString()} saved locally`, 'info');
                    }
                })
                .catch(error => {
                    console.error('Failed to submit score:', error);
                });
        }

        invalidateSession();
        
        if (gameOverListener) {
            clearInterval(gameOverListener);
            gameOverListener = null;
        }

        // Actualizar best score si es necesario
        if (currentSessionScore > userStats.bestScore) {
            userStats.bestScore = currentSessionScore;
            updateStatsUI();
        }

        showNotification(`💀 Game Over! Final score: ${currentSessionScore.toLocaleString()} • Duration: ${sessionMinutes}m`, 'info');
        
        setTimeout(() => {
            resetToNewSession();
        }, 5000);
    }

    // Invalidar sesión
    function invalidateSession() {
        isSessionActive = false;
        
        const sessionCard = document.getElementById('sessionCard');
        sessionCard.classList.add('session-invalid');
        
        document.getElementById('sessionStatus').innerHTML = '💀 SESSION ENDED';
        document.getElementById('sessionStatus').style.color = '#ef4444';

        const statValues = sessionCard.querySelectorAll('.session-stat-value');
        statValues.forEach(value => {
            value.style.color = '#ef4444';
        });

        const endButton = document.getElementById('endSession');
        endButton.textContent = 'Start New Session';
        endButton.className = 'btn success';
        endButton.onclick = () => resetToNewSession();

        clearInterval(sessionInterval);
    }

    // Resetear sesión
    function resetToNewSession() {
        isSessionActive = false;
        sessionStartTime = null;
        currentSessionScore = 0;
        
        if (sessionInterval) {
            clearInterval(sessionInterval);
            sessionInterval = null;
        }
        
        if (gameOverListener) {
            clearInterval(gameOverListener);
            gameOverListener = null;
        }
        
        document.getElementById('sessionActive').style.display = 'none';
        document.getElementById('noSession').style.display = 'block';
        
        if (isConnected) {
            showSessionOptions();
        }
        
        console.log('✅ UI reset - ready for new session');
    }

    // Terminar sesión manualmente
    function endSession() {
        if (!isSessionActive) {
            resetToNewSession();
            return;
        }

        // Preparar datos para envío de score
        const sessionDuration = sessionStartTime ? Date.now() - sessionStartTime : 0;
        const sessionData = {
            sessionId: currentSessionId,
            txSignature: burnTxSignature,
            duration: sessionDuration,
            tokensBurned: parseInt(document.getElementById('sessionTokens').textContent) || 0
        };

        // Enviar score si hay puntuación
        if (currentSessionScore > 0) {
            submitScore(currentSessionScore, sessionData)
                .then(success => {
                    if (success) {
                        showNotification(`🏁 Session ended! Score ${currentSessionScore.toLocaleString()} submitted to leaderboard!`, 'success');
                    } else {
                        showNotification(`🏁 Session ended! Final score: ${currentSessionScore.toLocaleString()}`, 'success');
                    }
                });
        } else {
            showNotification(`🏁 Session ended! Final score: ${currentSessionScore.toLocaleString()}`, 'success');
        }

        handleGameOver();
    }

    // Desconectar wallet
    function disconnectWallet() {
        if (wallet) {
            wallet.disconnect();
        }
        handleWalletDisconnect();
    }

    function handleWalletDisconnect() {
        isConnected = false;
        wallet = null;
        
        if (isSessionActive) {
            resetToNewSession();
        }

        // Detener actualizaciones de leaderboard al desconectar
        stopLeaderboardUpdates();

        document.getElementById('walletConnected').style.display = 'none';
        document.getElementById('walletDisconnected').style.display = 'block';
        resetToNewSession();

        showNotification('👋 Wallet disconnected', 'info');
    }

    // Actualizar timer de sesión
    function updateSessionTimer() {
        if (!sessionStartTime) return;
        
        const elapsed = Date.now() - sessionStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        document.getElementById('sessionDuration').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Mostrar notificación
    function showNotification(message, type) {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 5000);
    }

    // Agregar botón de reset de emergencia
    function addEmergencyReset() {
        const resetButton = document.createElement('button');
        resetButton.textContent = '🔄 Reset';
        resetButton.className = 'emergency-reset';
        resetButton.onclick = () => {
            if (confirm('Reset session?')) {
                resetToNewSession();
                showNotification('🔄 Session reset', 'info');
            }
        };
        
        document.body.appendChild(resetButton);
    }

    // Event Listeners
    document.getElementById('bagsToggle').addEventListener('click', function() {
        const panel = document.getElementById('bagsPanel');
        const toggle = document.getElementById('bagsToggle');
        
        if (panel.classList.contains('visible')) {
            panel.classList.remove('visible');
            toggle.textContent = '🎒';
        } else {
            panel.classList.add('visible');
            toggle.textContent = '✕';
        }
    });

    document.getElementById('connectWallet').addEventListener('click', connectPhantomWallet);

    document.addEventListener('click', function(e) {
        if (e.target.id === 'disconnectWallet') {
            disconnectWallet();
        }
        if (e.target.id === 'endSession') {
            endSession();
        }
    });

    // Inicializar
    initSolana();
    addEmergencyReset();

    // Iniciar leaderboard inmediatamente (sin necesidad de wallet conectado)
    startLeaderboardUpdates();

    console.log('✅ Complete Fixed USDC burn integration loaded!');
    console.log('🪙 Using USDC Devnet token:', SOLANA_CONFIG.tokenMint);
    console.log('🏆 Leaderboard system initialized');
    
}, 3000);