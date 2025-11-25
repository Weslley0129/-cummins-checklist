"""
Backend CUMMINS - Sistema de Gestão de Checklists
API RESTful para gerenciar checklists, mensagens, chats e operadores
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permitir CORS para requisições do frontend

# Configuração do banco de dados
DB_NAME = 'cummins.db'

def get_db_connection():
    """Criar conexão com o banco de dados SQLite"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializar estrutura do banco de dados"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tabela de Checklists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS checklists (
            id TEXT PRIMARY KEY,
            nome_operador TEXT NOT NULL,
            email_operador TEXT NOT NULL,
            wwid TEXT,
            turno TEXT,
            tipo_veiculo TEXT,
            placa_veiculo TEXT,
            doca_numero TEXT,
            data_operacao TEXT,
            horario_inicio TEXT,
            qtd_volumes INTEGER,
            observacoes TEXT,
            status_checklist TEXT,
            nivel_risco TEXT,
            problemas_identificados TEXT,
            mensagem_admin TEXT,
            fotos TEXT,
            data_envio TEXT,
            created_date TEXT,
            q_critico_freios INTEGER DEFAULT 0,
            q_critico_direcao INTEGER DEFAULT 0,
            q_critico_sinalizacao INTEGER DEFAULT 0
        )
    ''')
    
    # Tabela de Mensagens
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mensagens (
            id TEXT PRIMARY KEY,
            checklist_id TEXT,
            remetente TEXT NOT NULL,
            tipo_remetente TEXT,
            mensagem TEXT NOT NULL,
            status TEXT,
            data_criacao TEXT
        )
    ''')
    
    # Tabela de Chats
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id TEXT PRIMARY KEY,
            userEmail TEXT NOT NULL,
            userName TEXT,
            from_type TEXT NOT NULL,
            fromName TEXT,
            fromEmail TEXT,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            read_status INTEGER DEFAULT 0
        )
    ''')
    
    # Tabela de Operadores
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS operadores (
            email TEXT PRIMARY KEY,
            nome TEXT NOT NULL,
            wwid TEXT,
            turno TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # Tabela de Autenticação
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS auth (
            email TEXT PRIMARY KEY,
            authenticated INTEGER DEFAULT 0,
            isAdmin INTEGER DEFAULT 0,
            perfil TEXT,
            nome TEXT,
            timestamp TEXT
        )
    ''')
    
    # Criar índices para melhor performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_checklists_email ON checklists(email_operador)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_checklists_data ON checklists(data_envio)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_email ON chats(userEmail)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_chats_timestamp ON chats(timestamp)')
    
    conn.commit()
    conn.close()
    print("✅ Banco de dados inicializado com sucesso!")

# ============================================
# ROTAS DE CHECKLISTS
# ============================================

@app.route('/api/checklists', methods=['GET'])
def get_checklists():
    """Obter todos os checklists com filtros opcionais"""
    try:
        email = request.args.get('email_operador')
        status = request.args.get('status')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = 'SELECT * FROM checklists WHERE 1=1'
        params = []
        
        if email:
            query += ' AND email_operador = ?'
            params.append(email)
        
        if status:
            query += ' AND status_checklist = ?'
            params.append(status)
        
        if data_inicio:
            query += ' AND data_envio >= ?'
            params.append(data_inicio)
        
        if data_fim:
            query += ' AND data_envio <= ?'
            params.append(data_fim)
        
        query += ' ORDER BY data_envio DESC, created_date DESC'
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        checklists = []
        for row in rows:
            checklist = dict(row)
            # Converter problemas_identificados de JSON string para lista
            if checklist.get('problemas_identificados'):
                try:
                    checklist['problemas_identificados'] = json.loads(checklist['problemas_identificados'])
                except:
                    checklist['problemas_identificados'] = []
            else:
                checklist['problemas_identificados'] = []
            
            # Converter fotos de JSON string para lista
            if checklist.get('fotos'):
                try:
                    checklist['fotos'] = json.loads(checklist['fotos'])
                except:
                    checklist['fotos'] = []
            else:
                checklist['fotos'] = []
            
            checklists.append(checklist)
        
        conn.close()
        return jsonify(checklists), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/checklist', methods=['POST'])
def create_checklist():
    """Criar novo checklist"""
    try:
        data = request.json
        
        if not data.get('id'):
            data['id'] = f"CHK_{int(datetime.now().timestamp() * 1000)}_{os.urandom(4).hex()}"
        
        if not data.get('created_date'):
            data['created_date'] = datetime.now().isoformat()
        
        if not data.get('data_envio'):
            data['data_envio'] = datetime.now().isoformat()
        
        # Converter listas para JSON strings
        if isinstance(data.get('problemas_identificados'), list):
            data['problemas_identificados'] = json.dumps(data['problemas_identificados'])
        
        if isinstance(data.get('fotos'), list):
            data['fotos'] = json.dumps(data['fotos'])
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO checklists (
                id, nome_operador, email_operador, wwid, turno, tipo_veiculo,
                placa_veiculo, doca_numero, data_operacao, horario_inicio,
                qtd_volumes, observacoes, status_checklist, nivel_risco,
                problemas_identificados, mensagem_admin, fotos, data_envio,
                created_date, q_critico_freios, q_critico_direcao, q_critico_sinalizacao
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('id'),
            data.get('nome_operador'),
            data.get('email_operador'),
            data.get('wwid'),
            data.get('turno'),
            data.get('tipo_veiculo'),
            data.get('placa_veiculo'),
            data.get('doca_numero'),
            data.get('data_operacao'),
            data.get('horario_inicio'),
            data.get('qtd_volumes'),
            data.get('observacoes'),
            data.get('status_checklist'),
            data.get('nivel_risco'),
            data.get('problemas_identificados'),
            data.get('mensagem_admin'),
            data.get('fotos'),
            data.get('data_envio'),
            data.get('created_date'),
            data.get('q_critico_freios', 0),
            data.get('q_critico_direcao', 0),
            data.get('q_critico_sinalizacao', 0)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'sucesso': True, 'id': data['id']}), 201
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/checklist/<checklist_id>', methods=['GET'])
def get_checklist(checklist_id):
    """Obter checklist específico"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM checklists WHERE id = ?', (checklist_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            checklist = dict(row)
            # Converter JSON strings para listas
            if checklist.get('problemas_identificados'):
                try:
                    checklist['problemas_identificados'] = json.loads(checklist['problemas_identificados'])
                except:
                    checklist['problemas_identificados'] = []
            if checklist.get('fotos'):
                try:
                    checklist['fotos'] = json.loads(checklist['fotos'])
                except:
                    checklist['fotos'] = []
            return jsonify(checklist), 200
        else:
            return jsonify({'erro': 'Checklist não encontrado'}), 404
            
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ============================================
# ROTAS DE MENSAGENS
# ============================================

@app.route('/api/mensagens', methods=['GET'])
def get_mensagens():
    """Obter todas as mensagens"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM mensagens ORDER BY data_criacao DESC')
        rows = cursor.fetchall()
        conn.close()
        
        mensagens = [dict(row) for row in rows]
        return jsonify(mensagens), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/mensagem', methods=['POST'])
def create_mensagem():
    """Criar nova mensagem"""
    try:
        data = request.json
        
        if not data.get('id'):
            data['id'] = f"MSG_{int(datetime.now().timestamp() * 1000)}_{os.urandom(4).hex()}"
        
        if not data.get('data_criacao'):
            data['data_criacao'] = datetime.now().isoformat()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO mensagens (id, checklist_id, remetente, tipo_remetente, mensagem, status, data_criacao)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('id'),
            data.get('checklist_id'),
            data.get('remetente'),
            data.get('tipo_remetente'),
            data.get('mensagem'),
            data.get('status', 'Não Lida'),
            data.get('data_criacao')
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'sucesso': True, 'id': data['id']}), 201
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ============================================
# ROTAS DE CHATS
# ============================================

@app.route('/api/chats', methods=['GET'])
def get_chats():
    """Obter chats de um usuário ou todos"""
    try:
        user_email = request.args.get('userEmail')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if user_email:
            cursor.execute('''
                SELECT * FROM chats 
                WHERE userEmail = ? 
                ORDER BY timestamp ASC
            ''', (user_email,))
        else:
            cursor.execute('SELECT * FROM chats ORDER BY timestamp DESC')
        
        rows = cursor.fetchall()
        conn.close()
        
        chats = [dict(row) for row in rows]
        # Converter read_status para boolean e from_type para from
        for chat in chats:
            chat['read'] = bool(chat.get('read_status', 0))
            if 'from_type' in chat:
                chat['from'] = chat['from_type']
                del chat['from_type']
        
        return jsonify(chats), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def create_chat():
    """Criar nova mensagem de chat"""
    try:
        data = request.json
        
        if not data.get('id'):
            data['id'] = f"CHAT_{int(datetime.now().timestamp() * 1000)}_{os.urandom(4).hex()}"
        
        if not data.get('timestamp'):
            data['timestamp'] = datetime.now().isoformat()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chats (id, userEmail, userName, from_type, fromName, fromEmail, text, timestamp, read_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('id'),
            data.get('userEmail'),
            data.get('userName'),
            data.get('from', 'operator'),
            data.get('fromName'),
            data.get('fromEmail'),
            data.get('text'),
            data.get('timestamp'),
            1 if data.get('read', False) else 0
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'sucesso': True, 'id': data['id']}), 201
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/chat/<chat_id>/read', methods=['PUT'])
def mark_chat_read(chat_id):
    """Marcar chat como lido"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE chats SET read_status = 1 WHERE id = ?', (chat_id,))
        conn.commit()
        conn.close()
        return jsonify({'sucesso': True}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ============================================
# ROTAS DE OPERADORES
# ============================================

@app.route('/api/operadores', methods=['GET'])
def get_operadores():
    """Obter todos os operadores"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM operadores')
        rows = cursor.fetchall()
        conn.close()
        
        operadores = [dict(row) for row in rows]
        return jsonify(operadores), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@app.route('/api/operador', methods=['POST'])
def create_operador():
    """Criar ou atualizar operador"""
    try:
        data = request.json
        
        if not data.get('email'):
            return jsonify({'erro': 'Email é obrigatório'}), 400
        
        now = datetime.now().isoformat()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se já existe
        cursor.execute('SELECT * FROM operadores WHERE email = ?', (data['email'],))
        existing = cursor.fetchone()
        
        if existing:
            # Atualizar
            cursor.execute('''
                UPDATE operadores 
                SET nome = ?, wwid = ?, turno = ?, updated_at = ?
                WHERE email = ?
            ''', (
                data.get('nome'),
                data.get('wwid'),
                data.get('turno'),
                now,
                data['email']
            ))
        else:
            # Criar novo
            cursor.execute('''
                INSERT INTO operadores (email, nome, wwid, turno, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['email'],
                data.get('nome'),
                data.get('wwid'),
                data.get('turno'),
                now,
                now
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'sucesso': True}), 201
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ============================================
# ROTAS DE ESTATÍSTICAS
# ============================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Obter estatísticas"""
    try:
        email = request.args.get('email_operador')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if email:
            cursor.execute('''
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status_checklist = 'Conforme' THEN 1 ELSE 0 END) as conformes,
                    SUM(CASE WHEN status_checklist = 'Alerta Gerado' THEN 1 ELSE 0 END) as alertas
                FROM checklists
                WHERE email_operador = ?
            ''', (email,))
        else:
            cursor.execute('''
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status_checklist = 'Conforme' THEN 1 ELSE 0 END) as conformes,
                    SUM(CASE WHEN status_checklist = 'Alerta Gerado' THEN 1 ELSE 0 END) as alertas
                FROM checklists
            ''')
        
        row = cursor.fetchone()
        conn.close()
        
        total = row['total'] or 0
        conformes = row['conformes'] or 0
        alertas = row['alertas'] or 0
        taxa = (conformes / total * 100) if total > 0 else 0
        
        return jsonify({
            'total': total,
            'conformes': conformes,
            'alertas': alertas,
            'taxaConformidade': round(taxa, 1)
        }), 200
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# ============================================
# ROTA DE SAÚDE
# ============================================

@app.route('/api/health', methods=['GET'])
def health():
    """Verificar saúde da API"""
    return jsonify({
        'status': 'ok',
        'banco': 'conectado',
        'timestamp': datetime.now().isoformat()
    }), 200

# ============================================
# INICIALIZAÇÃO
# ============================================

if __name__ == '__main__':
    # Inicializar banco de dados
    init_db()
    
    # Executar servidor
    print("🚀 Servidor CUMMINS iniciando...")
    print("📡 API disponível em: http://localhost:5000")
    print("📚 Documentação:")
    print("   GET  /api/checklists - Listar checklists")
    print("   POST /api/checklist - Criar checklist")
    print("   GET  /api/mensagens - Listar mensagens")
    print("   POST /api/mensagem - Criar mensagem")
    print("   GET  /api/chats - Listar chats")
    print("   POST /api/chat - Criar chat")
    print("   GET  /api/stats - Estatísticas")
    print("   GET  /api/health - Status da API")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
