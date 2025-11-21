# Mentor Front-End IA - Projeto Alura Google

Projeto de mentor de Front-End usando Google Gemini API com backend seguro em Node.js.

## 🚀 Funcionalidades

- Interface moderna e responsiva para fazer perguntas sobre Front-End
- Integração segura com Google Gemini API através de backend Node.js
- Proteção da chave da API (nunca exposta no front-end)
- Suporte a Markdown nas respostas

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (vem com Node.js)
- Chave da API do Google Gemini ([obter aqui](https://aistudio.google.com/app/apikey))

## 🔧 Instalação

1. **Clone o repositório ou baixe os arquivos**

2. **Instale as dependências do backend:**
   ```bash
   npm install
   ```

3. **Crie um arquivo `.env` na raiz do projeto:**
   ```bash
   # Windows (PowerShell)
   New-Item -Path .env -ItemType File
   
   # Linux/Mac
   touch .env
   ```

4. **Configure o arquivo `.env` com sua chave da API:**
   ```env
   GOOGLE_API_KEY=sua_chave_api_aqui
   PORT=3000
   ```
   
   **⚠️ IMPORTANTE:** Substitua `sua_chave_api_aqui` pela sua chave real obtida em [Google AI Studio](https://aistudio.google.com/app/apikey)

## ▶️ Como Executar

1. **Inicie o servidor backend:**
   ```bash
   npm start
   ```
   
   Ou para desenvolvimento com auto-reload:
   ```bash
   npm run dev
   ```

2. **Abra o arquivo `index.html` no navegador:**
   - Opção 1: Clique duas vezes no arquivo `index.html`
   - Opção 2: Use uma extensão do VS Code como "Live Server"
   - Opção 3: Use um servidor HTTP simples:
     ```bash
     # Python 3
     python -m http.server 8080
     
     # Node.js (http-server)
     npx http-server
     ```

3. **Certifique-se de que:**
   - O backend está rodando em `http://localhost:3000`
   - O front-end está acessando através de um servidor HTTP (não apenas abrindo o arquivo diretamente)

## 🔐 Segurança

- ✅ A chave da API está protegida no arquivo `.env` (não versionado)
- ✅ O arquivo `.env` está no `.gitignore` para não ser commitado
- ✅ Todas as requisições à API do Google são feitas pelo backend
- ✅ O front-end apenas se comunica com o backend local

## 📁 Estrutura do Projeto

```
projeto-alura-google/
├── server.js          # Servidor backend Node.js
├── package.json       # Dependências do projeto
├── .env              # Variáveis de ambiente (NÃO versionar!)
├── .gitignore        # Arquivos ignorados pelo Git
├── index.html        # Interface do usuário
├── script.js         # JavaScript do front-end
├── style.css         # Estilos CSS
└── README.md         # Este arquivo
```

## 🔌 API do Backend

### POST `/api/ask`

Faz uma pergunta ao Gemini através do backend seguro.

**Request:**
```json
{
  "question": "Como funciona o Grid Layout no CSS?"
}
```

**Response (sucesso):**
```json
{
  "response": "O Grid Layout é um sistema de layout bidimensional..."
}
```

**Response (erro):**
```json
{
  "error": "Mensagem de erro descritiva"
}
```

### GET `/health`

Verifica se o servidor está funcionando.

**Response:**
```json
{
  "status": "OK",
  "message": "Servidor está funcionando!"
}
```

## 🛠️ Tecnologias Utilizadas

- **Front-end:**
  - HTML5
  - CSS3 (Tailwind CSS via CDN)
  - JavaScript (Vanilla JS)
  - Marked.js (para renderizar Markdown)

- **Backend:**
  - Node.js
  - Express.js
  - dotenv (para variáveis de ambiente)
  - cors (para permitir requisições do front-end)

## ⚠️ Troubleshooting

### Erro: "Erro ao buscar a resposta. Verifique se o servidor está rodando."
- Certifique-se de que o servidor backend está rodando (`npm start`)
- Verifique se a porta 3000 está livre
- Verifique se o arquivo `.env` existe e tem a chave correta

### Erro: "Configuração do servidor incompleta"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se a variável `GOOGLE_API_KEY` está definida no `.env`

### Erro CORS no navegador
- Certifique-se de acessar o `index.html` através de um servidor HTTP (não apenas abrindo o arquivo)
- O backend já está configurado com CORS para permitir requisições do front-end

## 📝 Notas

- Este projeto foi desenvolvido como parte da Imersão Alura + Google 2025
- A chave da API nunca deve ser exposta no código front-end
- Para produção, considere usar variáveis de ambiente do seu provedor de hospedagem
- As imagens utilizadas no site (fundo e favicon) foram geradas pelo Google Gemini

## 👤 Autor

Desenvolvido por Beatriz Martins | Imersão Alura + Google 2025
