// ===========================================
// BAGS-INTEGRATION.JS - Carga Retardada
// ===========================================

// Esperar a que TODO esté cargado antes de inicializar
setTimeout(function() {
    console.log('🎒 Starting Bags integration (delayed)...');
    
    // Solo inicializar si el juego está completamente cargado
    function waitForGameReady() {
        // Verificar múltiples indicadores de que el juego está listo
        const canvas = document.querySelector('canvas');
        const hasThreeJS = typeof THREE !== 'undefined';
        const gameStarted = canvas && canvas.width > 0;
        
        if (hasThreeJS && gameStarted) {
            console.log('✅ Game is ready, initializing Bags integration');
            initBagsIntegration();
        } else {
            console.log('⏳ Waiting for game to be ready...');
            setTimeout(waitForGameReady, 1000); // Esperar 1 segundo más
        }
    }
    
    waitForGameReady();
    
}, 3000); // Esperar 3 segundos después de la carga

function initBagsIntegration() {
    // Crear el overlay sin interferir con el juego
    const overlay = document.createElement('div');
    overlay.id = 'bags-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    
    overlay.innerHTML = `
        <style>
            #bags-overlay * {
                pointer-events: auto;
                box-sizing: border-box;
            }
            
            .bags-toggle {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #9945FF, #7c3aed);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease;
                box-shadow: 0 4px 15px rgba(153, 69, 255, 0.4);
                z-index: 10001;
            }
            
            .bags-toggle:hover {
                transform: scale(1.1);
            }
            
            .bags-panel {
                position: fixed;
                top: 20px;
                right: 90px;
                width: 320px;
                max-height: calc(100vh - 40px);
                background: rgba(20, 20, 40, 0.95);
                backdrop-filter: blur(10px);
                border: 2px solid rgba(153, 69, 255, 0.3);
                border-radius: 15px;
                color: white;
                overflow: hidden;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 10001;
            }
            
            .bags-panel.visible {
                transform: translateX(0);
                opacity: 1;
            }
            
            .panel-header {
                background: linear-gradient(135deg, #9945FF, #7c3aed);
                padding: 15px 20px;
            }
            
            .panel-header h3 {
                margin: 0 0 5px 0;
                font-size: 16px;
            }
            
            .panel-header p {
                margin: 0;
                font-size: 12px;
                opacity: 0.8;
            }
            
            .panel-content {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .panel-section {
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .section-title {
                font-size: 14px;
                color: #9945FF;
                margin-bottom: 15px;
                font-weight: bold;
            }
            
            .connect-btn {
                width: 100%;
                background: linear-gradient(135deg, #9945FF, #7c3aed);
                color: white;
                border: none;
                padding: 15px;
                border-radius: 10px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: transform 0.2s;
            }
            
            .connect-btn:hover {
                transform: translateY(-2px);
            }
            
            .notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(20, 20, 40, 0.95);
                backdrop-filter: blur(10px);
                border: 2px solid #22c55e;
                border-radius: 10px;
                padding: 15px 20px;
                color: white;
                font-size: 14px;
                z-index: 10002;
                animation: slideDown 0.3s ease-out;
            }
            
            .notification.error {
                border-color: #ef4444;
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
        </style>

        <!-- Toggle Button -->
        <button class="bags-toggle" id="bagsToggle">🎒</button>

        <!-- Main Panel -->
        <div class="bags-panel" id="bagsPanel">
            <div class="panel-header">
                <h3>🦖 Dino3D x Bags.fm</h3>
                <p>Burn tokens • Play game • Earn SOL</p>
            </div>
            
            <div class="panel-content">
                <!-- Wallet Section -->
                <div class="panel-section">
                    <div class="section-title">💳 Wallet</div>
                    
                    <div id="walletDisconnected">
                        <button class="connect-btn" id="connectWallet">
                            Connect Solana Wallet
                        </button>
                        <p style="font-size: 10px; margin-top: 8px; color: #888; text-align: center;">
                            Demo mode - Click to simulate connection
                        </p>
                    </div>

                    <div id="walletConnected" style="display: none;">
                        <div style="text-align: center; font-size: 12px;">
                            <div style="background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; margin-bottom: 10px;" id="walletAddress"></div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>SOL: <span id="solBalance">0</span></span>
                                <span>Tokens: <span id="tokenCount">0</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Game Session -->
                <div class="panel-section">
                    <div class="section-title">🎮 Game Session</div>
                    
                    <div id="noSession">
                        <p style="color: #888; font-size: 12px; text-align: center;">
                            Connect wallet and burn tokens to start a session
                        </p>
                    </div>

                    <div id="activeSession" style="display: none;">
                        <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px; padding: 15px; text-align: center;">
                            <div style="font-weight: bold; color: #22c55e; margin-bottom: 10px;">🔴 LIVE SESSION</div>
                            <div style="font-size: 12px;">
                                <div>Tokens Burned: <span id="sessionTokens">0</span></div>
                                <div>Duration: <span id="sessionDuration">00:00</span></div>
                                <div>Current Score: <span id="currentScore">0</span></div>
                            </div>
                        </div>
                        
                        <button style="width: 100%; background: #ef4444; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 10px;" id="endSession">
                            End Session
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="panel-section">
                    <div class="section-title">📊 Quick Stats</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 9px; color: #888; margin-bottom: 5px;">SESSIONS</div>
                            <div style="font-size: 14px; font-weight: bold; color: #9945FF;">3</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 9px; color: #888; margin-bottom: 5px;">BEST</div>
                            <div style="font-size: 14px; font-weight: bold; color: #fbbf24;">1,250</div>
                        </div>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="panel-section">
                    <div class="section-title">ℹ️ How to Play</div>
                    <div style="font-size: 11px; color: #ccc; line-height: 1.4;">
                        <p>1. Connect your Solana wallet</p>
                        <p>2. Select and burn BAG tokens</p>
                        <p>3. Play the game normally</p>
                        <p>4. Your score gets recorded on-chain</p>
                        <p>5. Top players win SOL rewards!</p>
                    </div>
                    
                    <div style="margin-top: 15px; padding: 10px; background: rgba(255, 107, 53, 0.1); border: 1px solid #ff6b35; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: #ff6b35; font-weight: bold;">Next SOL Distribution</div>
                        <div style="font-size: 16px; font-weight: bold; color: #ff6b35;" id="countdown">--:--</div>
                        <div style="font-size: 10px; color: #888;">🥇 50% • 🥈 30% • 🥉 20%</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    
    // Variables de estado
    let isConnected = false;
    let isSessionActive = false;
    let sessionStartTime = null;
    let sessionInterval = null;
    
    // Event listeners
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
    
    document.getElementById('connectWallet').addEventListener('click', function() {
        if (isConnected) return;
        
        showNotification('Connecting wallet...', 'info');
        
        setTimeout(function() {
            isConnected = true;
            
            // Update UI
            document.getElementById('walletDisconnected').style.display = 'none';
            document.getElementById('walletConnected').style.display = 'block';
            document.getElementById('walletAddress').textContent = 'Bags3D...XYZ (Demo)';
            document.getElementById('solBalance').textContent = '1.234';
            document.getElementById('tokenCount').textContent = '500';
            
            showNotification('✅ Wallet connected! (Demo mode)', 'success');
            
            // Enable session start
            document.getElementById('noSession').innerHTML = `
                <button style="width: 100%; background: linear-gradient(135deg, #ff6b35, #f59e0b); color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold;" id="startSession">
                    🔥 Burn 10 BAG & Start Session
                </button>
            `;
            
            document.getElementById('startSession').addEventListener('click', startSession);
            
        }, 1500);
    });
    
    function startSession() {
        if (isSessionActive) return;
        
        showNotification('🔥 Burning tokens...', 'info');
        
        setTimeout(function() {
            isSessionActive = true;
            sessionStartTime = Date.now();
            
            // Update UI
            document.getElementById('noSession').style.display = 'none';
            document.getElementById('activeSession').style.display = 'block';
            document.getElementById('sessionTokens').textContent = '10 BAG';
            
            // Start duration counter
            sessionInterval = setInterval(updateSessionDuration, 1000);
            
            showNotification('🎉 Session started! Your score will be recorded', 'success');
            
            // Monitor game score (simplified)
            monitorGameScore();
            
        }, 2000);
    }
    
    document.addEventListener('click', function(e) {
        if (e.target.id === 'endSession') {
            endSession();
        }
    });
    
    function endSession() {
        if (!isSessionActive) return;
        
        isSessionActive = false;
        clearInterval(sessionInterval);
        
        const currentScore = document.getElementById('currentScore').textContent;
        
        // Update UI
        document.getElementById('activeSession').style.display = 'none';
        document.getElementById('noSession').style.display = 'block';
        document.getElementById('noSession').innerHTML = `
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid #22c55e; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 15px;">
                <div style="color: #22c55e; font-weight: bold;">Session Completed!</div>
                <div style="font-size: 12px; margin-top: 5px;">Final Score: ${currentScore}</div>
                <div style="font-size: 10px; color: #888; margin-top: 5px;">Score submitted to blockchain</div>
            </div>
            <button style="width: 100%; background: linear-gradient(135deg, #ff6b35, #f59e0b); color: white; border: none; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: bold;" id="startSession">
                🔥 Start New Session
            </button>
        `;
        
        document.getElementById('startSession').addEventListener('click', startSession);
        
        showNotification(`✅ Session ended! Score ${currentScore} submitted`, 'success');
    }
    
    function updateSessionDuration() {
        if (!sessionStartTime) return;
        
        const elapsed = Date.now() - sessionStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        document.getElementById('sessionDuration').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function monitorGameScore() {
        // Intentar obtener el score del juego original
        setInterval(function() {
            if (!isSessionActive) return;
            
            let score = 0;
            
            // Intentar diferentes formas de obtener el score
            if (window.game && window.game.score) {
                score = window.game.score;
            } else if (window.game && window.game.distanceRan) {
                score = Math.floor(window.game.distanceRan);
            } else {
                // Simular score incremental
                score = Math.floor((Date.now() - sessionStartTime) / 100);
            }
            
            document.getElementById('currentScore').textContent = score;
            
        }, 500);
    }
    
    function showNotification(message, type) {
        // Remove existing
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }
    
    // Start countdown
    function updateCountdown() {
        const now = Math.floor(Date.now() / 1000);
        const next = now + (1800 - (now % 1800));
        const remaining = next - now;
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        
        const element = document.getElementById('countdown');
        if (element) {
            element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();
    
    console.log('✅ Bags integration loaded successfully!');
}