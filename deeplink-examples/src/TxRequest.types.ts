export type NftCollectionDeployParams = {
  ownerAddress: string;
  royaltyAddress: string;
  royalty: number;
  collectionContentUri: string;
  nftItemContentBaseUri: string;
  nftItemCodeHex: string;
  amount: number;
}

export type NftItemDeployParams = {
  ownerAddress: string;
  nftCollectionAddress: string;
  itemContentUri: string;
  itemIndex: number;
  amount: number;
}

export type NftTransferParams = {
  newOwnerAddress: string;
  nftItemAddress: string;
  forwardAmount: number;
  amount: number;
  text: string;
}

export type NftChangeOwnerParams = {
  nftCollectionAddress: string;
  newOwnerAddress: string;
  amount: number;
}

export type NftSalePlaceParams = {
  marketplaceAddress: string; // (string): address of the marketplace
  marketplaceFee: number; // (integer): nanocoins as marketplace fee
  royaltyAddress: string; // (string): address for the royalties
  nftItemAddress: string; // (string): identifier of the specific nft item
  royaltyAmount: number; // (integer): nanotoncoins sent as royalties
  fullPrice: number; // (integer): price in nanocoins
  amount: number; //(integer): nanotoncoins sent as commission with the message
}

export type NftSaleCancelParams = {
  marketplaceAddress: string; // (string): address of the marketplace
  nftItemAddress: string; //  (string): identifier of the specific nft item
  marketplaceFee: number; //  (integer): nanocoins as marketplace fee
  royaltyAddress: string; //  (string): address for the royalties
  royaltyAmount: number; //  (integer): nanotoncoins sent as royalties
  saleAddress: string; // (string): address of the sale contract
  fullPrice: number; //  (integer): price in nanocoins
  amount: number; //  (integer): nanotoncoins sent as commission with the message
}

export type NftSalePlaceGetgems = {
  marketplaceFeeAddress: string;
  marketplaceFee: number;
  royaltyAddress: string;
  royaltyAmount: number;
  createdAt: number;
  marketplaceAddress: string;
  nftItemAddress: string;
  ownerAddress: string;
  fullPrice: number;
  amount: number;
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