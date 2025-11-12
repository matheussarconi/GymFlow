# GymFlow: Gamificando a Jornada Fitness e o Bem-Estar Mental

## 🚀 Visão Geral do Projeto

**GymFlow** é um aplicativo móvel inovador projetado para transformar a prática de atividades físicas em uma experiência **gamificada** e motivadora. Nosso principal objetivo é incentivar a consistência nos exercícios, ao mesmo tempo que destacamos e quantificamos os **benefícios diretos na saúde mental** dos usuários.

Em um mundo onde a motivação para o exercício pode ser um desafio, o GymFlow utiliza mecânicas de jogo para tornar a jornada fitness mais envolvente, recompensadora e, acima de tudo, focada no bem-estar integral.

## ✨ Principais Funcionalidades

### 1. Gamificação da Atividade Física
*   **Pontuação e Níveis:** Os usuários ganham pontos e sobem de nível ao completar treinos, registrar progresso e manter a consistência.
*   **Missões e Desafios:** Desafios diários e semanais personalizados para manter o engajamento e incentivar a experimentação de novos exercícios.
*   **Recompensas e Conquistas:** Desbloqueio de medalhas, títulos e itens virtuais ao atingir marcos importantes na jornada fitness.
*   **Ranking Competitivo:** Um sistema de ranking que permite aos usuários competir de forma amigável com amigos ou a comunidade global, promovendo a motivação social.

### 2. Foco na Saúde Mental
*   **Registro de Humor (Mood Tracker):** Funcionalidade que permite aos usuários registrar seu estado emocional antes e depois dos exercícios, criando uma correlação visual entre a atividade física e a melhora do humor.
*   **Insights Personalizados:** Geração de relatórios que demonstram como a consistência nos treinos impacta positivamente a redução do estresse, a melhora do sono e o aumento da sensação de bem-estar.
*   **Conteúdo Educacional:** Seção dedicada a artigos e dicas sobre a conexão mente-corpo, destacando a ciência por trás dos benefícios do exercício para a saúde mental.

### 3. Gerenciamento de Treinos
*   **Planos de Treino Personalizados:** Criação e acompanhamento de planos de treino com base nos objetivos e nível de experiência do usuário.
*   **Biblioteca de Exercícios:** Um vasto catálogo de exercícios com imagens (ex: `crucifixo.webp`, `supino.webp`, `tricepsFrances.jpg`) e descrições detalhadas.
*   **Registro de Progresso:** Acompanhamento de cargas, repetições e tempo de descanso para monitorar a evolução física.

## 🛠️ Stack Tecnológico

O projeto GymFlow é dividido em duas partes principais: um backend robusto e um frontend móvel moderno.

### Backend (API)
| Tecnologia | Descrição |
| :--- | :--- |
| **Node.js/Express** | Ambiente de execução e framework para a construção da API RESTful. |
| **MySQL** | Banco de dados relacional para armazenamento de dados de usuários, treinos, rankings e registros de humor. |
| **JWT (JSON Web Tokens)** | Utilizado para autenticação segura e autorização de usuários. |
| **Bcrypt.js** | Biblioteca para hash seguro de senhas. |
| **Multer** | Middleware para manipulação de uploads de arquivos (ex: imagens de perfil e exercícios). |
| **CORS** | Configuração para permitir requisições do frontend. |

### Frontend (Aplicativo Móvel)
| Tecnologia | Descrição |
| :--- | :--- |
| **React Native (Expo)** | Framework para desenvolvimento de aplicativos móveis multiplataforma (iOS e Android). |
| **React Navigation** | Gerenciamento de navegação entre as telas do aplicativo. |
| **Context API** | Gerenciamento de estado global (ex: `AuthContext.js`) para dados de autenticação. |
| **Estrutura Modular** | Organização clara em `screens`, `components`, `context` e `services` (ex: `api.js`). |

## ⚙️ Estrutura do Projeto

O projeto está organizado em um diretório principal `GymFlow2.0` com as pastas `backend` e `frontend`.

```
GymFlow/
├── GymFlow2.0/
│   ├── backend/
│   │   ├── db.sql               # Script de criação do banco de dados
│   │   ├── db_config.js         # Configuração de conexão com o MySQL
│   │   ├── server.js            # Ponto de entrada da API
│   │   ├── jwt.js               # Lógica de JWT
│   │   ├── package.json         # Dependências do backend
│   │   └── uploads/             # Diretório para arquivos estáticos (imagens)
│   │       ├── exercicios/
│   │       └── profilePictures/
│   └── frontend/
│       ├── App.js               # Componente principal
│       ├── app.json             # Configurações do Expo
│       ├── package.json         # Dependências do frontend
│       └── src/
│           ├── screens/         # Telas principais (Login, Home, Ranking, MoodScreen, etc.)
│           ├── components/      # Componentes reutilizáveis
│           ├── context/         # Contextos de estado (AuthContext)
│           └── services/        # Serviços de API (api.js)
├── LICENSE
└── README.md (Este arquivo)
```

## 💻 Como Executar o Projeto

### Pré-requisitos

*   Node.js (versão recomendada: 18+)
*   MySQL Server
*   Expo CLI (instalado globalmente: `npm install -g expo-cli`)

### 1. Configuração do Backend

1.  Navegue até o diretório do backend:
    ```bash
    cd GymFlow/GymFlow2.0/backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
    *(Dependências incluem: `express`, `cors`, `mysql2`, `multer`, `bcryptjs`, `jsonwebtoken`, `dotenv`)*
3.  Configure o banco de dados:
    *   Crie um banco de dados MySQL.
    *   Importe o esquema do banco de dados usando o arquivo `db.sql`.
    *   Crie um arquivo `.env` na pasta `backend` com suas credenciais de banco de dados (exemplo: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
4.  Inicie o servidor:
    ```bash
    node server.js
    # Ou use nodemon para desenvolvimento: nodemon server.js
    ```
    O servidor da API estará rodando em `http://localhost:3000` (porta padrão).

### 2. Configuração do Frontend

1.  Navegue até o diretório do frontend:
    ```bash
    cd GymFlow/GymFlow2.0/frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
    *(O arquivo `readme.md` original sugere a instalação de `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context` e `@expo/metro-runtime`)*
3.  Inicie o aplicativo Expo:
    ```ba## 💻 Como Executar o Projeto

Para colocar o GymFlow em funcionamento, você precisará configurar o ambiente de desenvolvimento, instalar as dependências do Backend (API) e do Frontend (Aplicativo Móvel), e configurar o banco de dados.

### Pré-requisitos

Certifique-se de ter os seguintes softwares instalados em sua máquina:

*   **Node.js:** Versão recomendada 18+ (necessário para o Backend e para o ambiente React Native/Expo).
*   **MySQL Server:** Para o banco de dados.
*   **Expo CLI:** Instalado globalmente para gerenciar o projeto React Native.
    ```bash
    npm install -g expo-cli
    ```

### 1. Configuração do Backend (API)

O Backend é responsável pela lógica de negócios, autenticação e comunicação com o banco de dados.

1.  **Navegue** até o diretório do backend:
    ```bash
    cd GymFlow/GymFlow2.0/backend
    ```
2.  **Instale as dependências** do Node.js:
    ```bash
    npm install
    ```
    *As dependências incluem: `express`, `cors`, `mysql2`, `multer`, `bcryptjs`, `jsonwebtoken`, `dotenv`.*
3.  **Configuração do Banco de Dados:**
    *   Crie um banco de dados MySQL vazio (ex: `gymflow`).
    *   Importe o esquema do banco de dados usando o arquivo `db.sql` para criar as tabelas necessárias.
   3.  **Configure as Variáveis de Ambiente**:
    O *backend* precisa das credenciais do banco de dados. encontre o arquivo `db_config.js` na pasta `Gymflow-Main/Gymflow2.0/backend` e adicione as seguintes variáveis (ajuste os valores do query conforme sua configuração):

    ```js
    const connection = mysql.createConnection({
    host: 'SEU_HOST',
    user: 'SEU_USER',
    password:'SUA_SENHA',
    database: 'gymflow'
    })
    ```
4.  **Inicie o Servidor:**
    ```bash
    node server.js
    # Para desenvolvimento, use o nodemon (se instalado): nodemon server.js
    ```
    O servidor da API estará rodando em `http://localhost:3000` (porta padrão).

### 2. Configuração do Frontend (Aplicativo Móvel)

O Frontend é o aplicativo móvel desenvolvido em React Native/Expo. E para iniciar o frontend é necessário criar um novo terminall

1.  **Navegue** até o diretório do frontend:
    ```bash
    cd GymFlow/GymFlow2.0/frontend
    ```
2.  **Instale as dependências** do React Native:
    ```bash
    npm install
    ```
3.  **Instale as dependências de navegação** e outras bibliotecas nativas (conforme o `readme.md` original):
    ```bash
    npm install @react-navigation/native @react-navigation/native-stack
    npx expo install react-native-screens react-native-safe-area-context @expo/metro-runtime
    ```
4.  **Ajuste a Conexão da API:**
    *   O arquivo `GymFlow/GymFlow2.0/frontend/src/services/api.js` provavelmente contém a URL base da API.
    *   **Importante:** Se você estiver testando em um dispositivo físico ou emulador, substitua `localhost` pelo **endereço IP da sua máquina** na rede local para que o aplicativo possa se conectar ao servidor backend.
5.  **Inicie o Aplicativo Expo:**
    ```bash
    npx expo start
    ```
6.  **Execute:**
    *   Use o aplicativo **Expo Go** no seu celular (iOS ou Android) para escanear o QR code exibido no terminal ou no navegador.
    *   Alternativamente, use as opções do Expo CLI para rod## 💻 Como Executar o Projeto: Guia de Comandos

Este guia fornece os comandos de terminal necessários para configurar e iniciar o projeto GymFlow.

### 1. Configuração Inicial (Pré-requisitos)

Antes de começar, certifique-se de ter o **Node.js**, **MySQL Server** e o **Expo CLI** instalados.

1.  **Instalar o Expo CLI Globalmente:**
    ```bash
    npm install -g expo-cli
    ```
2.  **Navegar para o Diretório do Projeto:**
    ```bash
    cd GymFlow/GymFlow2.0
    ```

### 2. Configuração e Inicialização do Backend (API)

O Backend deve ser iniciado primeiro, pois o Frontend depende dele.

1.  **Navegar para o Diretório do Backend:**
    ```bash
    cd backend
    ```
2.  **Instalar as Dependências do Backend:**
    ```bash
    npm install
    ```
    *Isso instalará todas as dependências listadas no `package.json` (Express, MySQL2, JWT, etc.).*
3.  **Configurar o Banco de Dados:**
    *   Crie o banco de dados MySQL e importe o esquema usando o arquivo `db.sql`.
    *   Crie o arquivo de variáveis de ambiente **`.env`** com suas credenciais de banco de dados.
4.  **Iniciar o Servidor da API:**
    ```bash
    node server.js
    ```
    *O servidor estará ativo em `http://localhost:3000` (porta padrão). Para desenvolvimento contínuo, você pode usar `nodemon server.js` se tiver o `nodemon` instalado.*
5.  **Voltar ao Diretório Principal do Projeto:**
    ```bash
    cd ..
    ```

### 3. Configuração e Inicialização do Frontend (Aplicativo Móvel)

O Frontend é o aplicativo móvel desenvolvido em React Native/Expo.

1.  **Navegar para o Diretório do Frontend:**
    ```bash
    cd frontend
    ```
2.  **Instalar as Dependências Principais do Frontend:**
    ```bash
    npm install
    ```
3.  **Instalar Dependências de Navegação e Nativas:**
    *   Estas são dependências específicas para o sistema de navegação e componentes nativos do Expo.
    ```bash
    npm install @react-navigation/native @react-navigation/native-stack
    npx expo install react-native-screens react-native-safe-area-context @expo/metro-runtime
    ```
4.  **Ajustar a Conexão da API (Passo Crucial):**
    *   Edite o arquivo `src/services/api.js`.
    *   Se você estiver testando em um dispositivo físico ou emulador, **substitua `localhost` pelo endereço IP da sua máquina** na rede local para que o aplicativo possa se comunicar com o servidor backend.
5.  **Iniciar o Aplicativo Expo:**
    ```bash
    npx expo start
    ```
    *Isso abrirá o Metro Bundler no seu navegador e exibirá um QR Code no terminal.*
6.  **Executar no Dispositivo:**
    *   Use o aplicativo **Expo Go** no seu celular (iOS ou Android) para escanear o QR code e visualizar o GymFlow.
    *   Alternativamente, use as opções do Expo CLI para rodar em um simulador/emulador.

**Lembre-se:** O Backend (`node server.js`) deve estar rodando ativamente antes de iniciar o Frontend## 🤝 ContribuiçãoContribuições são bem-vindas! Se você tiver sugestões de melhorias, novas funcionalidades (especialmente na área de gamificação ou saúde mental) ou correções de bugs, sinta-se à vontade para:

1.  Fazer um **Fork** do projeto.
2.  Criar uma nova **Branch** (`git checkout -b feature/NovaFuncionalidade`).
3.  Fazer o **Commit** das suas alterações (`git commit -m 'feat: Adiciona nova funcionalidade X'`).
4.  Fazer o **Push** para a Branch (`git push origin feature/NovaFuncionalidade`).
5.  Abrir um **Pull Request**.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

Desenvolvido por: Matheus Sarconi

[//]: # (Fim do README)
