
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// GESTIÓN DE CLIENTES PARA TIEMPO REAL (SSE)
let clients = [];

// ENDPOINT: Suscripción a eventos en tiempo real mejorada
app.get('/api/events', (req, res) => {
  // Configuración de cabeceras para evitar buffering en proxies y servidores
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Crítico para Nginx/Hosting compartido
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  console.log(`🔌 Cliente conectado: ${clientId}. Total: ${clients.length}`);

  // Enviar mensaje inicial de conexión exitosa
  res.write(`data: ${JSON.stringify({ type: 'connected', id: clientId })}\n\n`);

  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 20000);

  req.on('close', () => {
    clearInterval(keepAlive);
    clients = clients.filter(c => c.id !== clientId);
    console.log(`❌ Cliente desconectado: ${clientId}`);
  });
});

const notifyClients = (type, id = null) => {
  console.log(`📢 Notificando cambio en: ${type}`);
  const message = JSON.stringify({ type, id, timestamp: new Date().getTime() });
  clients.forEach(client => {
    client.res.write(`data: ${message}\n\n`);
  });
};

// CONFIGURACIÓN DE CONEXIÓN MYSQL
const db = mysql.createConnection({
  host: 'localhost', 
  user: 'thenetgu_crkitchen',
  password: 'thenetgu_crkitchen',      
  database: 'thenetgu_crkitchen'
});

db.connect(err => {
  if (err) console.error('❌ ERROR DB:', err.message);
  else console.log('✅ DB CONECTADA');
});

// Endpoint de Autenticación
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT data FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en DB' });
    const users = results.map(r => typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const { password: _, ...userSafe } = user;
      res.json(userSafe);
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected', clients: clients.length });
});

// MAGIA CON IA - ASISTENTE DE REDACCIÓN
app.post('/api/generate-description', (req, res) => {
    const { clientName, projectCategory, projectName, budgetItems, style } = req.body;
    
    // 1. Fetch API Key from database
    db.query('SELECT data FROM settings WHERE id = ?', ['branding'], async (err, results) => {
        if (err) {
            console.error('❌ DB Error fetching API Key:', err);
            return res.status(500).json({ error: "Error de base de datos al buscar la clave API." });
        }

        let apiKey = process.env.API_KEY; // Fallback to environment variable

        if (results.length > 0) {
            const brandingData = typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data;
            if (brandingData && brandingData.geminiApiKey) {
                apiKey = brandingData.geminiApiKey;
            }
        }
        
        if (!apiKey) {
          return res.status(500).json({ error: "La API Key de Google no ha sido configurada. Por favor, añádela en la sección de Empresa." });
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            
            const itemsContext = budgetItems.map(item => `- ${item.concept}: ${item.description || ''}`).join('\n');
            
            const styleText = style === 'resumido' 
              ? "conciso, directo y comercial (máximo 3 frases)." 
              : "extenso, sofisticado, técnico y poético. Enfócate en la calidad de vida y el lujo.";

            const prompt = `Actúa como un arquitecto de interiores senior de la firma CR Kitchen & Design.
            Genera una memoria descriptiva profesional para una propuesta de: ${projectCategory}.
            
            DETALLES DEL PROYECTO:
            - Cliente: ${clientName}
            - Nombre de obra: ${projectName}
            - Elementos clave:
            ${itemsContext}

            REQUERIMIENTO DE ESTILO: El tono debe ser ${styleText} No incluyas saludos ni despedidas, solo el texto de la memoria descriptiva.`;

            const response = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                systemInstruction: "Eres el redactor creativo principal de CR Kitchen & Design. Tu objetivo es convertir presupuestos técnicos en experiencias aspiracionales de lujo. Usa palabras como 'materialidad', 'ergonomía', 'vanguardia' y 'atemporalidad'.",
                temperature: 0.8,
                topP: 0.95
              }
            });
            
            const generatedText = response.text;
            if (!generatedText) throw new Error("IA devolvió respuesta vacía");
            
            res.json({ description: generatedText.trim() });
        } catch (error) {
            console.error('❌ Error Gemini API:', error);
            res.status(500).json({ error: "Error al generar contenido con el asistente de IA. Verifica que la API Key sea correcta." });
        }
    });
});

// CRUD Genérico con notificaciones en tiempo real
const setupCrud = (route, table) => {
  app.get(`/api/${route}`, (req, res) => {
    db.query(`SELECT data FROM ${table}`, (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results.map(r => typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
    });
  });

  app.get(`/api/${route}/:id`, (req, res) => {
    db.query(`SELECT data FROM ${table} WHERE id = ?`, [req.params.id], (err, results) => {
      if (err) return res.status(500).json(err);
      if (results.length === 0) return res.status(404).json({ error: 'not_found' });
      res.json(typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data);
    });
  });

  app.post(`/api/${route}`, (req, res) => {
    const data = JSON.stringify(req.body);
    const id = req.body.id || req.body.codigo || 'branding';
    db.query(`REPLACE INTO ${table} (id, data) VALUES (?, ?)`, [id, data], (err) => {
      if (err) return res.status(500).json(err);
      notifyClients(route, id);
      res.json({ status: 'saved' });
    });
  });

  app.post(`/api/${route}/bulk`, (req, res) => {
    const items = req.body.items;
    if (!items || items.length === 0) return res.json({ status: 'ok' });
    const values = items.map(i => [i.id || i.codigo, JSON.stringify(i)]);
    db.query(`REPLACE INTO ${table} (id, data) VALUES ?`, [values], (err) => {
      if (err) return res.status(500).json(err);
      notifyClients(route);
      res.json({ status: 'ok' });
    });
  });

  app.delete(`/api/${route}/:id`, (req, res) => {
    db.query(`DELETE FROM ${table} WHERE id = ?`, [req.params.id], (err) => {
      if (err) return res.status(500).json(err);
      notifyClients(route, req.params.id);
      res.json({ status: 'deleted' });
    });
  });
};

setupCrud('quotes', 'quotes');
setupCrud('inventory', 'inventory');
setupCrud('clients', 'clients');
setupCrud('users', 'users');
setupCrud('branding', 'settings');
setupCrud('categories', 'categories');

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 SERVIDOR EN PUERTO: ${PORT}`));