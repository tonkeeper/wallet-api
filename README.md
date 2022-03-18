# Tonkeeper Universal Links

* [Unauthenticated transfers](#unauthenticated-transfers)
* [Unauthenticated donations](#unauthenticated-donations)
* [Transaction Request URL](#transaction-request-url)
* [Transaction Request](#transaction-request)
* [Authenticated transfers](#authenticated-transfers)
* [NFTs](#nfts)
* [Subscriptions](#subscriptions)


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
ton://transfer/<address>?amount=<nanocoins>&text=<url-encoded-utf8-text>

https://app.tonkeeper.com/transfer/<address>?amount=<nanocoins>&text=<url-encoded-utf8-text>
```

Opens a compact confirmation dialog with all data filled-in. 
User cannot edit any of the info and can only confirm or dismiss the request.

## Unauthenticated donations

```
https://app.tonkeeper.com/donate/<address>?amounts[]=<nanocoins1>&amounts[]=<nanocoins2>&custom_amount=1
```

Displays a specialized donation/tip interface.

* `amounts` — array of possible amounts to choose from (max 3)
* `custom_amount` (0, 1) — whether display the user-editable amount field or not.
* `text` — pre-filled comment.


## Transaction Request URL

TBD: payment request embedded in a link

## Transaction Request

Unauthenticated request is suitable 

```
{
    "version": "0",
    
}
```


Authenticated request:

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
            "nft-transfer",

    (fields...)
}
```

Transaction request must be discarded if the local time is greater than the `expires_sec`.


## Authenticated transfers

There are three ways to authenticate the recipients: 

1. The recipient’s address is known to the wallet and we could use [plain transfer](#plain-transfer) link. This is the case for whitelisted addresses and opening links from within embedded apps (webview/iframe).
2. The recipient has a web backend: then we can rely on classic TLS certificates (web PKI) to authenticate the hostname by downloading a [transaction request](#transaction-request) object via secure TLS connection.
3. Telegram users and channels authenticated through Tonkeeper bot.

TBD.


## NFTs



### Deploy NFT collection

[Transaction request](#transaction-request) object with type `nft-collection-deploy`.

Parameters:

* ownerAddress (string, optional)
* royalty (float)
* royaltyAddress (string)
* collectionContentUri (string)
* nftItemContentBaseUri (string)
* nftItemCodeHex (string): hex
* amount (integer): nanotoncoins 

If the `ownerAddress` is set: 
* single-wallet app checks that the address matches user’s address.
* multi-wallet app selects the wallet with the matching address; fails otherwise.

If the `ownerAddress` is missing: wallet app uses the current address.

If the `royaltyAddress` is set and not equal to the `ownerAddress` wallet app shows separate line with royalty recipient.


### Deploy NFT item

...

### Mint an item 

...

### Transfer NFT

...


## Subscriptions

```
https://app.tonkeeper.com/subscribe/<invoice-id>
```
