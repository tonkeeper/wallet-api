export type NftCollectionDeployParams = {
  ownerAddress?: string;
  royaltyAddress: string;
  royalty: number;
  collectionContentUri: string;
  nftItemContentBaseUri: string;
  nftItemCodeHex: string;
  amount: string;
}

export type NftItemDeployParams = {
  ownerAddress?: string;
  nftCollectionAddress: string;
  itemContentUri: string;
  itemIndex: number;
  amount: string;
}

export type NftTransferParams = {
  newOwnerAddress: string;
  nftItemAddress: string;
  forwardAmount: string;
  amount: string;
  text?: string;
}

export type NftChangeOwnerParams = {
  nftCollectionAddress: string;
  newOwnerAddress: string;
  amount: string;
}

export type NftSalePlaceParams = {
  marketplaceAddress: string; // (string): address of the marketplace
  marketplaceFee: string; // (integer): nanocoins as marketplace fee
  royaltyAddress: string; // (string): address for the royalties
  nftItemAddress: string; // (string): identifier of the specific nft item
  royaltyAmount: string; // (integer): nanotoncoins sent as royalties
  fullPrice: string; // (integer): price in nanocoins
  amount: string; //(integer): nanotoncoins sent as commission with the message
}

export type NftSaleCancelParams = {
  marketplaceAddress: string; // (string): address of the marketplace
  nftItemAddress: string; //  (string): identifier of the specific nft item
  marketplaceFee: string; //  (integer): nanocoins as marketplace fee
  royaltyAddress: string; //  (string): address for the royalties
  royaltyAmount: string; //  (integer): nanotoncoins sent as royalties
  saleAddress: string; // (string): address of the sale contract
  fullPrice: string; //  (integer): price in nanocoins
  amount: string; //  (integer): nanotoncoins sent as commission with the message
}

export type NftSalePlaceGetgems = {
  marketplaceFeeAddress: string;
  marketplaceFee: string;
  royaltyAddress: string;
  royaltyAmount: string;
  createdAt: number;
  marketplaceAddress: string;
  nftItemAddress: string;
  ownerAddress: string;
  fullPrice: string;
  amount: string;
  messageHex: string;
  marketplaceSignatureHex: string;
}

export type TxTypes = 
  | 'transfer' 
  | 'donation' 
  | 'nft-collection-deploy' 
  | 'nft-item-deploy' 
  | 'nft-change-owner' 
  | 'nft-transfer' 
  | 'nft-sale-place' 
  | 'nft-sale-cancel'
  | 'nft-sale-place-getgems';

export type TxParams =
  | NftCollectionDeployParams 
  | NftItemDeployParams 
  | NftChangeOwnerParams 
  | NftTransferParams 
  | NftSalePlaceParams 
  | NftSaleCancelParams
  | NftSalePlaceGetgems;

export type TxResponseOptions = {
  broadcast: boolean;
  return_url: string;
  callback_url: string;
}

export type TxRequestBody<TParams = TxParams> = {
  type: TxTypes;
  expires_sec: number;
  response_options: TxResponseOptions;
  params: TParams;
}

export type TxRequest = {
  version: '0';
  body: TxRequestBody;
} | {
  version: '1';
  author_id: string;
  body: string;
  signature: string;
};