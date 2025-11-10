# 🔧 Configuração do Firebase

## ⚠️ IMPORTANTE: Configure o Firebase antes de usar

Para que a aplicação funcione corretamente, você precisa configurar as permissões do Firestore e habilitar a autenticação.

## 1️⃣ Habilitar Firebase Authentication

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto: **projetoscrum-c994e**
3. No menu lateral, clique em **Authentication**
4. Clique na aba **Sign-in method**
5. Habilite o provedor **Email/Password**
6. Clique em **Save**

## 2️⃣ Configurar Regras do Firestore

1. No Firebase Console, clique em **Firestore Database**
2. Clique na aba **Rules**
3. Substitua as regras existentes por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra: usuário autenticado pode ler/escrever
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Clique em **Publish**

### 🔒 Regras Mais Seguras (Opcional - Recomendado)

Para maior segurança, use estas regras mais específicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: só pode ler/escrever seu próprio documento
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teams: só membros da equipe podem acessar
    match /teams/{teamId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       request.auth.uid in resource.data.members;
      allow delete: if request.auth != null && 
                       request.auth.uid == resource.data.createdBy;
    }
    
    // Lists: só membros da equipe podem acessar
    match /lists/{listId} {
      allow read, write: if request.auth != null && 
                            exists(/databases/$(database)/documents/teams/$(resource.data.teamId)) &&
                            request.auth.uid in get(/databases/$(database)/documents/teams/$(resource.data.teamId)).data.members;
    }
    
    // Cards: só membros da equipe podem acessar
    match /cards/{cardId} {
      allow read, write: if request.auth != null && 
                            exists(/databases/$(database)/documents/teams/$(resource.data.teamId)) &&
                            request.auth.uid in get(/databases/$(database)/documents/teams/$(resource.data.teamId)).data.members;
    }
  }
}
```

## 3️⃣ Criar Índices (se necessário)

Se você receber erros sobre índices compostos ao usar a aplicação:

1. O Firebase mostrará um link no console do navegador
2. Clique no link para criar o índice automaticamente
3. Aguarde alguns minutos até o índice ser criado

Índices comuns necessários:
- `lists`: `teamId` (Ascending) + `order` (Ascending)
- `cards`: `teamId` (Ascending) + `listId` (Ascending)

## 4️⃣ Verificar Configuração

Após configurar:

1. Execute `npm start` no projeto
2. Acesse [http://localhost:3000](http://localhost:3000)
3. Tente criar uma conta
4. Se funcionar ✅, está tudo configurado!

## 🐛 Erros Comuns

### "Missing or insufficient permissions"
**Solução:** Configure as regras do Firestore (passo 2)

### "auth/operation-not-allowed"
**Solução:** Habilite Email/Password no Authentication (passo 1)

### "FirebaseError: Missing or insufficient permissions"
**Solução:** Verifique se você está logado e se as regras permitem acesso

### Erro de índice composto
**Solução:** Clique no link fornecido no erro para criar o índice

## 📚 Mais Informações

- [Documentação Firebase Auth](https://firebase.google.com/docs/auth)
- [Documentação Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Documentação Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)

---

**✅ Após configurar, sua aplicação estará pronta para uso!**
