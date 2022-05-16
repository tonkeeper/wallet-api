# Tonkeeper Wallet API

* [Definitions](#definitions)
* [Payment URLs](#payment-urls)
* [Authentication](#authentication)
* [Transaction Request](#transaction-request)
* [NFTs](#nfts)
  * [Deploy NFT collection](#deploy-nft-collection)
  * [Deploy NFT item](#deploy-nft-item)
  * [Change Collection Owner](#change-nft-owner)
  * [Transfer NFT](#transfer-nft)
  * [Basic NFT Sale](#basic-nft-sale)
  * [Getgems NFT Sale](#getgems-nft-sale)
  * [Cancel NFT Sale](#cancel-nft-sale)
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

https://app.tonkeeper.com/transfer/<address>
https://app.tonkeeper.com/transfer/<address>?amount=<nanocoins>
https://app.tonkeeper.com/transfer/<address>?text=<url-encoded-utf8-text>
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


## Authentication

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
            "nft-collection-deploy" |
            "nft-item-deploy" |
            "nft-change-owner" |
            "nft-transfer" |
            "nft-sale-place-getgems" |
            "nft-sale-cancel",

    "expires_sec: integer,

    "response_options": ResponseOptions,
    
    "params": TransferParams |
              DonationParams |
              NftCollectionDeployParams |
              NftItemDeployParams |
              NftChangeOwnerParams |
              NftTransferParams |
              NftSalePlaceParams |
              NftSaleCancelParams
}
```

#### Response Options

There could be several ways (not mutually exclusive) to respond to the transaction request:

1. Simply publish the transaction; the requesting party will be notified over the blockchain network.
2. Send the transaction via the callback to the server.
3. Send the transaction via the return URL that user opens upon confirmation.

Parameters:

`broadcast` (boolean, required): indicates whether the wallet should broadcast the transaction directly to the TON network. If set to `true`, we must broadcast before triggering `callback_url` (if it’s present).

`return_url` (optional): URL that user opens on their device after successful login. This will include the fully-signed TON transaction in a query string under the key `tontx` (encoded in URL-safe Base64).

`return_serverless` (optional): boolean value indicating that `tontx` parameter must be provided as a URL anchor (via `#`). Example: `https://example.com/...#tontx=` (tx is encoded in URL-safe Base64). 

`callback_url` (optional): URL that user opens on their device after successful login. Signed transaction will be included in a query string under the key `tontx` (encoded in URL-safe Base64).

```
{
    "broadcast": false,
    "return_url": "https://...",
    "callback_url": "https://...",
}
```



## NFTs

### Deploy NFT collection

[Transaction request](#transaction-request) object with type `nft-collection-deploy`.

Parameters:

* `ownerAddress` (string, optional)
* `royalty` (float): 
* `royaltyAddress` (string)
* `collectionContentUri` (string): URI to the collection content
* `nftItemContentBaseUri` (string): URI to the item content
* `nftItemCodeHex` (string): hex-encoded contract code
* `amount` (integer): nanotoncoins 

If the `ownerAddress` is set: 
* single-wallet app checks that the address matches user’s address.
* multi-wallet app selects the wallet with the matching address; fails otherwise.

If the `ownerAddress` is missing: wallet app uses the current address.

Note: `ownerAddress` cannot be set to some other wallet, not controlled by the initiator of the transaction.

If the `royaltyAddress` is set and not equal to the `ownerAddress` wallet app shows separate line with royalty recipient.

Primary confirmation UI displays:

* Royalty address (if not the same as the wallet).
* Royalty (%): fraction formatted in percents.
* Fee: actual tx fee + amount (which will be deposited on the interim contracts)

Secondary UI with raw data:

* NFT Collection ID: EQr6...jHyR (TODO: check if that must be front-and-center or not)
* collectionContentUri
* nftItemContentBaseUri
* nftItemCodeHex


### Deploy NFT item

[Transaction request](#transaction-request) object with type `nft-item-deploy`.

Parameters:

* `ownerAddress` (string, optional)
* `nftCollectionAddress` (string)
* `amount` (integer): nanocoins to be sent to the item’s contract
* `itemIndex` (integer): index of the item in the collection
* `itemContentUri` (string): path to the item description

If the `ownerAddress` is set: 
* single-wallet app checks that the address matches user’s address.
* multi-wallet app selects the wallet with the matching address; fails otherwise.

If the `ownerAddress` is missing: wallet app uses the current address.

Note: `ownerAddress` cannot be set to some other wallet, not controlled by the initiator of the transaction.

Primary confirmation UI displays:

* Item Name
* Collection Name
* Fee: actual tx fee + amount (which will be deposited on the interim contracts)

Secondary UI with raw data:

* Item Index (TODO: figure out what happens if this clashes with existing one)
* NFT Collection ID
* itemContentUri


### Change Collection Owner

[Transaction request](#transaction-request) object with type `nft-change-owner`.

Parameters:

* `newOwnerAddress` (string)
* `nftCollectionAddress` (string)
* `amount` (integer): nanocoins to be sent to the item’s contract

Primary confirmation UI displays:

* New owner address: `EQrJ...`
* Fee: `<actual tx fee + amount>`

Secondary UI with raw data:

* NFT Collection ID



### Transfer NFT

[Transaction request](#transaction-request) object with type `nft-transfer`.

Parameters:

* `newOwnerAddress` (string): recipient’s wallet
* `nftItemAddress` (string): ID of the nft item
* `amount` (integer): nanocoins to be sent to the item’s contract
* `forwardAmount` (integer): nanocoins to be sent as a notification to the new owner
* `text` (string, optional): optional comment

Wallet must validate that the `forwardAmount` is less or equal to the `amount`.

Primary confirmation UI displays:

* Recipient:   `EQjTpY...tYj82s`
* Fee: `<actual tx fee + amount>`
* Text: `<freeform comment>`

Secondary:

* NFT Item ID: `Ekrj...57fP`


### Basic NFT Sale

(WIP)

[Transaction request](#transaction-request) object with type `nft-sale-place`.

Parameters:

* `marketplaceAddress` (string): address of the marketplace
* `nftItemAddress` (string): identifier of the specific nft item
* `fullPrice` (integer): price in nanocoins
* `marketplaceFee` (integer): nanocoins as marketplace fee
* `royaltyAddress` (string): address for the royalties
* `royaltyAmount` (integer): nanotoncoins sent as royalties
* `amount` (integer): nanotoncoins sent as commission with the message

Primary confirmation UI displays:

* Marketplace: `EQh6...`
* Price: `100.00 TON`
* Your proceeds: `79.64 TON`
* Fees & royalties: `<txfee + amount + marketplace fee + royalties>`

Secondary UI:

* NFT item ID: `EQr4...`
* Marketplace fee: `10 TON`
* RoyaltyAddress: `Eqt6...`
* Royalty: `5 TON`
* Blockchain fee: `0.572 TON` (txfee + amount)




### Getgems NFT Sale

[Transaction request](#transaction-request) object with type `nft-sale-place-getgems`.

Parameters:

* `marketplaceFeeAddress` (string): fee-collecting address
* `marketplaceFee` (integer): nanocoins as marketplace fee
* `royaltyAddress` (string): address for the royalties
* `royaltyAmount` (integer): nanotoncoins sent as royalties
* `createdAt`: (integer): UNIX timestamp of the sale creation date
* `marketplaceAddress` (string): address of the marketplace
* `nftItemAddress` (string): identifier of the specific nft item
* `ownerAddress` (string): owner of the NFT item
* `fullPrice` (integer): price in nanocoins
* `amount` (integer): nanotoncoins sent as commission with the message
* `messageHex` (string): hex-encoded message string (that fits in one TVM cell)
* `marketplaceSignatureHex` (string): hex-encoded signature 

Primary confirmation UI displays:

* Marketplace: `EQh6...`
* Price: `100.00 TON`
* Your proceeds: `79.64 TON`
* Fees & royalties: `<txfee + amount + marketplace fee + royalties>`

Secondary UI:

* NFT item ID: `EQr4...`
* Marketplace fee: `10 TON`
* Marketplace fee address: `EQmAr...`
* RoyaltyAddress: `EQRy1t...`
* Royalty: `5 TON`
* Blockchain fee: `0.572 TON` (txfee + amount)

TBD: Cell layout for the above data.

Wallet performs the following:

1. Computes sale contract address `S`.
2. Prepares wrapped message for the GetGems marketplaces that deploys `S`.
3. Publishes the transaction to the marketplace address.
4. Waits till `S` is published (3 attempts with 10 second delay).
5. When `S` is published, automatically perform transfer of ownership for the token to address `S`.




### Cancel NFT Sale

[Transaction request](#transaction-request) object with type `nft-sale-cancel`.

Parameters:

* `saleAddress` (string): address of the sale contract
* `ownerAddress` (string): owner of the NFT item
* `amount` (integer): nanotoncoins sent as commission with the message

Wallet must verify that it owns the `ownerAddress` and select the appropriate secret key and wallet contract to send the message from.

Primary confirmation UI displays:

* Sale address: `EQr4...`
* Fee: `<txfee>`







## Subscriptions

TBD: describe the API to submit subscriptions

```
https://app.tonkeeper.com/v1/subscribe/<invoice-id>
```

