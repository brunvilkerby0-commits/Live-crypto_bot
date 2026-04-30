from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Kle Bridgecard ou a
AUTH_TOKEN = "at_test_edc10d0f79bb447aa86e1214fe2ac6a4eef3580107d0a2ce0f7b088318ae71b3efd92321487058b5aa2a172c5c9ada1f77127640e99761cbfcb3578ba31b713a7a7a56f36e208521389f9c5745bd95c2bbc78858d625ce8ad9645ea6c8aea3f9fc5e44972e8ceaa1940833a9fe86f074989738d6df1702b1ede5a90fcbe63ffedc6e506c7bd35c3ffa714e53f38ee363f72ba8cfde4c1365aa3e5994176fa3ff2c0fe63da100665836f7b973b9e5c757a1af6e7df671b0b6291775e6c847bd57f429b34b3e5399ece8918f3c3d955c13677a548382ca04fbe3b57c3d3208c655b56d7d7aee88c1bb33bf0412fabc8692895c6894ff9a0b137f8c02899e1c40d6"

@app.route('/')
def home():
    return "Live Crypto Bot is Running!"

@app.route('/viza')
def viza_page():
    return render_template('viza.html')

@app.route('/create_card', methods=['POST'])
def create_card():
    url = "https://issuecards.api.bridgecard.co/v1/issuing/sandbox/cards/virtual"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "token": f"Bearer {AUTH_TOKEN}"
    }
    payload = {
        "card_type": "visa",
        "card_name": "Live Crypto Bot User",
        "currency": "USD",
        "amount": 2000 
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
