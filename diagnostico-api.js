// Script de diagnóstico para testar a API do Google Gemini
// Execute: node diagnostico-api.js

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function diagnosticoAPI() {
    console.log('🔍 Diagnóstico da API do Google Gemini\n');
    console.log('=' .repeat(50));

    // 1. Verificar arquivo .env
    console.log('\n1️⃣ Verificando arquivo .env...');
    try {
        const envPath = join(__dirname, '.env');
        const envContent = readFileSync(envPath, 'utf-8');
        
        if (envContent.includes('GOOGLE_API_KEY')) {
            const match = envContent.match(/GOOGLE_API_KEY=(.+)/);
            if (match) {
                const key = match[1].trim();
                if (key && key !== 'sua_chave_api_aqui' && !key.includes('SUA_API_KEY')) {
                    console.log('✅ Arquivo .env encontrado e contém GOOGLE_API_KEY');
                    console.log(`   Primeiros caracteres: ${key.substring(0, 10)}...`);
                } else {
                    console.log('❌ GOOGLE_API_KEY está com valor placeholder');
                    console.log('   Certifique-se de configurar sua chave real no arquivo .env');
                    return;
                }
            }
        } else {
            console.log('❌ GOOGLE_API_KEY não encontrada no arquivo .env');
            return;
        }
    } catch (error) {
        console.log('❌ Erro ao ler arquivo .env:', error.message);
        console.log('   Certifique-se de que o arquivo .env existe na raiz do projeto');
        return;
    }

    // 2. Verificar variável de ambiente
    console.log('\n2️⃣ Verificando variável de ambiente...');
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY || API_KEY.trim() === '') {
        console.log('❌ GOOGLE_API_KEY não está definida nas variáveis de ambiente');
        console.log('   Execute: dotenv.config() ou reinicie o servidor após criar o .env');
        return;
    }
    console.log('✅ GOOGLE_API_KEY carregada com sucesso');

    // 3. Testar diferentes modelos
    console.log('\n3️⃣ Testando modelos disponíveis...');
    const modelos = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-pro-vision'
    ];

    for (const modelo of modelos) {
        console.log(`\n   Testando modelo: ${modelo}...`);
        
        try {
            const contents = [
                {
                    role: "user",
                    parts: [{ text: "Diga apenas 'OK' se você conseguir responder." }]
                }
            ];

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents })
                }
            );

            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Modelo ${modelo} funcionando!`);
                console.log(`   📋 Resposta: ${data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50) || 'Resposta recebida'}`);
                console.log(`\n🎉 Use este modelo no server.js: ${modelo}`);
                return;
            } else {
                const errorData = await response.json();
                console.log(`   ❌ Modelo ${modelo} falhou (status ${response.status})`);
                console.log(`   📋 Erro: ${errorData.error?.message || JSON.stringify(errorData).substring(0, 100)}`);
                
                if (response.status === 401 || response.status === 403) {
                    console.log('\n⚠️  ERRO CRÍTICO: Chave da API inválida ou sem permissão!');
                    console.log('   Verifique:');
                    console.log('   1. Se a chave está correta no arquivo .env');
                    console.log('   2. Se a API do Gemini está habilitada no seu projeto Google Cloud');
                    console.log('   3. Se a chave está ativa em https://aistudio.google.com/app/apikey');
                    return;
                }
            }
        } catch (error) {
            console.log(`   ❌ Erro ao testar modelo ${modelo}: ${error.message}`);
        }
    }

    console.log('\n❌ Nenhum modelo funcionou. Verifique sua chave de API.');
}

diagnosticoAPI().catch(console.error);

