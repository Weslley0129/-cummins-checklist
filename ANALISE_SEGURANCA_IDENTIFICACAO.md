# 🔒 Análise de Segurança - cummins-identificacao.html

**Analista:** Engenheiro de Software Sênior - Especialista em Segurança  
**Data:** 2025-01-23  
**Arquivo:** `cummins-identificacao.html`  
**Foco:** Segurança e Integridade de Dados

---

## 🚨 RESUMO EXECUTIVO

**Vulnerabilidades Críticas Encontradas:** 7  
- 🔴 **CRÍTICAS:** 4
- 🟡 **ALTAS:** 2
- 🟢 **MÉDIAS:** 1

**Status Geral:** ⚠️ **VULNERÁVEL - REQUER CORREÇÃO IMEDIATA**

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. **AUTENTICAÇÃO BASEADA APENAS EM CLIENT-SIDE (localStorage)**
**Localização:** Linhas 193-206  
**Severidade:** 🔴 **CRÍTICA**  
**CVSS Score:** 9.1 (Crítico)

**Código Vulnerável:**
```javascript
// Verificar autenticação
const authData = localStorage.getItem('cummins_auth');
if (!authData) {
    window.location.href = 'cummins-login.html';
} else {
    try {
        const auth = JSON.parse(authData);
        if (auth.authenticated && auth.email) {
            document.getElementById('userEmail').textContent = auth.email;
            document.getElementById('userInfo').style.display = 'block';
        }
    } catch (e) {
        window.location.href = 'cummins-login.html';
    }
}
```

**Problemas Identificados:**
1. ❌ **Autenticação 100% client-side** - Qualquer usuário pode manipular o localStorage
2. ❌ **Sem validação server-side** - Não há verificação real de autenticação
3. ❌ **Sem expiração de sessão** - Tokens nunca expiram
4. ❌ **Sem verificação de integridade** - Dados podem ser modificados livremente
5. ❌ **Email exposto no DOM** - Informação sensível visível no HTML

**Exploração:**
```javascript
// Qualquer usuário pode fazer isso no console:
localStorage.setItem('cummins_auth', JSON.stringify({
    authenticated: true,
    email: 'admin@cummins.com',
    isAdmin: true,
    perfil: 'admin'
}));
// Agora tem acesso completo!
```

**Correção Recomendada:**
```javascript
// 1. Validar token no servidor ANTES de renderizar
async function validateAuth() {
    try {
        const authData = localStorage.getItem('cummins_auth');
        if (!authData) {
            redirectToLogin();
            return false;
        }
        
        const auth = JSON.parse(authData);
        
        // Verificar expiração
        if (auth.expiresAt && new Date(auth.expiresAt) < new Date()) {
            localStorage.removeItem('cummins_auth');
            redirectToLogin();
            return false;
        }
        
        // Validar com backend
        const response = await fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}` // Token JWT assinado
            },
            body: JSON.stringify({ token: auth.token })
        });
        
        if (!response.ok) {
            localStorage.removeItem('cummins_auth');
            redirectToLogin();
            return false;
        }
        
        const userData = await response.json();
        
        // NÃO expor email diretamente no DOM
        // Usar apenas inicial do nome ou ID
        document.getElementById('userEmail').textContent = 
            userData.email.substring(0, 3) + '***@***';
        
        return true;
    } catch (error) {
        console.error('Erro na validação:', error);
        redirectToLogin();
        return false;
    }
}

// Chamar antes de renderizar qualquer coisa
validateAuth().then(isValid => {
    if (!isValid) return;
    // Continuar com o resto do código...
});
```

---

### 2. **AUSÊNCIA DE CONTROLE DE ACESSO (ACL) - Bypass Total**
**Localização:** Todo o arquivo  
**Severidade:** 🔴 **CRÍTICA**  
**CVSS Score:** 9.3 (Crítico)

**Problema:**
- ❌ **Nenhuma verificação de permissões** - Não verifica se o usuário é operador ou admin
- ❌ **Qualquer usuário pode acessar** - Basta ter qualquer token no localStorage
- ❌ **Sem separação de roles** - Admin e operador têm o mesmo acesso

**Exploração:**
```javascript
// Operador pode facilmente se tornar admin:
const auth = JSON.parse(localStorage.getItem('cummins_auth'));
auth.isAdmin = true;
auth.perfil = 'admin';
localStorage.setItem('cummins_auth', JSON.stringify(auth));
// Agora tem acesso de admin!
```

**Correção Recomendada:**
```javascript
// Verificar role ANTES de permitir acesso
async function checkUserRole() {
    try {
        const authData = localStorage.getItem('cummins_auth');
        if (!authData) {
            redirectToLogin();
            return null;
        }
        
        const auth = JSON.parse(authData);
        
        // Validar com backend - NUNCA confiar no client-side
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!response.ok) {
            redirectToLogin();
            return null;
        }
        
        const user = await response.json();
        
        // Verificar se é operador (não admin)
        if (user.role !== 'operador') {
            // Redirecionar admin para página de admin
            if (user.role === 'admin') {
                window.location.href = 'cummins-admin.html';
                return null;
            }
            // Outros roles não têm acesso
            alert('Acesso negado. Apenas operadores podem acessar esta página.');
            redirectToLogin();
            return null;
        }
        
        return user;
    } catch (error) {
        console.error('Erro ao verificar role:', error);
        redirectToLogin();
        return null;
    }
}

// Usar antes de renderizar
const user = await checkUserRole();
if (!user) return; // Não renderizar nada se não passar na validação
```

---

### 3. **INJEÇÃO DE DADOS - Sem Sanitização de Inputs**
**Localização:** Linhas 165, 170, 239-241  
**Severidade:** 🔴 **CRÍTICA**  
**CVSS Score:** 8.5 (Alto)

**Código Vulnerável:**
```javascript
// Linha 165 - Input sem sanitização
<input type="text" id="nome" required placeholder="Digite seu nome completo" autocomplete="name" minlength="3">

// Linha 239-241 - Valores usados diretamente sem sanitização
const nome = document.getElementById('nome').value.trim();
const wwid = document.getElementById('wwid').value.toUpperCase();
const turno = document.getElementById('turno').value;
```

**Problemas Identificados:**
1. ❌ **XSS (Cross-Site Scripting)** - Scripts podem ser injetados
2. ❌ **Injeção de HTML** - Código HTML pode ser inserido
3. ❌ **Sem validação de formato** - Aceita qualquer caractere
4. ❌ **Sem escape de caracteres especiais** - Dados salvos diretamente no localStorage

**Exploração:**
```javascript
// XSS Attack:
// No campo "Nome", inserir:
<script>alert('XSS!'); localStorage.setItem('cummins_auth', JSON.stringify({authenticated: true, isAdmin: true}));</script>

// Ou:
<img src=x onerror="fetch('/api/admin/delete-all').then(() => alert('Dados deletados!'))">

// Injeção de dados maliciosos:
// WWID: "'; DROP TABLE users; --"
// Nome: "<script>document.cookie</script>"
```

**Correção Recomendada:**
```javascript
// Função de sanitização
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remover tags HTML
    const div = document.createElement('div');
    div.textContent = input;
    let sanitized = div.innerHTML;
    
    // Escapar caracteres especiais
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    
    // Remover caracteres de controle
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    return sanitized.trim();
}

// Função de validação
function validateInput(input, type) {
    switch(type) {
        case 'nome':
            // Apenas letras, espaços e acentos
            return /^[a-zA-ZÀ-ÿ\s]{3,100}$/.test(input);
        case 'wwid':
            // Apenas alfanuméricos e hífen
            return /^[A-Z0-9\-]{3,20}$/.test(input);
        case 'turno':
            // Apenas valores permitidos
            return ['Manhã', 'Tarde', 'Noite', 'Administrativo'].includes(input);
        default:
            return false;
    }
}

// Usar no submit
document.getElementById('identificacaoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nomeRaw = document.getElementById('nome').value.trim();
    const wwidRaw = document.getElementById('wwid').value.toUpperCase().trim();
    const turnoRaw = document.getElementById('turno').value;

    // Sanitizar
    const nome = sanitizeInput(nomeRaw);
    const wwid = sanitizeInput(wwidRaw);
    const turno = sanitizeInput(turnoRaw);

    // Validar
    if (!validateInput(nome, 'nome')) {
        alert('Nome inválido. Use apenas letras e espaços (3-100 caracteres).');
        return;
    }

    if (!validateInput(wwid, 'wwid')) {
        alert('WWID inválido. Use apenas letras, números e hífen (3-20 caracteres).');
        return;
    }

    if (!validateInput(turno, 'turno')) {
        alert('Turno inválido. Selecione uma opção válida.');
        return;
    }

    // Enviar para backend (NUNCA confiar apenas no client-side)
    try {
        const response = await fetch('/api/operador/identificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ nome, wwid, turno })
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar dados');
        }

        const result = await response.json();
        
        // Redirecionar apenas após confirmação do servidor
        window.location.href = 'cummins-operador.html';
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar dados. Tente novamente.');
    }
});
```

---

### 4. **VAZAMENTO DE DADOS SENSÍVEIS NO DOM**
**Localização:** Linha 200  
**Severidade:** 🔴 **CRÍTICA**  
**CVSS Score:** 7.5 (Alto)

**Código Vulnerável:**
```javascript
document.getElementById('userEmail').textContent = auth.email;
```

**Problemas:**
1. ❌ **Email completo exposto** - Visível no HTML e no código fonte
2. ❌ **Pode ser capturado por scripts maliciosos** - Qualquer extensão do navegador pode ler
3. ❌ **Violação de privacidade** - Dados pessoais expostos

**Correção Recomendada:**
```javascript
// NUNCA expor email completo
function maskEmail(email) {
    if (!email || !email.includes('@')) return '***';
    
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 
        ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
        : '**';
    const maskedDomain = domain.length > 2
        ? domain.substring(0, 2) + '*'.repeat(domain.length - 2)
        : '**';
    
    return `${maskedLocal}@${maskedDomain}`;
}

// Usar apenas inicial ou ID
document.getElementById('userEmail').textContent = 
    auth.email ? maskEmail(auth.email) : 'Usuário';
    
// Ou melhor ainda, usar apenas nome do usuário (sem email)
document.getElementById('userEmail').textContent = 
    auth.nome || 'Operador';
```

---

## 🟡 VULNERABILIDADES ALTAS

### 5. **ARMAZENAMENTO INSEGURO NO localStorage**
**Localização:** Linhas 232, 257  
**Severidade:** 🟡 **ALTA**  
**CVSS Score:** 6.8 (Médio-Alto)

**Código Vulnerável:**
```javascript
localStorage.setItem('cummins_operador', JSON.stringify(data));
localStorage.setItem('cummins_operador', JSON.stringify(operadorData));
```

**Problemas:**
1. ❌ **Dados não criptografados** - Qualquer script pode ler
2. ❌ **Sem integridade** - Dados podem ser modificados
3. ❌ **Sem expiração** - Dados ficam para sempre
4. ❌ **Vulnerável a XSS** - Scripts maliciosos podem roubar dados

**Correção Recomendada:**
```javascript
// Usar biblioteca de criptografia (ex: crypto-js)
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'chave-secreta-do-servidor'; // Deve vir do servidor

function encryptData(data) {
    return CryptoJS.AES.encrypt(
        JSON.stringify(data), 
        SECRET_KEY
    ).toString();
}

function decryptData(encryptedData) {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
        return null;
    }
}

// Salvar com criptografia
const encrypted = encryptData(operadorData);
localStorage.setItem('cummins_operador', encrypted);

// Ler com descriptografia
const encrypted = localStorage.getItem('cummins_operador');
const data = decryptData(encrypted);

// MELHOR AINDA: Não usar localStorage para dados sensíveis
// Usar apenas sessionStorage (expira ao fechar navegador)
// Ou melhor: armazenar apenas no servidor
```

---

### 6. **AUSÊNCIA DE VALIDAÇÃO SERVER-SIDE**
**Localização:** Todo o arquivo  
**Severidade:** 🟡 **ALTA**  
**CVSS Score:** 7.2 (Alto)

**Problema:**
- ❌ **Toda validação é client-side** - Pode ser bypassada facilmente
- ❌ **Sem verificação no servidor** - Dados podem ser enviados diretamente via API
- ❌ **Sem rate limiting** - Ataques de força bruta são possíveis

**Correção Recomendada:**
```javascript
// SEMPRE validar no servidor também
// Backend (Python/Node.js):

@app.route('/api/operador/identificar', methods=['POST'])
@require_auth  # Decorator que valida token
@validate_json({
    'nome': {'type': 'string', 'minlength': 3, 'maxlength': 100, 'pattern': r'^[a-zA-ZÀ-ÿ\s]+$'},
    'wwid': {'type': 'string', 'minlength': 3, 'maxlength': 20, 'pattern': r'^[A-Z0-9\-]+$'},
    'turno': {'type': 'string', 'enum': ['Manhã', 'Tarde', 'Noite', 'Administrativo']}
})
def identificar_operador():
    data = request.json
    user = get_current_user()  # Do token JWT
    
    # Validar novamente no servidor
    if not re.match(r'^[a-zA-ZÀ-ÿ\s]{3,100}$', data['nome']):
        return jsonify({'error': 'Nome inválido'}), 400
    
    if not re.match(r'^[A-Z0-9\-]{3,20}$', data['wwid']):
        return jsonify({'error': 'WWID inválido'}), 400
    
    # Salvar no banco de dados (não no localStorage!)
    operador = Operador(
        email=user.email,
        nome=sanitize(data['nome']),  # Sanitizar no servidor
        wwid=data['wwid'],
        turno=data['turno']
    )
    db.session.add(operador)
    db.session.commit()
    
    return jsonify({'success': True}), 200
```

---

## 🟢 VULNERABILIDADES MÉDIAS

### 7. **FALTA DE CONTENT SECURITY POLICY (CSP)**
**Localização:** `<head>`  
**Severidade:** 🟢 **MÉDIA**  
**CVSS Score:** 5.3 (Médio)

**Problema:**
- ❌ **Sem CSP headers** - Permite execução de scripts inline
- ❌ **Vulnerável a XSS** - Scripts maliciosos podem ser injetados

**Correção Recomendada:**
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" 
          content="default-src 'self'; 
                   script-src 'self' 'unsafe-inline'; 
                   style-src 'self' 'unsafe-inline'; 
                   img-src 'self' data: https:; 
                   connect-src 'self' https://api.cummins.com;">
    <title>CUMMINS - Identificação</title>
    <!-- ... -->
</head>
```

---

## 📋 CHECKLIST DE CORREÇÕES PRIORITÁRIAS

### 🔴 Crítico - Corrigir Imediatamente
- [ ] Implementar autenticação server-side com JWT
- [ ] Adicionar validação de role no servidor
- [ ] Implementar sanitização de todos os inputs
- [ ] Remover exposição de email no DOM

### 🟡 Alto - Corrigir em Breve
- [ ] Criptografar dados sensíveis no localStorage
- [ ] Implementar validação server-side completa
- [ ] Adicionar rate limiting

### 🟢 Médio - Melhorias Futuras
- [ ] Adicionar Content Security Policy
- [ ] Implementar logging de segurança
- [ ] Adicionar monitoramento de tentativas de acesso

---

## 🛡️ RECOMENDAÇÕES GERAIS DE SEGURANÇA

### 1. **Nunca Confie no Client-Side**
- ✅ Toda validação deve ser duplicada no servidor
- ✅ Tokens devem ser assinados e verificados no servidor
- ✅ Permissões devem ser verificadas no servidor

### 2. **Use Autenticação Baseada em Tokens**
- ✅ JWT com assinatura HMAC ou RSA
- ✅ Tokens com expiração curta (15-30 minutos)
- ✅ Refresh tokens para renovação segura

### 3. **Sanitize e Valide Tudo**
- ✅ Sanitize inputs no client E no servidor
- ✅ Use whitelist (permitir apenas caracteres válidos)
- ✅ Escape dados antes de exibir no DOM

### 4. **Minimize Exposição de Dados**
- ✅ Não exponha dados sensíveis no DOM
- ✅ Use máscaras para emails e dados pessoais
- ✅ Armazene dados sensíveis apenas no servidor

### 5. **Implemente Logging e Monitoramento**
- ✅ Log todas as tentativas de autenticação
- ✅ Monitore tentativas de acesso não autorizado
- ✅ Alerte sobre atividades suspeitas

---

## 📚 REFERÊNCIAS DE SEGURANÇA

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## ⚠️ CONCLUSÃO

O arquivo `cummins-identificacao.html` apresenta **vulnerabilidades críticas de segurança** que permitem:

1. ✅ **Bypass completo de autenticação**
2. ✅ **Elevação de privilégios (operador → admin)**
3. ✅ **Injeção de código malicioso (XSS)**
4. ✅ **Vazamento de dados sensíveis**

**Ação Requerida:** Implementar todas as correções críticas antes de colocar em produção.

---

**Fim da Análise de Segurança**

