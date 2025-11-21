import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Configura __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite requisições do front-end
app.use(express.json()); // Permite parsing de JSON

// Serve arquivos estáticos (HTML, CSS, JS, assets)
app.use(express.static(__dirname));

// Rota raiz serve o index.html (front-end)
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Rota para fazer perguntas ao Gemini
app.post('/api/ask', async (req, res) => {
    try {
        const { question } = req.body;

        // Validação básica
        if (!question || !question.trim()) {
            return res.status(400).json({ 
                error: 'Por favor, forneça uma pergunta válida.' 
            });
        }

        const API_KEY = process.env.GOOGLE_API_KEY;

        // Validação completa da API_KEY
        if (!API_KEY || API_KEY.trim() === '' || API_KEY === 'sua_chave_api_aqui' || API_KEY.includes('SUA_API_KEY')) {
            console.error('GOOGLE_API_KEY não está configurada corretamente no arquivo .env');
            return res.status(500).json({ 
                error: 'A chave da API do Google não está configurada corretamente. Verifique o arquivo .env na raiz do projeto e certifique-se de que GOOGLE_API_KEY está definida com sua chave real obtida em https://aistudio.google.com/app/apikey' 
            });
        }

        // Configuração do prompt para o Gemini
        const contents = [
            {
                role: "user",
                parts: [
                    { 
                        text: `Você é um mentor de Front-End experiente e didático. Explique de forma resumida e dê um exemplo de código para: ${question.trim()}` 
                    }
                ]
            }
        ];

        // Faz a requisição para a API do Google Gemini
        // Lista de modelos para tentar em ordem de preferência
        // Modelos atualizados baseados na lista disponível da API (2025)
        const modelos = [
            'gemini-2.5-flash',     // Modelo mais atualizado e recomendado (confirmado funcionando)
            'gemini-flash-latest',  // Versão "latest" do Flash
            'gemini-2.5-flash-lite', // Versão lite mais leve
            'gemini-2.0-flash-001',  // Versão estável do 2.0
            'gemini-pro-latest'      // Fallback com versão "latest"
        ];

        let response = null;
        let modelUsado = null;
        let ultimoErro = null;

        // Tenta cada modelo até encontrar um que funcione
        for (const model of modelos) {
            try {
                modelUsado = model;
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
                
                console.log(`📤 Tentando modelo: ${model}`);
                
                response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents })
                });

                if (response.ok) {
                    console.log(`✅ Modelo ${model} funcionou!`);
                    break; // Modelo funcionou, sai do loop
                } else {
                    const errorData = await response.json();
                    ultimoErro = { model, status: response.status, errorData };
                    console.log(`❌ Modelo ${model} falhou (status ${response.status})`);
                    
                    // Se for erro 404 (modelo não encontrado), tenta o próximo
                    if (response.status === 404) {
                        continue;
                    } else {
                        // Outro tipo de erro, para aqui
                        break;
                    }
                }
            } catch (error) {
                console.error(`Erro ao tentar modelo ${model}:`, error.message);
                ultimoErro = { model, error: error.message };
                continue; // Tenta o próximo modelo
            }
        }

        // Verifica se nenhum modelo funcionou
        if (!response || !response.ok) {
            let errorMessage = 'Erro ao comunicar com a API do Google.';
            let errorDetails = ultimoErro?.errorData || null;

            // Se tentou todos os modelos e falhou com 404, modelo não encontrado
            if (ultimoErro?.status === 404 || (response && response.status === 404)) {
                errorMessage = 'Modelo não encontrado na API do Google.';
                errorMessage += '\n\nOs modelos antigos podem não estar mais disponíveis.';
                errorMessage += '\nExecute: npm run diagnostico';
                errorMessage += '\n\nPara ver quais modelos estão disponíveis e funcionam com sua chave.';
            } else {
                try {
                    let errorData = {};
                    if (response) {
                        errorData = await response.json();
                    } else if (ultimoErro?.errorData) {
                        errorData = ultimoErro.errorData;
                    }
                    errorDetails = errorData;
                    console.error('Erro da API do Google:', JSON.stringify(errorData, null, 2));
                
                // Mensagens de erro mais específicas baseadas no status HTTP
                const statusCode = response?.status || ultimoErro?.status || 500;
                if (statusCode === 400) {
                    errorMessage = 'Requisição inválida para a API do Google.';
                    if (errorData.error?.message) {
                        errorMessage += `\n\nErro: ${errorData.error.message}`;
                        // Se for erro de modelo não encontrado, sugere alternativa
                        if (errorData.error.message.includes('model') || errorData.error.message.includes('not found')) {
                            errorMessage += '\n\n💡 Dica: O modelo pode estar incorreto. Verifique os modelos disponíveis em https://ai.google.dev/models';
                        }
                    }
                } else if (statusCode === 401 || statusCode === 403) {
                    errorMessage = '❌ Chave da API inválida ou sem permissão.\n\n';
                    errorMessage += 'Verifique:\n';
                    errorMessage += '1. Se sua GOOGLE_API_KEY no arquivo .env está correta\n';
                    errorMessage += '2. Se a chave está ativa em https://aistudio.google.com/app/apikey\n';
                    errorMessage += '3. Se a API do Gemini está habilitada no seu projeto Google Cloud';
                    if (errorData.error?.message) {
                        errorMessage += `\n\nDetalhes técnicos: ${errorData.error.message}`;
                    }
                } else if (statusCode === 429) {
                    errorMessage = '⏳ Limite de requisições excedido. Aguarde um momento e tente novamente.';
                } else if (statusCode === 500 || statusCode === 503) {
                    errorMessage = '🔧 Erro no servidor do Google. Tente novamente em alguns instantes.';
                } else {
                    errorMessage = `Erro ao comunicar com a API do Google (status ${statusCode}).`;
                    if (errorData.error?.message) {
                        errorMessage += `\n\nDetalhes: ${errorData.error.message}`;
                    }
                }
                } catch (parseError) {
                    console.error('Erro ao parsear resposta de erro:', parseError);
                    if (!errorMessage.includes('Modelo não encontrado')) {
                        errorMessage = `Erro ao comunicar com a API do Google. Verifique sua chave de API no arquivo .env.`;
                    }
                }
            }

            const statusCode = response?.status || ultimoErro?.status || 500;
            return res.status(statusCode).json({ 
                error: errorMessage,
                details: errorDetails,
                modeloTentado: modelUsado
            });
        }

        // Se chegou aqui, um modelo funcionou!
        console.log(`✅ Usando modelo: ${modelUsado}`);
        const data = await response.json();

        // Verifica se há resposta válida
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return res.status(500).json({ 
                error: 'Resposta inválida da API do Google.' 
            });
        }

        const aiResponse = data.candidates[0].content.parts[0].text;

        // Retorna a resposta
        res.json({ 
            response: aiResponse 
        });

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ 
            error: 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.' 
        });
    }
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor está funcionando!' });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📝 Use a rota POST /api/ask para fazer perguntas`);
});

