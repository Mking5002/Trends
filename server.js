const express = require('express');
const axios = require('axios');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store users
const users = new Map();

// TRENDS Branding
const BRAND = {
  name: 'Trends',
  emoji: '📈',
  tagline: 'Your AI Finance Assistant',
  color: '#3B82F6'
};

// Health check
app.get('/', (req, res) => {
  res.json({
    app: BRAND.name,
    status: 'running',
    tagline: BRAND.tagline,
    endpoints: ['/webhook', '/health', '/commands']
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    users: users.size,
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    console.log('📱 Webhook received:', req.body);
    
    const { event, data } = req.body;
    
    if (event === 'message:incoming:new') {
      const { from, text } = data;
      
      // Process message with Nigerian flair
      const response = processTrendsMessage(text, from);
      
      // Send reply via WATI
      await sendWATIReply(from, response);
    }
    
    res.status(200).json({ status: 'processed' });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Process messages with TRENDS logic
function processTrendsMessage(message, userId) {
  const lower = message.toLowerCase();
  
  // Initialize user
  if (!users.has(userId)) {
    users.set(userId, {
      balance: 0,
      transactions: [],
      goals: [],
      createdAt: new Date()
    });
    
    return `🎉 *Welcome to ${BRAND.name}!* 📈\n\n` +
           `I'm your AI finance assistant for smart students.\n\n` +
           `*Try these:*\n` +
           `• Bought bread 500\n` +
           `• Mum sent 10000\n` +
           `• Balance\n` +
           `• Help\n\n` +
           `Chat naturally - I get Nigerian students! 🇳🇬`;
  }
  
  const user = users.get(userId);
  
  // Your React logic will go here
  if (lower.includes('bought') || lower.includes('spent')) {
    return `✅ *Expense tracked*\nAmount logged successfully!`;
  }
  
  if (lower.includes('balance') || lower === 'bal') {
    return `💰 *Your Balance*\n₦${user.balance.toLocaleString()}`;
  }
  
  if (lower.includes('help')) {
    return getHelpMessage();
  }
  
  return `🤔 I no understand that one!\nType *help* for commands.`;
}

function getHelpMessage() {
  return `📚 *${BRAND.name.toUpperCase()} COMMANDS* 📚\n\n` +
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
         `🎯 *Goals:*\n` +
         `• Save 50000 for laptop\n` +
         `• My goals\n\n` +
         `👥 *Groups:*\n` +
         `• Group party 20000 5\n` +
         `• My groups\n\n` +
         `💡 Just chat normally! I understand you.`;
}

// Send reply via WATI
async function sendWATIReply(phone, message) {
  try {
    const response = await axios.post(
      `${process.env.WATI_BASE_URL}/sendMessage`,
      {
        phone: phone,
        message: message
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WATI_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Reply sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Send failed:', error.message);
    return null;
  }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 ${BRAND.emoji} ${BRAND.name} Bot Started!
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  📱 Status: Ready for WhatsApp
  `);
});
