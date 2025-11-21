
// URL do backend (ajuste conforme necessário)
const BACKEND_URL = 'http://localhost:3000';

// Verifica se o servidor está rodando ao carregar a página
async function checkServer() {
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        if (response.ok) {
            console.log('✅ Servidor backend está conectado!');
            return true;
        }
    } catch (error) {
        console.error('❌ Servidor backend não está respondendo:', error.message);
        console.log('💡 Certifique-se de que o servidor está rodando: npm start');
        return false;
    }
}

// Verifica a conexão ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    checkServer();
});

async function askGemini() {
    const questionInput = document.getElementById('question');
    const resultDiv = document.getElementById('result');
    const responseText = document.getElementById('response-text');
    const loading = document.getElementById('loading');

    const prompt = questionInput.value.trim();

    if (!prompt) {
        alert("Por favor, digite uma dúvida!");
        return;
    }

    // UI: Mostrar loading e esconder resultado anterior
    loading.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    try {
        // Faz requisição para o backend seguro
        const response = await fetch(`${BACKEND_URL}/api/ask`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ question: prompt })
        });

        const data = await response.json();

        if (!response.ok) {
            // Tenta obter mensagem de erro mais detalhada
            const errorMsg = data.error || data.message || 'Erro ao buscar resposta';
            throw new Error(errorMsg);
        }

        const aiResponse = data.response || data.message;

        // Converter Markdown para HTML usando a lib 'marked'
        responseText.innerHTML = marked.parse(aiResponse);

        // UI: Mostrar resultado
        resultDiv.classList.remove('hidden');

    } catch (error) {
        console.error("Erro:", error);
        let errorMessage = 'Ocorreu um erro ao buscar a resposta.';
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = `
                <p class='text-red-400 mb-2'><strong>❌ Erro de conexão com o servidor!</strong></p>
                <p class='text-slate-400 text-sm mb-2'>O servidor backend não está respondendo.</p>
                <p class='text-slate-400 text-sm'>💡 Certifique-se de que o servidor está rodando:</p>
                <p class='text-slate-400 text-sm font-mono bg-slate-900 p-2 rounded mt-2'>npm start</p>
            `;
        } else {
            errorMessage = `<p class='text-red-400'>${error.message || errorMessage}</p>`;
        }
        
        responseText.innerHTML = errorMessage;
        resultDiv.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}