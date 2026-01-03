// ============================================
// 📈 TRENDS WhatsApp Bot - WhatsApp Web JS
// Complete Version with QR Code Display
// ============================================

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const app = express();

// ========== CONFIGURATION ==========
const PORT = process.env.PORT || 3000;
const QR_DIR = './qr_codes'; // Directory to store QR codes

// Create directory for QR codes if it doesn't exist
if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

// Store users in memory
const users = new Map();
let currentQR = null;
let qrGeneratedTime = null;

// ========== WHATSAPP CLIENT ==========
console.log('🚀 Initializing WhatsApp client...');

const client = new Client({
  // Authentication - saves session
  authStrategy: new LocalAuth({
    clientId: "trends-bot",
    dataPath: './.wwebjs_auth'
  }),
  
  // Puppeteer settings for Render
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  },
  
  // Auto-reconnect settings
  restartOnAuthFail: true,
  qrMaxRetries: 3,
  takeoverOnConflict: true
});

// ========== QR CODE HANDLER ==========
client.on('qr', async (qr) => {
  console.log('\n' + '='.repeat(60));
  console.log('📱 WHATSAPP QR CODE GENERATED');
  console.log('='.repeat(60));
  
  currentQR = qr;
  qrGeneratedTime = new Date();
  
  try {
    // 1. Generate QR as Data URL
    const qrDataUrl = await qrcode.toDataURL(qr);
    
    // 2. Create HTML page with QR
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Scan QR for Trends Bot</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          text-align: center;
        }
        
        .header {
          margin-bottom: 30px;
        }
        
        .logo {
          font-size: 48px;
          margin-bottom: 10px;
          color: #3B82F6;
        }
        
        h1 {
          color: #1f2937;
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .subtitle {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 30px;
          line-height: 1.5;
        }
        
        .qr-container {
          background: #f8fafc;
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
          border: 2px dashed #e5e7eb;
        }
        
        .qr-code {
          width: 250px;
          height: 250px;
          margin: 0 auto;
          background: white;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .qr-code img {
          width: 100%;
          height: 100%;
          display: block;
        }
        
        .instructions {
          text-align: left;
          background: #f0f9ff;
          padding: 20px;
          border-radius: 10px;
          margin: 25px 0;
          border-left: 4px solid #3B82F6;
        }
        
        .instructions h3 {
          color: #1e40af;
          margin-bottom: 15px;
          font-size: 18px;
        }
        
        .instructions ol {
          padding-left: 20px;
          color: #374151;
        }
        
        .instructions li {
          margin-bottom: 10px;
          line-height: 1.4;
        }
        
        .tip {
          background: #fef3c7;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          color: #92400e;
          font-size: 14px;
          border-left: 4px solid #f59e0b;
        }
        
        .url {
          background: #ecfdf5;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 14px;
          color: #065f46;
          border-left: 4px solid #10b981;
        }
        
        .footer {
          margin-top: 30px;
          color: #9ca3af;
          font-size: 14px;
        }
        
        .status {
          background: #dcfce7;
          color: #166534;
          padding: 10px 20px;
          border-radius: 50px;
          display: inline-block;
          font-weight: 600;
          margin-bottom: 20px;
        }
        
        .refresh {
          background: #3B82F6;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.3s;
        }
        
        .refresh:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }
        
        .timestamp {
          color: #6b7280;
          font-size: 12px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📈</div>
          <h1>Connect Trends Bot to WhatsApp</h1>
          <div class="subtitle">
            Scan this QR code to link your WhatsApp account with the Trends finance assistant
          </div>
          <div class="status">QR Code Active • Valid for 2 minutes</div>
        </div>
        
        <div class="qr-container">
          <div class="qr-code">
            <img src="${qrDataUrl}" alt="WhatsApp QR Code">
          </div>
        </div>
        
        <div class="instructions">
          <h3>📱 How to Scan:</h3>
          <ol>
            <li><strong>Open WhatsApp</strong> on your mobile phone</li>
            <li>Tap <strong>Menu (⋮) → Linked Devices</strong></li>
            <li>Tap <strong>"Link a Device"</strong></li>
            <li>Point your camera at the QR code above</li>
            <li>Wait for confirmation message</li>
          </ol>
        </div>
        
        <div class="tip">
          💡 <strong>Tip:</strong> Make sure you're scanning with the phone that will receive student messages
        </div>
        
        <div class="url">
          🔗 <strong>Direct QR URL:</strong><br>
          ${qrDataUrl.substring(0, 80)}...
        </div>
        
        <button class="refresh" onclick="location.reload()">
          🔄 Refresh QR Code
        </button>
        
        <div class="timestamp">
          Generated: ${new Date().toLocaleTimeString()}
        </div>
        
        <div class="footer">
          Trends WhatsApp Bot • For Nigerian Students • v1.0
        </div>
      </div>
      
      <script>
        // Auto-refresh QR every 2 minutes (QR expires)
        setTimeout(() => {
          console.log('🔄 QR code expired, refreshing...');
          location.reload();
        }, 120000);
        
        // Check if connected every 10 seconds
        setInterval(() => {
          fetch('/status')
            .then(res => res.json())
            .then(data => {
              if (data.whatsapp === 'connected') {
                window.location.href = '/connected';
              }
            });
        }, 10000);
      </script>
    </body>
    </html>
    `;
    
    // 3. Save HTML file
    fs.writeFileSync(path.join(QR_DIR, 'index.html'), htmlContent);
    console.log('✅ QR code page generated');
    console.log(`🌐 Open this URL to see QR: YOUR_RENDER_URL/qr`);
    
    // 4. Also save raw QR image
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(path.join(QR_DIR, 'qrcode.png'), base64Data, 'base64');
    console.log('💾 QR code saved as image');
    
  } catch (error) {
    console.error('❌ Error generating QR:', error);
    
    // Fallback: Show QR in terminal
    const qrcodeTerminal = require('qrcode-terminal');
    qrcodeTerminal.generate(qr, { small: false });
  }
  
  console.log('\n📝 Instructions:');
  console.log('1. Visit YOUR_RENDER_URL/qr');
  console.log('2. Scan QR with WhatsApp');
  console.log('3. Bot will be ready in seconds');
  console.log('='.repeat(60) + '\n');
});

// ========== WHATSAPP EVENTS ==========

// When ready
client.on('ready', () => {
  console.log('\n🎉 WHATSAPP CLIENT IS READY!');
  console.log('🤖 Trends bot is now active');
  console.log('📱 Students can now message this number');
  console.log('💰 Test with: "bought bread 500"');
  
  // Clear QR files
  try {
    if (fs.existsSync(path.join(QR_DIR, 'index.html'))) {
      fs.unlinkSync(path.join(QR_DIR, 'index.html'));
    }
    if (fs.existsSync(path.join(QR_DIR, 'qrcode.png'))) {
      fs.unlinkSync(path.join(QR_DIR, 'qrcode.png'));
    }
    console.log('🧹 Cleared QR files');
  } catch (error) {
    console.log('Note: Could not clear QR files');
  }
});

// When disconnected
client.on('disconnected', (reason) => {
  console.log('\n⚠️ WhatsApp disconnected:', reason);
  console.log('🔄 Attempting to reconnect...');
});

// When authenticated
client.on('authenticated', () => {
  console.log('✅ WhatsApp authenticated successfully');
});

// ========== MESSAGE HANDLER ==========
client.on('message', async (msg) => {
  // Don't reply to your own messages
  if (msg.fromMe) return;
  
  console.log(`\n📩 Message from ${msg.from}:`);
  console.log(`   "${msg.body}"`);
  
  try {
    const response = await processMessage(msg.body, msg.from);
    
    if (response) {
      console.log(`💬 Replying with ${response.length} chars`);
      await msg.reply(response);
      console.log('✅ Reply sent');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    try {
      await msg.reply("Sorry, an error occurred. Please try again.");
    } catch (e) {
      console.error('Failed to send error reply:', e);
    }
  }
});

// ========== MESSAGE PROCESSING ==========
async function processMessage(message, userId) {
  const lowerMsg = message.toLowerCase().trim();
  
  // Initialize user
  if (!users.has(userId)) {
    users.set(userId, {
      balance: 0,
      transactions: [],
      goals: [],
      createdAt: new Date(),
      name: userId.replace(/@c\.us$/, '')
    });
    
    return getWelcomeMessage();
  }
  
  const user = users.get(userId);
  
  // ===== FINANCE LOGIC =====
  
  // HELP COMMAND
  if (lowerMsg === 'help' || lowerMsg === 'commands' || lowerMsg === 'menu') {
    return getHelpMessage();
  }
  
  // EXPENSE TRACKING
  const expenseMatch = lowerMsg.match(/(?:bought|spent|paid|used)\s+(?:.*?)?(\d+)/i) || 
                      lowerMsg.match(/(\d+)\s+(?:for|on|na)\s+(.+)/i);
  
  if (expenseMatch) {
    const amount = parseInt(expenseMatch[1]);
    if (isNaN(amount) || amount <= 0) {
      return "Please specify a valid amount. Example: 'bought bread 500'";
    }
    
    user.balance -= amount;
    const transaction = {
      type: 'expense',
      amount,
      description: message.substring(0, 100),
      category: detectCategory(message),
      timestamp: new Date()
    };
    user.transactions.push(transaction);
    
    const sapaLevel = getSapaLevel(user.balance);
    
    return `✅ *Expense Tracked* 📈\n\n` +
           `💸 Amount: ₦${amount.toLocaleString()}\n` +
           `📂 Category: ${transaction.category.toUpperCase()}\n` +
           `💰 Balance: ₦${user.balance.toLocaleString()}\n\n` +
           `📊 *${sapaLevel.level}*\n` +
           `💡 ${sapaLevel.advice}`;
  }
  
  // INCOME TRACKING
  const incomeMatch = lowerMsg.match(/(?:received|got|collected|alert|sent)\s+(?:.*?)?(\d+)/i) ||
                     lowerMsg.match(/(\d+)\s+(?:from|alert)/i);
  
  if (incomeMatch) {
    const amount = parseInt(incomeMatch[1]);
    if (isNaN(amount) || amount <= 0) {
      return "Please specify a valid amount. Example: 'mum sent 10000'";
    }
    
    user.balance += amount;
    user.transactions.push({
      type: 'income',
      amount,
      description: message.substring(0, 100),
      timestamp: new Date()
    });
    
    const responses = [
      `🎉 *Money Alert!* 💰\n\nYou received: ₦${amount.toLocaleString()}\nNew balance: ₦${user.balance.toLocaleString()}\n\nManage am well o! 😊`,
      `🤑 *Alert Entered!* 💸\n\n₦${amount.toLocaleString()} added!\nBalance: ₦${user.balance.toLocaleString()}\n\nNo squander am finish!`,
      `💰 *Funds Received!* 📈\n\nAmount: ₦${amount.toLocaleString()}\nTotal: ₦${user.balance.toLocaleString()}\n\nSpend wisely!`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // BALANCE CHECK
  if (lowerMsg.includes('balance') || lowerMsg === 'bal' || lowerMsg.includes('how much')) {
    const sapaLevel = getSapaLevel(user.balance);
    const today = new Date();
    const todayExpenses = user.transactions
      .filter(t => t.type === 'expense' && isSameDay(t.timestamp, today))
      .reduce((sum, t) => sum + t.amount, 0);
    
    return `💰 *Your Balance* 📊\n\n` +
           `₦${user.balance.toLocaleString()}\n\n` +
           `📅 Today's spending: ₦${todayExpenses.toLocaleString()}\n` +
           `📈 Total transactions: ${user.transactions.length}\n\n` +
           `${sapaLevel.level}\n` +
           `${sapaLevel.advice}`;
  }
  
  // WEEKLY SUMMARY
  if (lowerMsg.includes('week') || lowerMsg.includes('summary') || lowerMsg.includes('report')) {
    return getWeeklySummary(user);
  }
  
  // RESET COMMAND (for testing)
  if (lowerMsg === 'reset' || lowerMsg === 'clear') {
    users.delete(userId);
    return "Your data has been reset. Start fresh! 🆕";
  }
  
  // Default response
  return `🤔 *I no understand that one!*\n\n` +
         `Here are things I can do:\n` +
         `• Track expenses: "Bought bread 500"\n` +
         `• Track income: "Mum sent 10000"\n` +
         `• Check balance: "Balance"\n` +
         `• Get summary: "My week"\n` +
         `• See commands: "Help"\n\n` +
         `Try again! 😊`;
}

// ========== HELPER FUNCTIONS ==========
function detectCategory(text) {
  const categories = {
    food: ['chop', 'food', 'rice', 'bread', 'indomie', 'garri', 'eat', 'canteen', 'suya'],
    transport: ['transport', 'uber', 'bolt', 'okada', 'keke', 'bus', 'fuel', 'drop', 'go'],
    data: ['data', 'airtime', 'credit', 'recharge', 'mtn', 'glo', 'airtel', '9mobile', 'internet'],
    school: ['handout', 'textbook', 'project', 'printing', 'photocopy', 'course', 'assignment', 'exam'],
    entertainment: ['movie', 'party', 'owambe', 'club', 'hangout', 'outing', 'flex', 'jolly'],
    personal: ['clothes', 'shoe', 'hair', 'barbing', 'salon', 'shopping', 'cream'],
    misc: ['contribution', 'gift', 'emergency', 'health', 'medicine', 'other']
  };
  
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category;
    }
  }
  return 'misc';
}

function getSapaLevel(balance) {
  if (balance <= 0) return {
    level: '🚨 CRITICAL SAPA ALERT 🚨',
    advice: 'Omo! Emergency funds needed. Call home or activate side hustle ASAP!'
  };
  if (balance < 1000) return {
    level: '😰 HEAVY SAPA ZONE',
    advice: 'Balance dangerously low. Cook at home, avoid any unnecessary spending.'
  };
  if (balance < 3000) return {
    level: '⚠️ SAPA WARNING',
    advice: 'Manage carefully. Prioritize food & transport. No flexing!'
  };
  if (balance < 10000) return {
    level: '🤔 LIGHT SAPA',
    advice: 'You dey manage. Continue tracking expenses to avoid surprises.'
  };
  return {
    level: '📈 TRENDING WELL!',
    advice: 'Good financial position! Keep saving and tracking.'
  };
}

function getWelcomeMessage() {
  return `🎉 *WELCOME TO TRENDS!* 📈\n\n` +
         `Your smart finance assistant for Nigerian students.\n\n` +
         `I help you:\n` +
         `• Track daily expenses 💸\n` +
         `• Monitor allowance & income 💰\n` +
         `• Avoid "sapa" surprises 📊\n` +
         `• Get financial insights 🧠\n\n` +
         `*Quick Start:*\n` +
         `▶︎ "Bought bread 500"\n` +
         `▶︎ "Mum sent 10000"\n` +
         `▶︎ "Balance"\n` +
         `▶︎ "Help"\n\n` +
         `Chat naturally - I understand Nigerian English & Pidgin! 🇳🇬`;
}

function getHelpMessage() {
  return `📚 *TRENDS COMMANDS GUIDE* 📚\n\n` +
         `💸 *TRACK EXPENSES:*\n` +
         `• "Bought bread 500"\n` +
         `• "Spent 2000 on data"\n` +
         `• "Transport 1500"\n` +
         `• "Paid 3000 for handout"\n\n` +
         `💰 *TRACK INCOME:*\n` +
         `• "Mum sent 10000"\n` +
         `• "Got 5000 from hustle"\n` +
         `• "Received alert 15000"\n` +
         `• "Alert 20000"\n\n` +
         `📊 *CHECK STATUS:*\n` +
         `• "Balance" or "Bal"\n` +
         `• "My week"\n` +
         `• "My month"\n` +
         `• "Summary"\n\n` +
         `🎯 *COMING SOON:*\n` +
         `• Savings goals\n` +
         `• Group expenses\n` +
         `• Budget planning\n\n` +
         `💡 *Pro tip:* Chat naturally! I understand context.`;
}

function getWeeklySummary(user) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weekTransactions = user.transactions.filter(t => 
    new Date(t.timestamp) >= oneWeekAgo
  );
  
  const weekExpenses = weekTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const weekIncome = weekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Category breakdown
  const categoryBreakdown = {};
  weekTransactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });
  
  const topCategory = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])[0];
  
  let summary = `📊 *WEEKLY FINANCIAL REPORT* 📈\n\n`;
  summary += `📅 Period: Last 7 days\n`;
  summary += `💸 Total spent: ₦${weekExpenses.toLocaleString()}\n`;
  summary += `💰 Total received: ₦${weekIncome.toLocaleString()}\n`;
  summary += `📈 Net change: ₦${(weekIncome - weekExpenses).toLocaleString()}\n`;
  summary += `🔢 Transactions: ${weekTransactions.length}\n\n`;
  
  if (topCategory) {
    summary += `🔥 Top spending: *${topCategory[0].toUpperCase()}*\n`;
    summary += `   Amount: ₦${topCategory[1].toLocaleString()}\n\n`;
  }
  
  // Advice based on spending
  if (weekExpenses > weekIncome) {
    summary += `⚠️ *Spending Alert:* You spent more than you received!\n`;
    summary += `💡 Try reducing ${topCategory ? topCategory[0] : 'non-essential'} expenses.\n`;
  } else if (weekIncome - weekExpenses > 5000) {
    summary += `✅ *Great job!* You saved ₦${(weekIncome - weekExpenses).toLocaleString()} this week.\n`;
    summary += `💡 Consider setting a savings goal!\n`;
  }
  
  summary += `\n💭 Keep tracking to see your financial trends!`;
  
  return summary;
}

function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

// ========== EXPRESS ROUTES ==========
app.use(express.json());
app.use(express.static(QR_DIR));

// Home page
app.get('/', (req, res) => {
  res.json({
    app: 'Trends WhatsApp Finance Bot',
    version: '1.0.0',
    status: 'running',
    whatsapp: client.info ? 'connected' : 'disconnected',
    users: users.size,
    qr_available: currentQR ? true : false,
    endpoints: [
      '/qr - QR code for WhatsApp',
      '/status - Bot status',
      '/health - Health check',
      '/users - Active users count'
    ]
  });
});

// QR code page
app.get('/qr', (req, res) => {
  if (!currentQR) {
    return res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>📱 Trends Bot</h1>
          <p>No QR code generated yet.</p>
          <p>Check Render logs for QR code or wait a few seconds.</p>
          <p>Auto-refreshing in 5 seconds...</p>
          <script>setTimeout(() => location.reload(), 5000)</script>
        </body>
      </html>
    `);
  }
  
  // Check if QR is expired (2 minutes)
  const now = new Date();
  const qrAge = (now - qrGeneratedTime) / 1000 / 60; // in minutes
  
  if (qrAge > 2) {
    return res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>⏰ QR Code Expired</h1>
          <p>The QR code expired ${Math.floor(qrAge)} minutes ago.</p>
          <p>Check Render logs for new QR code.</p>
          <p>Auto-refreshing in 10 seconds...</p>
          <script>setTimeout(() => location.reload(), 10000)</script>
        </body>
      </html>
    `);
  }
  
  // Serve the QR HTML page
  const qrPath = path.join(QR_DIR, 'index.html');
  if (fs.existsSync(qrPath)) {
    res.sendFile(qrPath);
  } else {
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1>📱 Scan QR for Trends Bot</h1>
          <p>QR code generated but page not found.</p>
          <p>Check Render logs for direct QR URL.</p>
        </body>
      </html>
    `);
  }
});

// Connected page
app.get('/connected', (req, res) => {
  res.send(`
    <html>
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; background: #f0f9ff; }
        .success { background: #dcfce7; color: #166534; padding: 20px; border-radius: 10px; margin: 20px; }
      </style>
      <body>
        <h1>✅ Connected Successfully!</h1>
        <div class="success">
          <h2>Trends Bot is now active on WhatsApp!</h2>
          <p>Your WhatsApp is now linked with Trends finance assistant.</p>
        </div>
        <p>Test the bot by sending "Hi" to your WhatsApp.</p>
        <p>You can close this page.</p>
      </body>
    </html>
  `);
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    whatsapp: client.info ? 'connected' : 'disconnected',
    qr_available: currentQR ? true : false,
    qr_generated: qrGeneratedTime,
    users_count: users.size,
    uptime: process.uptime(),
    memory: process.memoryUsage().rss / 1024 / 1024 + ' MB'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: process.platform,
    node_version: process.version
  });
});

// Users endpoint
app.get('/users', (req, res) => {
  res.json({
    count: users.size,
    users: Array.from(users.entries()).map(([id, data]) => ({
      id: id.replace(/@c\.us$/, ''),
      balance: data.balance,
      transactions: data.transactions.length,
      since: data.createdAt
    }))
  });
});

// ========== START EVERYTHING ==========
async function startApp() {
  try {
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Trends server started on port ${PORT}`);
      console.log(`🌐 Web interface available`);
      console.log(`📱 QR code will appear at: YOUR_RENDER_URL/qr`);
      console.log(`⏳ Initializing WhatsApp...\n`);
    });
    
    // Initialize WhatsApp
    await client.initialize();
    
    // Auto-reconnect if disconnected
    setInterval(() => {
      if (!client.info) {
        console.log('🔌 WhatsApp disconnected, reinitializing...');
        client.initialize().catch(console.error);
      }
    }, 30000); // Check every 30 seconds
    
  } catch (error) {
    console.error('❌ Failed to start app:', error);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

// Start the application
startApp();
