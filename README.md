# Tonkeeper Universal Links

* [Definitions](#definitions)
* [Unauthenticated transfers](#unauthenticated-transfers)
* [Unauthenticated donations](#unauthenticated-donations)
* [Transaction Request URL](#transaction-request-url)
* [Transaction Request](#transaction-request)
* [Authenticated transfers](#authenticated-transfers)
* [NFTs](#nfts)
* [Subscriptions](#subscriptions)


## Definitions

To avoid unnecessary confusion, we are clarifying some cryptographic 

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




## Unauthenticated transfers

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

## Unauthenticated donations

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


## Transaction Request URL

Transaction request can be communicated to the wallet in 3 different ways:

* Direct link to download [Transaction Request](#transaction-request).
* Inline TR object wrapped in a Tonkeeper universal link.
* Wrapped TR link in a Tonkeeper universal link.

### Direct Transaction Request URL

Any URL that returns JSON-encoded [Transaction Request](#transaction-request).

```
https://example.com/<...>.json
```

### Inline Transaction Request

A universal link wrapping [Transaction Request](#transaction-request) so that it can be opened

```
https://app.tonkeeper.com/v1/txrequest-inline/<base64url(TransactionRequest)>
```

### Wrapped Transaction Request URL

Here the URL to download transaction request is wrapped in universal link.

The URL is requested using `https://` scheme.

```
https://app.tonkeeper.com/v1/txrequest-url/<example.com/...json>
```



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
    "body": Base64(json-encoded-transaction-request-body),
    "signature": Base64(Ed25519Signature),
}
```

The transaction request validation procedure when `version` is `"1"`:

1. Discard if the local time is over the expiration time `expires_sec`.
2. Check the `signature` over `body` against the public key `author_id`.
3. Parse the [Transaction Request Body](#transaction-request-body)

## Transaction Request Body

Specific kinds of body are listed below.

```
{
    "expires_sec": <UNIX timestamp in seconds>,
    "type": "transfer" | 
            "donation" | 
            "nft-collection-deploy" |
            "nft-item-deploy" |
            "nft-change-owner" |
            "nft-transfer",

    (fields...)
}
```

Transaction request must be discarded if the local time is greater than the `expires_sec`.


## Authenticated transfers

There are three ways to authenticate the recipients: 

1. The recipient’s address is known to the wallet and we could use [unauthenticated transfer](#unauthenticated-transfer) link or [unsigned transaction request](#unsigned-transaction-request). This is the case for whitelisted addresses and opening links from within embedded apps (webview/iframe).
2. The recipient has a web backend: then we can rely on classic TLS certificates (web PKI) to authenticate the hostname by downloading an [unsigned transaction request](#unsigned-transaction-request) object via secure TLS connection.
3. Telegram users and channels authenticated through Tonkeeper bot that registers `author_id` public key for invoice identification.



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

* Fee: actual tx fee + amount (which will be deposited on the interim contracts)
* Royalty (%): fraction formatted in percents.
* Royalty address (if not the same as the wallet).

Secondary UI with raw data:

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

* NFT collection address
* Item index
* Fee: actual tx fee + amount (which will be deposited on the interim contracts)

Secondary UI with raw data:

* itemContentUri


### Change Collection Owner

[Transaction request](#transaction-request) object with type `nft-change-owner`.

Parameters:

* `newOwnerAddress` (string)
* `nftCollectionAddress` (string)
* `amount` (integer): nanocoins to be sent to the item’s contract

Primary confirmation UI displays:

* NFT collection address
* New owner address
* Fee: actual tx fee + amount (which will be deposited on the interim contracts)

There is no extended/secondary data to display.


### Transfer NFT

[Transaction request](#transaction-request) object with type `nft-transfer`.

Parameters:

* `newOwnerAddress` (string)
* `nftItemAddress` (string)
* `amount` (integer): nanocoins to be sent to the item’s contract
* `forwardAmount` (integer): nanocoins to be sent as a notification to the new owner
* `text` (string, optional): optional comment

Wallet must validate that the `forwardAmount` is less or equal to the `amount`.

Primary confirmation UI displays:

* NFT item address
* New owner address
* Fee: actual tx fee + amount
* Text: the freeform comment


### Place NFT Sale

[Transaction request](#transaction-request) object with type `nft-sale`.


TBD:

### Cancel NFT Sale

TBD: 



## Subscriptions

TBD: describe the API to submit subscriptions

```
https://app.tonkeeper.com/v1/subscribe/<invoice-id>
```
