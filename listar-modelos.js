// Script para listar modelos disponíveis na API do Google Gemini
// Execute: node listar-modelos.js

import dotenv from 'dotenv';

dotenv.config();

async function listarModelos() {
    console.log('🔍 Listando modelos disponíveis na API do Google Gemini\n');
    console.log('=' .repeat(50));

    const API_KEY = process.env.GOOGLE_API_KEY;

    if (!API_KEY) {
        console.error('❌ GOOGLE_API_KEY não configurada no arquivo .env');
        return;
    }

    // Tenta diferentes versões da API
    const versoesAPI = ['v1beta', 'v1'];
    
    for (const versao of versoesAPI) {
        console.log(`\n📡 Tentando versão da API: ${versao}`);
        console.log('-'.repeat(50));

        try {
            const url = `https://generativelanguage.googleapis.com/${versao}/models?key=${API_KEY}`;
            
            console.log(`📤 Fazendo requisição: ${url.substring(0, 80)}...`);
            
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                
                console.log(`✅ Versão ${versao} funcionou!\n`);
                console.log(`📋 Total de modelos encontrados: ${data.models?.length || 0}\n`);

                if (data.models && data.models.length > 0) {
                    console.log('📝 Modelos disponíveis:');
                    console.log('=' .repeat(50));
                    
                    // Filtra modelos que suportam generateContent
                    const modelosGenerateContent = data.models.filter(model => 
                        model.supportedGenerationMethods?.includes('generateContent') ||
                        model.supportedMethods?.includes('generateContent') ||
                        true // Mostra todos mesmo assim
                    );

                    modelosGenerateContent.forEach((model, index) => {
                        console.log(`\n${index + 1}. Nome: ${model.name}`);
                        console.log(`   Nome curto: ${model.name?.split('/').pop()}`);
                        console.log(`   Display Name: ${model.displayName || 'N/A'}`);
                        console.log(`   Description: ${model.description || 'N/A'}`);
                        
                        const methods = model.supportedGenerationMethods || model.supportedMethods || [];
                        if (methods.length > 0) {
                            console.log(`   Métodos suportados: ${methods.join(', ')}`);
                        }
                        
                        // Tenta fazer uma requisição de teste com este modelo
                        const nomeCurto = model.name?.split('/').pop();
                        if (nomeCurto && methods.includes('generateContent')) {
                            console.log(`   ✅ Suporta generateContent`);
                            console.log(`   💡 Use este modelo: ${nomeCurto}`);
                        }
                    });

                    // Tenta testar os primeiros modelos que suportam generateContent
                    console.log('\n\n🧪 Testando modelos que suportam generateContent...');
                    console.log('=' .repeat(50));

                    for (const model of modelosGenerateContent.slice(0, 5)) { // Testa os primeiros 5
                        const nomeCurto = model.name?.split('/').pop();
                        const methods = model.supportedGenerationMethods || model.supportedMethods || [];
                        
                        if (nomeCurto && methods.includes('generateContent')) {
                            console.log(`\n📤 Testando modelo: ${nomeCurto}...`);
                            
                            try {
                                const testUrl = `https://generativelanguage.googleapis.com/${versao}/models/${nomeCurto}:generateContent?key=${API_KEY}`;
                                
                                const testResponse = await fetch(testUrl, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        contents: [{
                                            role: "user",
                                            parts: [{ text: "Diga apenas 'OK'." }]
                                        }]
                                    })
                                });

                                if (testResponse.ok) {
                                    const testData = await testResponse.json();
                                    console.log(`   ✅ Modelo ${nomeCurto} FUNCIONOU!`);
                                    console.log(`   📋 Resposta: ${testData.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50) || 'OK'}`);
                                    console.log(`\n🎉 MODELO FUNCIONAL ENCONTRADO:`);
                                    console.log(`   Use no server.js: const model = '${nomeCurto}';`);
                                    console.log(`   Versão da API: ${versao}`);
                                    return; // Encontrou um modelo funcional, para aqui
                                } else {
                                    const errorData = await testResponse.json();
                                    console.log(`   ❌ Falhou (status ${testResponse.status})`);
                                    console.log(`   📋 Erro: ${errorData.error?.message?.substring(0, 80) || 'Erro desconhecido'}...`);
                                }
                            } catch (error) {
                                console.log(`   ❌ Erro ao testar: ${error.message}`);
                            }
                        }
                    }

                    console.log(`\n✅ Versão ${versao} está funcionando!`);
                    console.log(`💡 Use a versão da API: ${versao}`);
                    return; // Encontrou modelos, para aqui
                } else {
                    console.log('⚠️ Nenhum modelo encontrado na resposta');
                }
            } else {
                const errorData = await response.json();
                console.log(`❌ Versão ${versao} falhou (status ${response.status})`);
                console.log(`📋 Erro: ${errorData.error?.message || JSON.stringify(errorData).substring(0, 100)}`);
            }
        } catch (error) {
            console.log(`❌ Erro ao tentar versão ${versao}: ${error.message}`);
        }
    }

    console.log('\n❌ Nenhuma versão da API funcionou ou nenhum modelo encontrado.');
    console.log('💡 Verifique se sua chave da API está correta e ativa.');
}

listarModelos().catch(console.error);

