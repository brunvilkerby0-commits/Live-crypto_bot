const TelegramBot = require("node-telegram-bot-api");
const admin = require("firebase-admin");

const token = "METE_TOKEN_BOT_OU";

// 🔐 Firebase admin key
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const bot = new TelegramBot(token, { polling: true });

/* ===================== USER INIT ===================== */
async function getUser(id, refId = null) {
  const ref = db.collection("users").doc(String(id));
  const doc = await ref.get();

  if (!doc.exists) {
    await ref.set({
      solde: 0,
      vip: 0,
      trans: 0,
      password: "1234",
      lastTask: 0,
      ref: refId || null
    });

    // bonus parrainage
    if (refId) {
      const parent = db.collection("users").doc(String(refId));
      const pdoc = await parent.get();

      if (pdoc.exists) {
        await parent.update({
          solde: pdoc.data().solde + 1
        });
      }
    }
  }

  return ref;
}

/* ===================== START ===================== */
bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
  let id = msg.chat.id;
  let refId = match[1];

  await getUser(id, refId);

  bot.sendMessage(id,
    "🚀 Welcome Crypto Bot\n\nID: " + id
  );

  menu(id);
});

/* ===================== MENU ===================== */
function menu(chatId) {
  bot.sendMessage(chatId, "🏠 Menu", {
    reply_markup: {
      keyboard: [
        ["💰 Solde", "👑 VIP"],
        ["📋 Tâches", "➕ Dépôt"],
        ["💸 Retrait", "📊 Stats"],
        ["🔗 Parrainage"]
      ],
      resize_keyboard: true
    }
  });
}

/* ===================== SOLDE ===================== */
bot.onText(/💰 Solde/, async (msg) => {
  let ref = await getUser(msg.chat.id);
  let d = (await ref.get()).data();

  bot.sendMessage(msg.chat.id, "💰 Solde: " + d.solde + "$");
});

/* ===================== VIP ===================== */
bot.onText(/👑 VIP/, async (msg) => {
  let ref = await getUser(msg.chat.id);
  let d = (await ref.get()).data();

  if (d.solde >= 10) {
    await ref.update({
      solde: d.solde - 10,
      vip: 1
    });
    bot.sendMessage(msg.chat.id, "👑 VIP activé");
  } else {
    bot.sendMessage(msg.chat.id, "❌ Solde insuffisant");
  }
});

/* ===================== TASK 24H ===================== */
bot.onText(/📋 Tâches/, async (msg) => {
  let ref = await getUser(msg.chat.id);
  let d = (await ref.get()).data();

  let now = Date.now();

  if (now - d.lastTask < 86400000) {
    bot.sendMessage(msg.chat.id, "⏳ Reviens dans 24h");
    return;
  }

  await ref.update({
    solde: d.solde + 2,
    lastTask: now
  });

  bot.sendMessage(msg.chat.id, "✅ +2$ ajouté");
});

/* ===================== DEPOT (SIMULATION / FUTURE USDT HOOK) ===================== */
bot.onText(/➕ Dépôt/, async (msg) => {
  let ref = await getUser(msg.chat.id);
  let d = (await ref.get()).data();

  await ref.update({
    solde: d.solde + 5,
    trans: d.trans + 1
  });

  bot.sendMessage(msg.chat.id, "💸 Dépôt confirmé (+5$ demo)");
});

/* ===================== RETRAIT ===================== */
bot.onText(/💸 Retrait/, (msg) => {
  bot.sendMessage(msg.chat.id,
    "💸 Tape:\nretrait montant motdepasse"
  );
});

bot.on("message", async (msg) => {
  if (!msg.text || !msg.text.startsWith("retrait")) return;

  let parts = msg.text.split(" ");
  let amount = parseFloat(parts[1]);
  let pass = parts[2];

  let ref = await getUser(msg.chat.id);
  let d = (await ref.get()).data();

  if (pass !== d.password) {
    bot.sendMessage(msg.chat.id, "❌ Mot de passe incorrect");
    return;
  }

  if (amount > d.solde) {
    bot.sendMessage(msg.chat.id, "❌ Solde insuffisant");
    return;
  }

  await db.collection("withdraws").add({
    userId: String(msg.chat.id),
    amount,
    status: "pending",
    date: Date.now()
  });

  bot.sendMessage(msg.chat.id, "⏳ Retrait envoyé (pending)");
});

/* ===================== STATS ===================== */
bot.onText(/📊 Stats/, async (msg) => {
  let ref = await getUser(msg.chat.id);
  let d = (await ref.get()).data();

  bot.sendMessage(msg.chat.id,
    "📊 Transactions: " + d.trans
  );
});

/* ===================== PARRAINAGE ===================== */
bot.onText(/🔗 Parrainage/, (msg) => {
  let id = msg.chat.id;

  bot.sendMessage(msg.chat.id,
    "🔗 Ton lien:\nhttps://t.me/TONBOT?start=" + id
  );
});
