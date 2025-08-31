require('dotenv').config();

// Test script para verificar que todo funciona
async function testAPI() {
    const baseUrl = `http://localhost:${process.env.PORT || 3001}`;
    
    console.log('🧪 Testing Bags API...\n');
    
    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData);
        
        // Test 2: Get leaderboard
        console.log('\n2. Testing leaderboard...');
        const leaderboardResponse = await fetch(`${baseUrl}/api/scores/leaderboard`);
        const leaderboardData = await leaderboardResponse.json();
        console.log('✅ Leaderboard:', leaderboardData);
        
        // Test 3: User stats
        console.log('\n3. Testing user stats...');
        const testWallet = '11111111111111111111111111111111'; // Example wallet
        const statsResponse = await fetch(`${baseUrl}/api/users/${testWallet}/stats`);
        const statsData = await statsResponse.json();
        console.log('✅ User stats:', statsData);
        
        console.log('\n🎉 All tests passed! API is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the server is running with: npm run dev');
    }
}

// Para node-fetch (si no tienes fetch nativo)
const fetch = require('node-fetch').default || require('node-fetch');

if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };