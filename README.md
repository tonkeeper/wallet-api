# Tonkeeper Wallet API (DRAFT)

⚠️ This documentation is work-in-progress. Some features are not yet implemented.

* [Definitions](#definitions)
* [Payment URLs](#payment-urls)
* [Authentication](#authentication-methods)
* [Transaction Request](#transaction-request)
* [Basic transfers](#basic-transfers)
  * [Payment](#unauthenticated-transfers)
  * [Donation](#unauthenticated-donations)
  * [Deploy](#unauthenticated-transfers)
  * [SignRawPayload](#unauthenticated-transfers)
* [Subscriptions](#subscriptions)


## Definitions

#### Authentication

Protocol for identifying the origin of the request (e.g. recipient of funds)
with some root of trust. The trust could be linked to the Certificate Authority certificates (Web PKI) embedded in the OS, to a custom record on Tonkeeper backend, or provided implicitly for the embedded services.

#### Authenticated object

The object’s origin has a verified chain of trust.

#### Unauthenticated object

The object’s origin is unknown and must be verified by the user through some other means unavailable to the wallet application.

#### Unsigned object

The object does not have an explicit cryptographic signature that helps authenticating it directly.
But it may still be authenticated via other means (e.g. over TLS connection).

#### Signed object

The object is explicitly signed and can be authenticated through the public key.
That public key is then used to authenticate the object (e.g. pulling it from the list of known origins).


## Payment URLs

#### Unauthenticated transfers

```
ton://transfer/<address>
ton://transfer/<address>?amount=<nanocoins>
ton://transfer/<address>?text=<url-encoded-utf8-text>
ton://transfer/<address>?bin=<url-encoded-base64-boc>
ton://transfer/<address>?bin=<url-encoded-base64-boc>&init=<url-encoded-base64-boc>

https://app.tonkeeper.com/transfer/<address>
https://app.tonkeeper.com/transfer/<address>?amount=<nanocoins>
https://app.tonkeeper.com/transfer/<address>?text=<url-encoded-utf8-text>
https://app.tonkeeper.com/transfer/<address>?bin=<url-encoded-base64-boc>
https://app.tonkeeper.com/transfer/<address>?bin=<url-encoded-base64-boc>&init=<url-encoded-base64-boc>
```

Opens the pre-filled Send screen and offers user to enter the missing data.

```
ton://transfer/<address>?
    amount=<nanocoins>&
    text=<url-encoded-utf8-text>

https://app.tonkeeper.com/transfer/<address>?
    amount=<nanocoins>&
    text=<url-encoded-utf8-text>
```

Opens a compact confirmation dialog with all data filled-in. 
User cannot edit any of the info and can only confirm or dismiss the request.

#### Unauthenticated donations

WIP.

```
https://app.tonkeeper.com/donate/<address>?
    amounts[]=<nanocoins1>&
    amounts[]=<nanocoins2>&
    allow_custom=<0|1>&
    text=...
```

Displays a specialized donation/tip interface.

* `amounts` — array of possible amounts to choose from (max 3)
* `allow_custom` (0, 1) — whether wallet allows user-editable amount field or not. Default is `0`.
* `text` — pre-filled comment (optional).


#### Unauthenticated contract deploys

⚠️ DEPRECATED: use bin/init params (see above)

```
https://app.tonkeeper.com/deploy/<address>?
    amount=<nanocoins>&
    stateinit=<hex>&
    [text=<url-encoded-utf8-text>]
```

`stateinit` is a required field with hex-encoded bag-of-cells with one StateInit cell.

Opens a compact confirmation dialog with all data filled-in.
User cannot edit any of the info and can only confirm or dismiss the request.

Destination address must be verified as follows (TonWeb example):

```js
const stateInitCell = Cell.oneFromBoc(uriparams.stateinit);
const hash = await stateInitCell.hash();
const address = new Address(uriparams.address);
const valid = (address.hashPart == hash);
```


#### Unauthenticated NFT transfer

```
https://app.tonkeeper.com/transfer/<destination-address>?
    [nft=<nft-address>&]
    [fee-amount=<nanocoins>&]
    [forward-amount=<nanocoins>]
    
ton://transfer/<destination-address>?
    [nft=<nft-address>&]
    [fee-amount=<nanocoins>&]
    [forward-amount=<nanocoins>] 
```

Opens the pre-filled NFT-send screen and offers user to enter the missing data.
* `to`: (string) destination account ID. Optional.
* `fee-amount` (decimal string): nanocoins to be sent to the item’s contract for paying fee. All not used TONs should be returned back by NFT. If not specified default value will be used - 1 TON.
* `forward-amount` (decimal string): nanocoins to be sent as a notification to the new owner. If not specified default value will be used - 1 nanoTON.


#### Unauthenticated Jetton transfer

```
https://app.tonkeeper.com/transfer/<destination-address>?
    [jetton=<jetton-master-address>&]
    [amount=<elementary units>&]
    [fee-amount=<nanocoins>&]
    [forward-amount=<nanocoins>]
    
ton://transfer/<destination-address>?
    [jetton=<jetton-master-address>&]
    [amount=<elementary units>&]
    [fee-amount=<nanocoins>&]
    [forward-amount=<nanocoins>] 
```

#### Unauthenticated inscription token transfer

```
https://app.tonkeeper.com/inscription-transfer/<destination-address>?
    [ticker=<inscription-ticker>&]
    [amount=<elementary units>&]
    [type=<inscription-standart>&]
```

Opens the pre-filled Jetton-send screen and offers user to enter the missing data.
* `to`: (string) destination account ID. Optional.
* `amount` (decimal string): amount of transferred jettons in elementary units.
* `fee-amount` (decimal string): nanocoins to be sent to the Jetton contract for paying fee. All not used TONs should be returned back by Jetton contract. If not specified default value will be used - 1 TON.
* `forward-amount` (decimal string): nanocoins to be sent as a notification to the destination account. If not specified default value will be used - 1 nanoTON.



#### Transaction Request URL

Transaction request can be communicated to the wallet in 3 different ways:

* Direct link to download [Transaction Request](#transaction-request).
* Inline TR object wrapped in a Tonkeeper universal link.
* Wrapped TR link in a Tonkeeper universal link.

#### Direct Transaction Request URL

Any URL that returns JSON-encoded [Transaction Request](#transaction-request).

```
https://example.com/<...>.json
```

#### Inline Transaction Request

A universal link wrapping [Transaction Request](#transaction-request) so that it can be opened

```
https://app.tonkeeper.com/v1/txrequest-inline/<base64url(TransactionRequest)>
```

#### Wrapped Transaction Request URL

Here the URL to download transaction request is wrapped in universal link.

The URL is requested using `https://` scheme.

```
https://app.tonkeeper.com/v1/txrequest-url/<example.com/...json>
```


## Authentication methods

There are three ways to authenticate authors of transaction requests: 

1. The recipient’s address is known to the wallet and we could use [unauthenticated transfer](#unauthenticated-transfer) link or [unsigned transaction request](#unsigned-transaction-request). This is the case for whitelisted addresses and opening links from within embedded apps (webview/iframe).
2. The recipient has a web backend: then we can rely on classic TLS certificates (web PKI) to authenticate the hostname by downloading an [unsigned transaction request](#unsigned-transaction-request) object via secure TLS connection.
3. Telegram users and channels authenticated through Tonkeeper bot that registers `author_id` public key for invoice identification.



## Transaction Request

#### Unsigned Transaction Request

Unsigned request is suitable in the following scenarios:

1. The request is loaded through TLS connection by the wallet and the hostname could be used as an authenticated identifier.
2. The webapp is loaded within the wallet application, where it is already authenticated through other means.
3. The webapp is serverless and the wallet is a browser extension that relies on the host user agent (the browser) to validate hostname via TLS.

In other cases, when the operation is completely unauthenticated, the wallet may still permit operation, but explicitly show that the initiator transaction requestor (e.g. recipient of transfer)

```
{
    "version": "0",
    "body": TransactionRequestBody,
}
```

#### Signed Transaction Request

Signed request is signed by a public key registered with Tonkeeper.

```
{
    "version": "1",
    "author_id": Base64(Ed25519Pubkey),
    "body": Base64(TransactionRequestBody),
    "signature": Base64(Ed25519Signature),
}
```

The transaction request validation procedure when `version` is `"1"`:

1. Discard if the local time is over the expiration time `expires_sec`.
2. Check the `signature` over `body` against the public key `author_id`.
    * Message for signing: `"TONTxRequestV1"` concatenated with the body.
3. Parse the [Transaction Request Body](#transaction-request-body)

Unknown version is rejected as unknown and unsupported.

#### Transaction Request Body

Request params are specific for each `type`.

Body attributes:

`type` (string): indicates the type of the `params` object.

`expires_sec` (integer): UNIX timestamp in seconds after which the client must discard the request (per its local clock).

`response_options`: JSON object describing return and callback URLs.

Transaction request must be discarded if the local time is greater than the `expires_sec`.

```
{
    "type": "transfer" |
            "donation" |
            "deploy" |
            "sign-raw-payload",

    "expires_sec: integer,

    "response_options": ResponseOptions,
    
    "params": TransferParams |
              DonationParams |
              DeployParams |
              SignBoc
}
```

#### Response Options

There could be several ways (not mutually exclusive) to respond to the transaction request:

1. Simply publish the transaction; the requesting party will be notified over the blockchain network.
2. Send the transaction via the callback to the server.
3. Send the transaction via the return URL that user opens upon confirmation.

Parameters:

* (Not supported yet) `broadcast` (boolean, required): indicates whether the wallet should broadcast the transaction directly to the TON network. If set to `true`, we must broadcast before triggering `callback_url` (if it’s present).

* `return_url` (optional): URL that user opens on their device after successful login. This will include the fully-signed TON transaction in a query string under the key `tontx` (encoded in URL-safe Base64).

* `return_serverless` (optional): boolean value indicating that `tontx` parameter must be provided as a URL anchor (via `#`). Example: `https://example.com/...#tontx=` (tx is encoded in URL-safe Base64). 

* `callback_url` (optional): URL that user opens on their device after successful login. Signed transaction will be included in a query string under the key `tontx` (encoded in URL-safe Base64).

```
{
    "broadcast": false,
    "return_url": "https://...",
    "callback_url": "https://...",
}
```

## Basic transfers

### Transfer

WIP.


### Donation

WIP.


### Deploy

[Transaction request](#transaction-request) object with type `deploy`.

Parameters:

* `address` (string)
* `stateInitHex` (string): hex-encoded collection contract code BoC with one cell encapsulating entire StateInit
* `amount` (decimal string): nanotoncoins.
* `text` (string, optional): text message that must be attached to the deploy operation

Opens a compact confirmation dialog with all data filled-in.
User cannot edit any of the info and can only confirm or dismiss the request.

Destination address must be verified as follows (TonWeb example):

```js
const stateInitCell = Cell.oneFromBoc(params.stateInitHex);
const hash = await stateInitCell.hash();
const address = new Address(params.address);
const valid = (address.hashPart == hash);
```


### SignRawPayload

[Transaction request](#transaction-request) object with type `sign-raw-payload`.

Parameters:

* `source` (string, optional): sender address. Provided in case the source of transaction is important to the dapp. Wallet application must select the appropriate wallet contract to send the message from, or post an error if it does not have the keys to that specific address.
* `valid_until` (integer, optional): unix timestamp. after th moment transaction will be invalid.
* `messages` (array of messages): 1-4 outgoing messages from the wallet contract to other accounts. All messages are sent out in order, however **the wallet cannot guarantee that messages will be delivered and executed in same order**.

Message structure:
* `address` (string): message destination
* `amount` (decimal string): number of nanocoins to send.
* `payload` (string base64, optional): raw one-cell BoC encoded in Base64.
* `stateInit` (string base64, optional): raw once-cell BoC encoded in Base64.

Wallet simulates the execution of the message and present to the user summary of operations: "jetton XYZ will be transferred, N toncoins will be sent" etc.

Common cases:

1. No `payload`, no `stateInit`: simple transfer without a message.
2. `payload` is prefixed with 32 zero bits, no `stateInit`: simple transfer with a text message.
3. No `payload` or prefixed with 32 zero bits; `stateInit` is present: deployment of the contract.

Example:

```json5
{
  "source": "0:E8FA2634A24AEF18ECB5FD4FC71A21B9E95F05768F8D9733C44ED598DB106C4C",
  "valid_until": 1658253458,
  "messages": [
    {
      "address": "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F",
      "amount": "20000000",
      "stateInit": "base64bocblahblahblah==" //deploy contract
    },{
      "address": "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3",
      "amount": "60000000",
      "payload": "base64bocblahblahblah==" //transfer nft to new deployed account 0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F
    }
  ]
}
```


## Subscriptions

TBD: describe the API to submit subscriptions

```
https://app.tonkeeper.com/v1/subscribe/<invoice-id>
```

