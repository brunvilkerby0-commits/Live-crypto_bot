const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 🛠️ FIX POU ERÈ 404 / CANNOT GET SOU RENDER
// Sa ap pèmèt sèvè a sèvi dashboard.html ak depot.html dirèkteman
app.use(express.static(__dirname));

// KONFIGIRASYON KLE SEKRE YO (Pran sa ou sot ban mwen yo)
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImViMDc4MGY5LWFmM2ItNDdmMC1iYmMwLWJkMDYyNGE2MTZlOSIsIm9yZ0lkIjoiNTE0MTk0IiwidXNlcklkIjoiNTI5MTIxIiwidHlwZUlkIjoiODg3MmUyM2YtOGM0OC00NTlkLWIxYTAtODY5Y2FjMTM3YmUzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3Nzc4NTg2MjAsImV4cCI6NDkzMzYxODYyMH0.yd2VSrxfG8fRV0SjvljYLZu2_nT3dm_Q0lw_GdS4YfY";
const TRONGRID_API_KEY = process.env.TRONGRID_API_KEY || "B418ed5d-1158-4e8d-9917-16967ba5e94e";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8650927753:AAENrCiVGi4m89bDj7fVz15Ax7nDUVnEYlc";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "8118891270";

// Paj akèy tès
app.get('/', (req, res) => {
    res.send('Sèvè Live Crypto Bot la ap mache byen! 🚀');
});

// ==========================================
// 🚨 ROUTE POU VERIFYE DEPO AUTOMATIKMAN (Blockchain)
// ==========================================
app.post('/verify_deposit', async (req, res) => {
    const { method, hash, userID, username, amount } = req.body;

    if (!method || !hash || !userID) {
        return res.status(400).json({ status: "error", message: "Enfòmasyon yo manke!" });
    }

    try {
        let isValid = false;
        let blockchainAmount = 0;

        // 1. VERIFIKASYON BEP20 (Atravè Moralis)
        if (method === 'BEP20') {
            const response = await axios.get(`https://deep-index.moralis.io/api/v2.2/transaction/${hash}?chain=bsc`, {
                headers: { 'X-API-Key': MORALIS_API_KEY }
            });
            
            if (response.data && response.data.receipt_status === "1") {
                isValid = true;
                // Moralis bay valè an Wei, nou konvèti l si nou vle (opsyonèl pou tès)
                blockchainAmount = amount; 
            }
        } 
        
        // 2. VERIFIKASYON TRC20 OUBYEN TRON (Atravè TronGrid)
        else if (method === 'TRC20' || method === 'TRON') {
            const response = await axios.get(`https://api.trongrid.io/v1/transactions/${hash}`, {
                headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY }
            });

            if (response.data && response.data.data && response.data.data.length > 0) {
                const txData = response.data.data[0];
                if (txData.ret && txData.ret[0].contractRet === 'SUCCESS') {
                    isValid = true;
                    blockchainAmount = amount;
                }
            }
        }

        // SI TRANZAKSYON AN PA VALID NAN BLOCKCHAIN LAN
        if (!isValid) {
            return res.json({ status: "invalid", message: "Tranzaksyon sa a pa jwenn sou blockchain an oswa li echwe! ❌" });
        }

        // 3. VOYE NOTIFIKASYON SOU TELEGRAM AK NON KLIYAN DINAMIK
        const klianNon = username || "Kliyan VIP";
        const msg = `📥 *DEPO OTOMATIK VALIDE* ✅\n\n👤 Kliyan: ${klianNon}\n🆔 ID Kliyan: ${userID}\n💰 Metòd: ${method}\n🆔 Hash: ${hash}\n💵 Montan deklare: ${amount}\n⚙️ Blockchain: Verifye ak siksè!`;

        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: msg,
            parse_mode: 'Markdown'
        });

        res.json({ status: "success", message: "Depo verifye epi apwouve otomatikman! 🎉" });

    } catch (error) {
        console.error("Erreur Verification:", error.message);
        res.status(500).json({ status: "error", message: "Erreur pandan n t ap verifye tranzaksyon an." });
    }
});

// ==========================================
// ROUTE BRIDGECARD (Kat Vityèl)
// ==========================================
app.post('/create_card', async (req, res) => {
    const TOKEN = process.env.BRIDGECARD_TOKEN || "at_test_edc10d0f79bb447aa86e1214fe2ac6a4eef3580107d0a2ce0f7b088318ae71b3efd92321487058b5aa2a172c5c9ada1f77127640e99761cbfcb3578ba31b713a7a7a56f36e208521389f9c5745bd95c2bbc78858d625ce8ad9645ea6c8aea3f9fc5e44972e8ceaa1940833a9fe86f074989738d6df1702b1ede5a90fcbe63ffedc6e506c7bd35c3ffa714e53f38ee363f72ba8cfde4c1365aa3e5994176fa3ff2c0fe63da100665836f7b973b9e5c757a1af6e7df671b0b6291775e6c847bd57f429b34b3e5399ece8918f3c3d955c13677a548382ca04fbe3b57c3d3208c655b56d7d7aee88c1bb33bf0412fabc8692895c6894ff9a0b137f8c02899e1c40d6";
    const amountRequested = req.body.amount || 500;

    try {
        const response = await axios.post('https://issuecards.api.bridgecard.co/v1/issuing/sandbox/cards/virtual', {
            card_type: "visa",
            card_name: "Live Crypto Bot Client",
            currency: "USD",
            amount: amountRequested
        }, {
            headers: { 
                'token': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        res.json({ status: "success", message: "Kat la kreye ak siksè! 🎉", data: response.data });
        
    } catch (error) {
        res.status(500).json({ status: "error", error: "Pwoblèm koneksyon ak Bridgecard" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Sèvè a limen byen pwòp sou pò ${PORT}`);
});
