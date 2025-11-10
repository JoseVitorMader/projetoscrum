# 🎓 Guia de Papéis SCRUM - Uso Prático no Sistema

## 📋 Como Cada Papel Usa a Plataforma

### 🎯 Product Owner (PO)

**Objetivo:** Maximizar o valor do produto e gerenciar o backlog

#### Tarefas no Sistema:
1. **Gerenciar o Backlog**
   - Criar cards na coluna **Backlog** com todas as ideias e funcionalidades
   - Priorizar cards (mover os mais importantes para cima)
   - Detalhar cards com descrições claras

2. **Planejar Sprint**
   - Mover cards prioritários do **Backlog** para **To Do**
   - Discutir com a equipe as estimativas
   - Garantir que o objetivo da sprint está claro

3. **Revisar Entregas**
   - Verificar cards na coluna **Done**
   - Validar se atendem aos critérios de aceitação
   - Aceitar ou retornar cards para ajustes

#### Exemplo de Fluxo:
```
1. Criar card no Backlog: "Adicionar filtro de busca"
2. Detalhar descrição: "Permitir buscar produtos por nome e categoria"
3. Priorizar: mover para topo do Backlog
4. Na Planning: mover para To Do
5. Na Review: verificar se foi concluído corretamente
```

---

### 🛡️ Scrum Master (SM)

**Objetivo:** Facilitar o processo e remover impedimentos

#### Tarefas no Sistema:
1. **Monitorar o Board**
   - Visualizar o board completo em reuniões
   - Identificar gargalos (muitos cards em "Doing")
   - Facilitar a distribuição equilibrada de trabalho

2. **Facilitar Cerimônias**
   - **Daily:** Revisar cards "Doing" - cada dev fala sobre seu card
   - **Planning:** Ajudar o PO a mover cards do Backlog para To Do
   - **Review:** Apresentar cards "Done" aos stakeholders
   - **Retrospective:** Discutir melhorias no processo

3. **Gerenciar a Equipe**
   - Convidar novos membros via email
   - Garantir que todos têm acesso ao board
   - Resolver problemas técnicos

#### Exemplo de Daily Stand-up:
```
SM: "Bom dia! Vamos revisar o board."
Dev 1: "Estou no card X (aponta no board Doing)"
Dev 2: "Terminei Y (move de Doing para Done)"
Dev 3: "Card Z está bloqueado (SM anota impedimento)"
```

---

### 👨‍💻 Equipe de Desenvolvimento (Dev Team)

**Objetivo:** Entregar incrementos funcionais a cada sprint

#### Tarefas no Sistema:
1. **Pegar Tarefas**
   - Escolher cards da coluna **To Do**
   - Mover para **Doing** ao começar
   - Atualizar descrição se necessário

2. **Trabalhar nas Tarefas**
   - Implementar a funcionalidade
   - Editar o card para adicionar notas
   - Comunicar impedimentos

3. **Finalizar Tarefas**
   - Testar a funcionalidade
   - Mover card para **Done**
   - Pegar próximo card do To Do

#### Exemplo de Fluxo Dev:
```
1. Na Planning: vejo card "Criar botão de login" em To Do
2. Estimo: concordo que é 3 pontos
3. Pego a tarefa: arrasto de To Do → Doing
4. Desenvolvo: implemento o botão
5. Concluo: arrasto de Doing → Done
6. Pego próxima: volto ao To Do e pego outro card
```

---

## 🔄 Fluxo Completo de uma Sprint

### 1. Sprint Planning (Planejamento)
**Quem participa:** PO, SM, Dev Team

```
PO: Apresenta os cards prioritários do Backlog
Dev: Estima complexidade de cada card
PO + Dev: Movem cards selecionados para To Do
SM: Facilita e garante que todos entendem
```

### 2. Daily Scrum (Reunião Diária)
**Quem participa:** SM, Dev Team (PO opcional)

```
Cada dev responde:
- O que fiz ontem? (mostra cards movidos para Done)
- O que farei hoje? (mostra cards em Doing)
- Tenho algum impedimento? (SM anota)

SM: Olha o board e identifica problemas
```

### 3. Sprint Development (Desenvolvimento)
**Quem trabalha:** Dev Team

```
Devs trabalham nos cards:
To Do → Doing → Done

PO: Disponível para esclarecer dúvidas
SM: Remove impedimentos
```

### 4. Sprint Review (Revisão)
**Quem participa:** PO, SM, Dev Team, Stakeholders

```
Dev: Demonstra cards em Done
PO: Valida se atendem aos critérios
Stakeholders: Dão feedback
Cards aceitos: permanecem em Done
Cards rejeitados: voltam ao Backlog
```

### 5. Sprint Retrospective (Retrospectiva)
**Quem participa:** SM, Dev Team (PO opcional)

```
Time discute:
- O que foi bem? (ex: entregas no prazo)
- O que pode melhorar? (ex: cards mal descritos)
- Ações de melhoria (ex: detalhar melhor descrições)

SM: Facilita e anota melhorias
```

---

## 📊 Métricas que Podem Ser Observadas

### Velocity (Velocidade)
Conte quantos cards a equipe completa por sprint:
```
Sprint 1: 8 cards em Done
Sprint 2: 10 cards em Done
Sprint 3: 9 cards em Done
Média: 9 cards por sprint
```

### Lead Time (Tempo de Ciclo)
Tempo médio que um card leva de To Do até Done:
```
Card A: 2 dias
Card B: 5 dias
Card C: 3 dias
Média: 3,3 dias
```

### WIP (Work in Progress)
Quantos cards estão em "Doing" simultaneamente:
```
Ideal: 1-2 cards por dev
Problema: 5+ cards em Doing (provável sobrecarga)
```

---

## 💡 Dicas de Boas Práticas

### Para o PO:
- ✅ Escreva descrições claras nos cards
- ✅ Priorize o backlog antes da Planning
- ✅ Esteja disponível para esclarecer dúvidas
- ❌ Não mude prioridades no meio da sprint

### Para o SM:
- ✅ Facilite, não dite as decisões
- ✅ Proteja a equipe de interrupções
- ✅ Mantenha as cerimônias time-boxed
- ❌ Não seja um gerente de projetos tradicional

### Para os Devs:
- ✅ Pegue apenas o que consegue fazer
- ✅ Comunique impedimentos rapidamente
- ✅ Colabore e ajude os colegas
- ❌ Não acumule muitos cards em Doing

---

## 🎯 Exercício Prático

### Cenário: Sprint de 1 Semana

**Segunda (Planning):**
- PO apresenta 15 cards do Backlog
- Equipe seleciona 10 cards para To Do
- Meta da sprint: "Melhorar experiência de login"

**Terça-Sexta (Daily + Dev):**
- Daily 9h: revisar board
- Devs movem cards: To Do → Doing → Done

**Sexta (Review + Retro):**
- 15h: Review - demonstrar 8 cards concluídos
- 16h: Retro - discutir melhorias

### Resultado Esperado:
- 8 cards em Done ✅
- 2 cards voltam ao Backlog (não priorizados)
- Time aprende e melhora para próxima sprint 🚀

---

**🎓 Com prática, o time se torna cada vez mais eficiente!**
