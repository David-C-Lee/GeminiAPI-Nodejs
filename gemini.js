base_url = "https://api.gemini.com";

var bSandbox = false;
// bSandbox = true;                                                             // TOGGLE THIS

// sandbox
sandbox_url = "https://api.sandbox.gemini.com"
if (bSandbox) {
    base_url = sandbox_url;
    secret = "";                                                          //EDIT THESE
    gemini_api_key = "";
}

if (!bSandbox) {
    secret = "";                                                          //EDIT THESE
    gemini_api_key = "";

    // 2nd account
    // secret = "";                                                          //TOGGLE THESE
    // gemini_api_key = "";
}

gemini_api_secret = unescape(encodeURIComponent(secret));

// Creates a nonce for the payload
strPayload_nonce = Date.now().toString();

// Encodes the payload into JSON so that Gemini can accept it
var json_payload;


// This starts the payload. EDIT this for a new order.
symbol = "ethusd";
side = "buy";
total = 149.99                              // dollars (or counter (i.e 2nd) currency)
price = 3199.99

bStopLimit = false;
// bStopLimit = true;                                                           // TOGGLE THIS
stopPrice = "3099";

// Truncates to 6 decimals
amount = Math.trunc(total / price * 1000000) / 1000000; 
strAmount = amount.toString();
strPrice = price.toString();
// strAmount = "1.3248";                    // amount (1st currency) to override total (TOGGLE THIS)

var bCancelOrder = false;
// bCancelOrder = true;                                                         // TOGGLE THIS
var orderId = 1623456789;                                                       // EDIT THIS

var bActiveOrders = false;
// bActiveOrders = true;                                                        // TOGGLE THIS. Returns your active orders

var bBalances = false;
// bBalances = true;                                                            // TOGGLE THIS

var bHistory = false;
// bHistory = true;                                                             // TOGGLE THIS

var bAccounts = false;
// bAccounts = true;                                                            // TOGGLE THIS, can only use if API key is a Master level key

// TODO: implement cmd line arguments for the above options


orderEndpoint = "/v1/order/new";
orderPayload = {
    "request": "/v1/order/new",
    "nonce": strPayload_nonce,
    "symbol": symbol,
    "amount": strAmount,
    "price": strPrice,
    "side": side,
    "type": "exchange limit",
    "options": ["maker-or-cancel"],
    "account": "primary"
}

if (bStopLimit)
{
    orderPayload = {
        "request": "/v1/order/new",
        "nonce": strPayload_nonce,
        "symbol": symbol,
        "amount": strAmount,
        "price": strPrice,
        "side": side,
        "type": "exchange stop limit",
        "stop_price": stopPrice,
        "account": "primary"
    }
}

cancelOrderEndpoint = "/v1/order/cancel";
cancelOrderPayload = {
    "request": cancelOrderEndpoint,
    "nonce": strPayload_nonce,
    "order_id": orderId,
    "account": "primary"
}

activeOrdersEndpoint = "/v1/orders";
activeOrdersPayload = {
    "request": activeOrdersEndpoint,
    "nonce": strPayload_nonce,
    "account": "primary"
}

balancesEndpoint = "/v1/balances";
balancesPayload = {
    "request": balancesEndpoint,
    "nonce": strPayload_nonce,
    "account": "primary"
}

historyEndpoint = "/v1/mytrades";
historyPayload = {
    "request": "/v1/mytrades",
    "nonce": strPayload_nonce,
    "symbol": symbol,
    "account": "primary"
}

accountsEndpoint = "/v1/account/list";
accountsPayload = {
    "request": "/v1/account/list",
    "nonce": strPayload_nonce
}

if (bAccounts) {
    url = base_url + accountsEndpoint;
    json_payload = JSON.stringify(accountsPayload);
    console.log("Accounts:")
} else if (bHistory) {
    url = base_url + historyEndpoint;
    json_payload = JSON.stringify(historyPayload);
    console.log("Trade history:")
} else if (bBalances) {
    url = base_url + balancesEndpoint;
    json_payload = JSON.stringify(balancesPayload);
    console.log("Balances:")
} else if (bActiveOrders) {
    url = base_url + activeOrdersEndpoint;
    json_payload = JSON.stringify(activeOrdersPayload);
    console.log("Open orders:")
} else if (bCancelOrder) {
    url = base_url + cancelOrderEndpoint;
    json_payload = JSON.stringify(cancelOrderPayload);
    console.log("Order cancelled:")
} else {
    url = base_url + orderEndpoint;
    json_payload = JSON.stringify(orderPayload);
    console.log("Order execution:")
}

encoded_payload = unescape(encodeURIComponent(json_payload));
b64 = Buffer.from(encoded_payload).toString('base64');

// Signs the encoded payload
const CryptoJS = require("crypto-js");
const hash = CryptoJS.HmacSHA384(b64, gemini_api_secret);
signature = hash.toString(CryptoJS.enc.Hex);

// Packages the HTTP request
const fetch = require("node-fetch");
const myHeaders = new fetch.Headers({
                    'Content-Type': "text/plain",
                    'Content-Length': "0",
                    'X-GEMINI-APIKEY': gemini_api_key,
                    'X-GEMINI-PAYLOAD': b64,
                    'X-GEMINI-SIGNATURE': signature,
                    'Cache-Control': "no-cache" 
                });

// Sends the above
fetch(url, {
    method : "POST",
    headers : myHeaders
}).then(
    response => response.json()
).then(
    console.log(bSandbox ? "[Sandbox] " : ""),
    console.log(Date(Date.now()).toLocaleString('en-US')),
).then(
    json => console.log(json)
);
