// Nan kòd server.js la, ranje pati sa a:
const response = await axios.post('https://issuecards.api.bridgecard.co/v1/issuing/sandbox/cards/virtual', {
    card_type: "visa",
    card_name: "Live Crypto Bot Client", // Nou mete non pwojè w la
    currency: "USD",
    amount: 500 
}, 
