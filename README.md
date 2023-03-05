# Tonkeeper Wallet API

* [Definitions](#definitions)
* [Payment URLs](#payment-urls)
* [Authentication](#authentication)
* [Transaction Request](#transaction-request)
* [Basic transfers](#basic-transfers)
  * [Payment](#payment)
  * [Donation](#donation)
  * [Deploy](#deploy)
* [NFTs](#nfts)
  * [Deploy NFT collection](#deploy-nft-collection)
  * [Deploy NFT item](#deploy-nft-item)
  * [Deploy Single NFT](#deploy-single-nft)
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

#### Unauthenticated token transfers

```
https://app.tonkeeper.com/jetton-transfer/<jettonid>
https://app.tonkeeper.com/jetton-transfer/<jettonid>/<address>?amount=<nanocoins>
https://app.tonkeeper.com/jetton-transfer/<address>?text=<url-encoded-utf8-text>
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
            "deploy" |
            "nft-collection-deploy" |
            "nft-item-deploy" |
            "nft-single-deploy" |
            "nft-change-owner" |
            "nft-transfer" |
            "nft-sale-place-getgems" |
            "nft-sale-cancel",

    "expires_sec: integer,

    "response_options": ResponseOptions,
    
    "params": TransferParams |
              DonationParams |
              DeployParams |
              NftCollectionDeployParams |
              NftItemDeployParams |
              NftSingleDeployParams |
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
* `amount` (decimal string): nanotoncoins
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


## NFTs

### Deploy NFT collection

[Transaction request](#transaction-request) object with type `nft-collection-deploy`.

Parameters:

* `ownerAddress` (string, optional)
* `royalty` (float): number from 0 to 1.
* `royaltyAddress` (string)
* `collectionContentUri` (string): URI to the collection content
* `nftItemContentBaseUri` (string): URI to the item content
* `nftCollectionStateInitHex` (string, optional): hex-encoded collection stateinit BoC with one cell
* `nftItemCodeHex` (string): hex-encoded item contract code BoC with one cell
* `amount` (decimal string): nanotoncoins

If the `ownerAddress` is set: 
* single-wallet app checks that the address matches user’s address.
* multi-wallet app selects the wallet with the matching address; fails otherwise.

If the `ownerAddress` is missing: wallet app uses the current address.

Note: `ownerAddress` cannot be set to some other wallet, not controlled by the initiator of the transaction.

If the `royaltyAddress` is set and not equal to the `ownerAddress` wallet app shows separate line with royalty recipient.

If the `nftCollectionStateInitHex` is specified, then all the data parameters (royalty, URIs, NFT item code) are ignored and raw state init cell is used instead. Collection ID is calculated from that stateinit.

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

* `ownerAddress` (string, optional): owner of the collection.
* `nftCollectionAddress` (string): contract address of the collection that will deploy the item.
* `nftItemContentBaseUri` (string): base URL of the NFT collection metadata that will be used in concatenation with `itemContentUri`.
* `amount` (decimal string): nanocoins to be sent to the item’s contract
* `forwardAmount` (decimal string): nanocoins to be sent by collection to the item.
* `itemIndex` (integer): index of the item in the collection
* `itemContentUri` (string): path to the item description

If the `ownerAddress` is set: 
* single-wallet app checks that the address matches user’s address.
* multi-wallet app selects the wallet with the matching address; fails otherwise.

If the `ownerAddress` is missing: wallet app uses the current address.

Note: `ownerAddress` cannot be set to some other wallet, not controlled by the initiator of the transaction.

Wallet must check if `forwardAmount` is above zero and less than `amount`.

Primary confirmation UI displays:

* Item Name
* Collection Name
* Fee: actual tx fee + amount (which will be deposited on the interim contracts)

Secondary UI with raw data:

* Item Index (TODO: figure out what happens if this clashes with existing one)
* NFT Collection ID
* itemContentUri


### Deploy Single NFT

[Transaction request](#transaction-request) object with type `nft-single-deploy`.

* TBD.
* `stateInitHex` (string): hex-encoded NFT stateinit BoC with one cell.
* `amount` (decimal string): nanotoncoins to be sent to that deployed NFT contract.

All data parameters are used in UI only, while raw state init cell is used for actual deploy.



### Change Collection Owner

[Transaction request](#transaction-request) object with type `nft-change-owner`.

Parameters:

* `newOwnerAddress` (string)
* `nftCollectionAddress` (string)
* `amount` (decimal string): nanocoins to be sent to the item’s contract

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
* `amount` (decimal string): nanocoins to be sent to the item’s contract
* `forwardAmount` (decimal string): nanocoins to be sent as a notification to the new owner
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
* `fullPrice` (decimal string): price in nanocoins
* `marketplaceFee` (decimal string): nanocoins as marketplace fee
* `royaltyAddress` (string): address for the royalties
* `royaltyAmount` (decimal string): nanotoncoins sent as royalties
* `deployAmount` (decimal string): nanotoncoins sent with deployment of sale contract
* `transferAmount` (decimal string): nanotoncoins sent with nft transfer message
* `forwardAmount` (decimal string): nanocoins to be sent as a forward for the NFT transfer (in the second transaction)

Primary confirmation UI displays:

* Marketplace: `EQh6...`
* Price: `100.00 TON`
* Your proceeds: `79.64 TON`
* Fees & royalties: `<txfee + deployAmount + transferAmount + marketplace fee + royalties>`

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
* `marketplaceFee` (decimal string): nanocoins as marketplace fee
* `royaltyAddress` (string): address for the royalties
* `royaltyAmount` (decimal string): nanotoncoins sent as royalties
* `createdAt`: (integer): UNIX timestamp of the sale creation date
* `marketplaceAddress` (string): address of the marketplace
* `nftItemAddress` (string): identifier of the specific nft item
* `ownerAddress` (string): owner of the NFT item
* `fullPrice` (decimal string): price in nanocoins
* `deployAmount` (decimal string): nanotoncoins sent with deployment of sale contract
* `transferAmount` (decimal string): nanotoncoins sent with nft transfer message
* `saleMessageBocHex` (string): hex-encoded arbitrary BoC with one cell (typically an empty cell)
* `marketplaceSignatureHex` (string): hex-encoded signature
* `forwardAmount` (decimal string): nanocoins to be sent as a forward for the NFT transfer (in the second transaction)

Primary confirmation UI displays:

* Marketplace: `EQh6...`
* Price: `100.00 TON`
* Your proceeds: `79.64 TON`
* Fees & royalties: `<txfee + deployAmount + transferAmount + marketplace fee + royalties>`

Secondary UI:

* NFT item ID: `EQr4...`
* Marketplace fee: `10 TON`
* Marketplace fee address: `EQmAr...`
* RoyaltyAddress: `EQRy1t...`
* Royalty: `5 TON`
* Blockchain fee: `0.572 TON` (txfee + amount)


Sale Contract BOC (Base64-encoded):
```
te6cckECDAEAAikAART/APSkE/S88sgLAQIBIAMCAATyMAIBSAUEAFGgOFnaiaGmAaY/9IH0gfSB9AGoYaH0gfQB9IH0AGEEIIySsKAVgAKrAQICzQgGAfdmCEDuaygBSYKBSML7y4cIk0PpA+gD6QPoAMFOSoSGhUIehFqBSkHCAEMjLBVADzxYB+gLLaslx+wAlwgAl10nCArCOF1BFcIAQyMsFUAPPFgH6AstqyXH7ABAjkjQ04lpwgBDIywVQA88WAfoCy2rJcfsAcCCCEF/MPRSBwCCIYAYyMsFKs8WIfoCy2rLHxPLPyPPFlADzxbKACH6AsoAyYMG+wBxVVAGyMsAFcsfUAPPFgHPFgHPFgH6AszJ7VQC99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqGBNgAPloyhFrpOEBWccgGRwcKaDjgskvhHAoomOC+XD6AmmPwQgCicbIiV15cPrpn5j9IBggKwNkZYAK5Y+oAeeLAOeLAOeLAP0BZmT2qnAbE+OAcYED6Y/pn5gQwLCQFKwAGSXwvgIcACnzEQSRA4R2AQJRAkECPwBeA6wAPjAl8JhA/y8AoAyoIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxnLPyfPFifPFhjKACf6AhfKAMmAQPsAcQZQREUVBsjLABXLH1ADzxYBzxYBzxYB+gLMye1UABY3EDhHZRRDMHDwBTThaBI=
```

SaleStateInit cell for the sale contract:

```
StateInit {
    codeCell: saleContractBOC[0],
    dataCell: Cell {
        isComplete: Uint(1), // store 0 (isComplete = false)
        createdAt: Uint(32),
        marketplaceAddress: Address,
        nftItemAddress: Address,
        nftOwnerAddress: Address,  // write null (writeUint(0, 2))
        fullPrice: Coins,
        
        refs: [
            Cell {
                marketplaceFeeAddress: Address,
                marketplaceFee: Coins,
                royaltyAddress: Address,
                royaltyAmount: Coins,
            }
        ]
    }
}
```

Sale contract address:

```
Address {
    workchain: 0,
    hash: SaleStateInit.hash
}
```

MessageBody cell layout for deployment:

```
Cell {
    op: Uint(32), // write "1" (OperationCodes.DeploySale),
    marketplaceSignature: Buffer(512), // write raw 512 bits of signature
    refs: [
        SaleStateInit,
        saleMessageBoc.root_cells[0],
    ]
}
```

Transfer with TonWeb:

```
await wallet.methods.transfer({
    secretKey: ...
    toAddress: marketplaceAddress,
    amount: deployAmount,
    seqno: seqno,
    payload: MessageBody,
    sendMode: 3,
}).send()
```

Wallet performs the following:

1. Computes sale contract StateInit cell using parameters above.
2. Computes the sale contract address `S` using state init for workchain 0.
3. Prepares message body with the opcode 1, marketplace signature and provided message.
4. Sends this message to `marketplaceAddress` from the user's wallet matching `ownerAddress`.
5. Waits till the contract at address `S` is initialized on-chain (3 attempts with 10 second delay).
6. When `S` is initialized, automatically perform transfer of ownership for the token to address `S` with `transferAmount` as main amount and `forwardAmount` that allows notifying the new owner (the sale contract).



### Cancel NFT Sale

[Transaction request](#transaction-request) object with type `nft-sale-cancel`.

Parameters:

* `saleAddress` (string): address of the sale contract
* `ownerAddress` (string): owner of the NFT item
* `amount` (decimal string): nanotoncoins sent as commission with the message

Wallet must verify that it owns the `ownerAddress` and select the appropriate secret key and wallet contract to send the message from.

Primary confirmation UI displays:

* Sale address: `EQr4...`
* Fee: `<txfee>`







## Subscriptions

TBD: describe the API to submit subscriptions

```
https://app.tonkeeper.com/v1/subscribe/<invoice-id>
```

