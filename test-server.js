// Script simples para testar se o servidor está funcionando
// Execute: node test-server.js

async function testServer() {
    try {
        console.log('🧪 Testando conexão com o servidor...\n');
        
        // Testa a rota raiz
        const rootResponse = await fetch('http://localhost:3000/');
        if (rootResponse.ok) {
            const data = await rootResponse.json();
            console.log('✅ Servidor está funcionando!');
            console.log('📋 Resposta:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Servidor retornou erro:', rootResponse.status);
        }
        
        // Testa a rota health
        console.log('\n🧪 Testando rota /health...');
        const healthResponse = await fetch('http://localhost:3000/health');
        if (healthResponse.ok) {
            const data = await healthResponse.json();
            console.log('✅ Rota /health está funcionando!');
            console.log('📋 Resposta:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Rota /health retornou erro:', healthResponse.status);
        }
        
        // Testa a rota /api/ask
        console.log('\n🧪 Testando rota /api/ask...');
        const askResponse = await fetch('http://localhost:3000/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: 'O que é CSS?' })
        });
        
        if (askResponse.ok) {
            const data = await askResponse.json();
            console.log('✅ Rota /api/ask está funcionando!');
            console.log('📋 Resposta recebida (primeiros 100 caracteres):', data.response?.substring(0, 100) + '...');
        } else {
            const error = await askResponse.json();
            console.log('⚠️  Rota /api/ask retornou erro:', askResponse.status);
            console.log('📋 Erro:', JSON.stringify(error, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Erro ao conectar com o servidor:', error.message);
        console.log('\n💡 Dicas:');
        console.log('   1. Certifique-se de que o servidor está rodando (npm start)');
        console.log('   2. Verifique se a porta 3000 está livre');
        console.log('   3. Verifique se o arquivo .env existe e tem a GOOGLE_API_KEY configurada');
    }
}

testServer();

