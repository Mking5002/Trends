
// ============================================
// 📈 TRENDS WhatsApp Bot - WhatsApp Web JS
// ============================================

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const app = express();

// ========== CONFIGURATION ==========
const PORT = process.env.PORT || 3000;

// Store users in memory (use DB in production)
const users = new Map();

// ========== WHATSAPP CLIENT ==========
console.log('🚀 Initializing WhatsApp client...');

const client = new Client({
  // Authentication - saves session so you don't scan QR daily
  authStrategy: new LocalAuth({
    clientId: "trends-bot",
    dataPath: './.wwebjs_auth'
  }),
  
  // Puppeteer settings for Render compatibility
  puppeteer: {
    headless: true, // Runs without browser UI
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

// ========== WHATSAPP EVENTS ==========

// 1. QR CODE - Scan this with your phone
client.on('qr', (qr) => {
  console.log('\n' + '='.repeat(50));
  console.log('📱 SCAN THIS QR CODE WITH WHATSAPP:');
  console.log('='.repeat(50) + '\n');
  
  // Show QR in terminal
  qrcode.generate(qr, { small: true });
  
  console.log('\n📝 How to scan:');
  console.log('1. Open WhatsApp on your phone');
  console.log('2. Tap Menu → Linked Devices');
  console.log('3. Tap "Link a Device"');
  console.log('4. Scan the QR code above\n');
});

// 2. WHEN READY
client.on('ready', () => {
  console.log('✅ WhatsApp client is READY!');
  console.log('🤖 Trends bot is now active');
  console.log('📱 Test by messaging this number');
});

// 3. WHEN DISCONNECTED
client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp disconnected:', reason);
  console.log('🔄 Attempting to reconnect...');
});

// ========== MESSAGE HANDLER ==========
client.on('message', async (msg) => {
  // Don't reply to your own messages
  if (msg.fromMe) return;
  
  console.log(`\n📩 New message from ${msg.from}:`);
  console.log(`   "${msg.body}"`);
  
  try {
    // Process the message
    const response = await processMessage(msg.body, msg.from);
    
    if (response) {
      console.log(`💬 Replying: "${response.substring(0, 50)}..."`);
      await msg.reply(response);
    }
  } catch (error) {
    console.error('❌ Error processing message:', error);
    await msg.reply("Sorry, an error occurred. Please try again.");
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
      createdAt: new Date()
    });
    
    return getWelcomeMessage();
  }
  
  const user = users.get(userId);
  
  // ===== YOUR REACT LOGIC STARTS HERE =====
  
  // 1. HELP COMMAND
  if (lowerMsg === 'help' || lowerMsg === 'commands') {
    return getHelpMessage();
  }
  
  // 2. EXPENSE TRACKING
  if (lowerMsg.includes('bought') || lowerMsg.includes('spent')) {
    const amount = extractAmount(message);
    if (!amount) return "How much did you spend? Add amount!";
    
    user.balance -= amount;
    user.transactions.push({
      type: 'expense',
      amount,
      description: message,
      timestamp: new Date()
    });
    
    const sapaLevel = getSapaLevel(user.balance);
    
    return `✅ *Expense Tracked*\n\n` +
           `💸 Amount: ₦${amount.toLocaleString()}\n` +
           `💰 Balance: ₦${user.balance.toLocaleString()}\n\n` +
           `📊 *${sapaLevel.level}*\n` +
           `💡 ${sapaLevel.advice}`;
  }
  
  // 3. INCOME TRACKING
  if (lowerMsg.includes('sent') || lowerMsg.includes('received') || lowerMsg.includes('alert')) {
    const amount = extractAmount(message);
    if (!amount) return "How much did you receive? Add amount!";
    
    user.balance += amount;
    user.transactions.push({
      type: 'income',
      amount,
      description: message,
      timestamp: new Date()
    });
    
    return `🎉 *Money Alert!*\n\n` +
           `💰 Received: ₦${amount.toLocaleString()}\n` +
           `🏦 Balance: ₦${user.balance.toLocaleString()}\n\n` +
           `💡 Manage am well o!`;
  }
  
  // 4. BALANCE CHECK
  if (lowerMsg.includes('balance') || lowerMsg === 'bal') {
    const sapaLevel = getSapaLevel(user.balance);
    return `💰 *Your Balance*\n\n` +
           `₦${user.balance.toLocaleString()}\n\n` +
           `📊 ${sapaLevel.level}\n` +
           `💡 ${sapaLevel.advice}`;
  }
  
  // 5. WEEKLY SUMMARY
  if (lowerMsg.includes('week') || lowerMsg.includes('summary')) {
    return getWeeklySummary(user);
  }
  
  // Default response
  return `🤔 I no understand that one!\n\n` +
         `Try:\n• Bought bread 500\n• Mum sent 10000\n• Balance\n• Help`;
}

// ========== HELPER FUNCTIONS ==========
function extractAmount(text) {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function getSapaLevel(balance) {
  if (balance <= 0) return {
    level: 'CRITICAL SAPA 😭',
    advice: 'Omo! Call home or activate side hustle ASAP!'
  };
  if (balance < 1000) return {
    level: 'HEAVY SAPA 😰',
    advice: 'Balance low o. Cook at home, avoid unnecessary spending.'
  };
  if (balance < 5000) return {
    level: 'LIGHT SAPA 🤔',
    advice: 'Manage well. You fit last if you no dey waste.'
  };
  return {
    level: 'TRENDING WELL 📈',
    advice: 'You dey alright! Keep managing your money wisely.'
  };
}

function getWelcomeMessage() {
  return `🎉 *Welcome to TRENDS!* 📈\n\n` +
         `Your AI Finance Assistant for smart students.\n\n` +
         `*Quick Start:*\n` +
         `• Bought bread 500\n` +
         `• Mum sent 10000\n` +
         `• Balance\n` +
         `• Help\n\n` +
         `Chat naturally - I understand Nigerian English! 🇳🇬`;
}

function getHelpMessage() {
  return `📚 *TRENDS COMMANDS*\n\n` +
         `💸 *Track Expenses:*\n` +
         `• Bought bread 500\n` +
         `• Spent 2000 on data\n` +
         `• Transport 1500\n\n` +
         `💰 *Track Income:*\n` +
         `• Mum sent 10000\n` +
         `• Got 5000 from hustle\n` +
         `• Received alert 20000\n\n` +
         `📊 *Check Status:*\n` +
         `• Balance\n` +
         `• My week\n` +
         `• My month\n\n` +
         `🎯 *Goals (Coming Soon):*\n` +
         `• Save 50000 for laptop\n\n` +
         `👥 *Groups (Coming Soon):*\n` +
         `• Split bills with friends\n\n` +
         `💡 Just chat naturally!`;
}

function getWeeklySummary(user) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekTransactions = user.transactions.filter(t => 
    t.timestamp > weekAgo
  );
  
  const expenses = weekTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const income = weekTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return `📊 *Weekly Summary*\n\n` +
         `💸 Spent: ₦${expenses.toLocaleString()}\n` +
         `💰 Received: ₦${income.toLocaleString()}\n` +
         `📈 Net: ₦${(income - expenses).toLocaleString()}\n\n` +
         `💡 Keep tracking to see your trends!`;
}

// ========== WEB SERVER ==========
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'Trends WhatsApp Bot',
    status: 'running',
    whatsapp: client.info ? 'connected' : 'disconnected',
    users: users.size,
    endpoints: ['/health', '/qrcode']
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    whatsapp: client.info ? 'connected' : 'disconnected',
    memory: process.memoryUsage()
  });
});

// Start everything
async function startServer() {
  // Start Express server
  app.listen(PORT, () => {
    console.log(`\n🚀 Trends server running on port ${PORT}`);
    console.log(`🌐 Web interface: http://localhost:${PORT}`);
    console.log(`📱 WhatsApp bot initializing...\n`);
  });
  
  // Initialize WhatsApp client
  await client.initialize();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});

// Start the bot
startServer().catch(console.error);
