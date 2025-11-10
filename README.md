# 📋 Projeto Scrum Board

Plataforma web colaborativa para gerenciamento ágil de projetos, inspirada no Trello, desenvolvida com React e Firebase.

## 🎯 Sobre o Projeto

Este projeto foi desenvolvido como parte da disciplina de Computação em Nuvem, aplicando os princípios e papéis do framework SCRUM no desenvolvimento de uma aplicação real. A plataforma permite que equipes organizem, priorizem e acompanhem tarefas de forma colaborativa e transparente.

## ✨ Funcionalidades

### 🔐 Autenticação
- Login e cadastro com email/senha (Firebase Authentication)
- Persistência de sessão automática
- Proteção de rotas

### 👥 Sistema de Equipes
- Criar múltiplas equipes de trabalho
- Convidar membros por email
- Visualizar membros da equipe
- Isolamento de dados por equipe

### 📊 Board Scrum
- 4 colunas padrão: **Backlog**, **To Do**, **Doing**, **Done**
- Criar, editar e excluir cards (tarefas)
- Arrastar e soltar cards entre colunas (Drag & Drop)
- Cada card contém:
  - Título
  - Descrição
  - Responsável (autor)
  - Data de criação
- Sincronização em tempo real entre usuários

## 🚀 Tecnologias Utilizadas

- **React 19** - Biblioteca para construção da interface
- **Firebase** - Backend as a Service
  - Authentication (autenticação)
  - Firestore (banco de dados NoSQL em tempo real)
  - Analytics
- **@hello-pangea/dnd** - Biblioteca para drag-and-drop
- **CSS3** - Estilização customizada

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Conta no Firebase (já configurada no projeto)

### Passo a Passo

1. **Clone o repositório ou baixe os arquivos**
   ```bash
   cd "c:\Users\mader\OneDrive\Documentos\Computação em Nuvem\projetoscrum"
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto em modo desenvolvimento**
   ```bash
   npm start
   ```

4. **Acesse no navegador**
   
   Abra [http://localhost:3000](http://localhost:3000)

### Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

## 🧪 Testes

Execute os testes automatizados:

```bash
npm test
```

## 🎭 Papéis SCRUM no Projeto

### Product Owner (PO)
**Responsabilidades:**
- Definir e priorizar o backlog do produto
- Garantir que a equipe entenda os requisitos
- Validar entregas e aceitar funcionalidades
- Representar os stakeholders

**Funcionalidades relacionadas:**
- Criar e priorizar cards no backlog
- Mover cards entre as colunas conforme prioridade
- Revisar cards na coluna "Done"

### Scrum Master (SM)
**Responsabilidades:**
- Facilitar cerimônias ágeis (Daily, Planning, Review, Retrospective)
- Remover impedimentos da equipe
- Garantir que o processo SCRUM seja seguido
- Promover melhoria contínua

**Funcionalidades relacionadas:**
- Visualizar o board completo para identificar gargalos
- Gerenciar membros da equipe
- Facilitar a organização dos cards

### Equipe de Desenvolvimento (Dev Team)
**Responsabilidades:**
- Implementar as funcionalidades priorizadas
- Estimar esforço das tarefas
- Auto-organização e colaboração
- Entregar incrementos funcionais

**Funcionalidades relacionadas:**
- Criar e editar cards
- Mover cards de "To Do" → "Doing" → "Done"
- Adicionar descrições detalhadas nas tarefas
- Visualizar tarefas atribuídas

## 📱 Estrutura do Projeto

```
src/
├── components/
│   ├── Auth/           # Login e Signup
│   ├── Board/          # Board principal com listas
│   ├── Card/           # Componente de card
│   └── Dashboard/      # Dashboard de equipes
├── contexts/
│   └── AuthContext.js  # Contexto de autenticação
├── firebase.js         # Configuração do Firebase
├── App.js              # Componente principal
└── index.js            # Ponto de entrada
```

## 🔥 Estrutura do Firestore

### Coleções:

**users/**
- `uid` (string) - ID do usuário
- `email` (string)
- `displayName` (string)
- `createdAt` (timestamp)
- `teams` (array) - IDs das equipes

**teams/**
- `name` (string)
- `createdBy` (string) - UID do criador
- `members` (array) - UIDs dos membros
- `memberEmails` (array)
- `createdAt` (timestamp)

**lists/**
- `teamId` (string)
- `name` (string) - Ex: "Backlog", "To Do", "Doing", "Done"
- `order` (number)
- `createdAt` (timestamp)

**cards/**
- `teamId` (string)
- `listId` (string)
- `title` (string)
- `description` (string)
- `order` (number)
- `createdBy` (string)
- `createdByName` (string)
- `createdAt` (timestamp)

## 🎨 Princípios Ágeis Aplicados

1. **Colaboração** - Sistema de equipes e sincronização em tempo real
2. **Transparência** - Board visível para todos os membros
3. **Adaptação** - Cards podem ser movidos e priorizados facilmente
4. **Entregas Contínuas** - Drag & drop permite visualizar o fluxo de trabalho
5. **Auto-organização** - Equipe gerencia suas próprias tarefas

## 📝 Como Usar

### 1. Primeiro Acesso
- Cadastre-se com email e senha
- Faça login na plataforma

### 2. Criar uma Equipe
- Clique em "➕ Criar Nova Equipe"
- Dê um nome para sua equipe
- A equipe será criada com 4 colunas padrão

### 3. Convidar Membros
- Na dashboard, clique em "Convidar" no card da equipe
- Digite o email do membro (ele precisa estar cadastrado)
- O membro terá acesso ao board da equipe

### 4. Gerenciar Tarefas
- Abra o board da equipe
- Clique em "➕ Adicionar Card" em qualquer coluna
- Preencha título e descrição
- Arraste os cards entre as colunas conforme o progresso

### 5. Fluxo de Trabalho Sugerido
- **Backlog**: Todas as ideias e tarefas futuras
- **To Do**: Tarefas priorizadas para a sprint atual
- **Doing**: Tarefas em desenvolvimento
- **Done**: Tarefas concluídas

## 🐛 Troubleshooting

### Erro de autenticação
Certifique-se de que o Firebase Authentication está habilitado no console:
- Acesse [console.firebase.google.com](https://console.firebase.google.com)
- Vá em "Authentication" → "Sign-in method"
- Habilite "Email/Password"

### Erro no Firestore
Verifique as regras do Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👥 Equipe

Desenvolvido para a disciplina de **Computação em Nuvem** - Atividade Scrum em Dupla

---

**🚀 Bom trabalho ágil!**
