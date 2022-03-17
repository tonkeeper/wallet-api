# Tonkeeper Universal Links

* [Plain transfers](#plain-transfers)
* [Donations](#donations)
* [Authenticated transfers](#authenticated-transfers)
* [NFTs](#nfts)
* [Subscriptions](#subscriptions)


## Plain transfers

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

## Donations

```
https://app.tonkeeper.com/donate/<address>?amounts[]=<nanocoins1>&amounts[]=<nanocoins2>&custom_amount=1
```

Displays a specialized donation/tip interface.

* `amounts` — array of possible amounts to choose from (max 3)
* `custom_amount` (0, 1) — whether display the user-editable amount field or not.
* `text` — pre-filled comment.


## Authenticated transfers

There are three ways to authenticate the recipients: 

1. The recipient’s address is known to the wallet and we could use [plain transfer](#plain-transfer) link. This is the case for whitelisted addresses and opening links from within embedded apps (webview/iframe).
2. The recipient has a web backend: then we can rely on classic TLS certificates (web PKI) to authenticate the hostname.
3. Telegram users and channels authenticated through Tonkeeper bot.

TBD.




## NFTs

### Deploy NFT collection

...

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
