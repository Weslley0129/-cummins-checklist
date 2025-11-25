# 📚 Guia Passo a Passo - Salvar no GitHub

## 🎯 Pré-requisitos

1. **Conta no GitHub** - Se não tiver, crie em: https://github.com/signup
2. **Git instalado** - Verifique se está instalado:
   ```bash
   git --version
   ```
   Se não estiver, baixe em: https://git-scm.com/downloads

---

## 📝 PASSO A PASSO COMPLETO

### **PASSO 1: Criar Repositório no GitHub**

1. Acesse https://github.com e faça login
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Preencha:
   - **Repository name:** `cummins-checklist` (ou outro nome)
   - **Description:** `Sistema de Gestão de Checklists CUMMINS`
   - **Visibilidade:** Escolha Public ou Private
   - **NÃO marque** "Add a README file" (vamos fazer isso depois)
5. Clique em **"Create repository"**

---

### **PASSO 2: Configurar Git no Computador (Primeira vez apenas)**

Abra o PowerShell ou Terminal no diretório do projeto e execute:

```bash
# Configurar seu nome (substitua pelo seu nome)
git config --global user.name "Seu Nome"

# Configurar seu email (use o mesmo do GitHub)
git config --global user.email "seu.email@exemplo.com"

# Verificar configuração
git config --list
```

---

### **PASSO 3: Inicializar Repositório Local**

No diretório do projeto (`C:\Users\adeil\.cursor`), execute:

```bash
# Inicializar repositório Git
git init

# Verificar status
git status
```

---

### **PASSO 4: Criar Arquivo .gitignore**

Crie um arquivo chamado `.gitignore` na raiz do projeto com:

```
# Arquivos do sistema
.DS_Store
Thumbs.db
desktop.ini

# Arquivos de configuração local
.env
.env.local
*.log

# Banco de dados local
*.db
*.sqlite
*.sqlite3

# Arquivos temporários
*.tmp
*.temp
*~

# Node modules (se usar npm)
node_modules/
package-lock.json

# Arquivos de IDE
.vscode/
.idea/
*.swp
*.swo

# Arquivos de backup
*.bak
*.backup
```

---

### **PASSO 5: Adicionar Arquivos ao Git**

```bash
# Adicionar todos os arquivos
git add .

# OU adicionar arquivos específicos
git add *.html
git add *.py
git add *.md
```

---

### **PASSO 6: Fazer Primeiro Commit**

```bash
# Criar commit inicial
git commit -m "Commit inicial - Sistema CUMMINS"

# Verificar histórico
git log --oneline
```

---

### **PASSO 7: Conectar ao Repositório Remoto**

**Copie a URL do seu repositório GitHub** (exemplo: `https://github.com/seu-usuario/cummins-checklist.git`)

```bash
# Adicionar repositório remoto
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# Verificar se foi adicionado
git remote -v
```

---

### **PASSO 8: Enviar para o GitHub**

```bash
# Renomear branch principal (se necessário)
git branch -M main

# Enviar código para o GitHub
git push -u origin main
```

**Nota:** Se pedir credenciais:
- **Username:** Seu usuário do GitHub
- **Password:** Use um **Personal Access Token** (não sua senha normal)
  - Como criar token: https://github.com/settings/tokens
  - Permissões necessárias: `repo`

---

## 🔄 COMANDOS PARA ATUALIZAÇÕES FUTURAS

Depois do primeiro push, para atualizar o GitHub:

```bash
# 1. Verificar mudanças
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Criar commit com mensagem descritiva
git commit -m "Descrição das mudanças feitas"

# 4. Enviar para o GitHub
git push
```

---

## 📋 COMANDOS ÚTEIS

### Ver histórico de commits
```bash
git log --oneline
```

### Ver diferenças antes de commitar
```bash
git diff
```

### Desfazer mudanças não commitadas
```bash
git restore nome-do-arquivo
```

### Ver status atual
```bash
git status
```

### Ver branches
```bash
git branch
```

---

## ⚠️ SOLUÇÃO DE PROBLEMAS COMUNS

### **Erro: "fatal: not a git repository"**
```bash
# Você precisa estar no diretório correto
cd C:\Users\adeil\.cursor
git init
```

### **Erro: "Authentication failed"**
- Use Personal Access Token em vez de senha
- Crie em: https://github.com/settings/tokens

### **Erro: "remote origin already exists"**
```bash
# Remover remote existente
git remote remove origin

# Adicionar novamente
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

### **Quer atualizar apenas um arquivo específico**
```bash
git add nome-do-arquivo.html
git commit -m "Atualizar arquivo específico"
git push
```

---

## 🎯 RESUMO RÁPIDO (Comandos em Sequência)

```bash
# 1. Inicializar
git init

# 2. Adicionar arquivos
git add .

# 3. Primeiro commit
git commit -m "Commit inicial"

# 4. Conectar ao GitHub
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# 5. Enviar
git branch -M main
git push -u origin main
```

---

## 📝 DICAS IMPORTANTES

1. **Commits descritivos:** Use mensagens claras como:
   - `"Adicionar funcionalidade de login"`
   - `"Corrigir bug no dashboard"`
   - `"Remover console.log de produção"`

2. **Commits frequentes:** Faça commits pequenos e frequentes

3. **Não commitar senhas:** Nunca adicione arquivos com senhas ou tokens

4. **README.md:** Crie um arquivo README.md explicando o projeto

---

## ✅ CHECKLIST ANTES DE FAZER PUSH

- [ ] Arquivo `.gitignore` criado
- [ ] Senhas/tokens removidos do código
- [ ] Arquivos sensíveis não incluídos
- [ ] Mensagem de commit descritiva
- [ ] Repositório GitHub criado
- [ ] Remote origin configurado corretamente

---

**Pronto! Agora você pode salvar seu código no GitHub! 🚀**

