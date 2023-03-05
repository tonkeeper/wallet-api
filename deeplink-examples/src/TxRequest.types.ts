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

export type NftSalePlaceGetgemsParams = {
  marketplaceFeeAddress: string; // (string): fee-collecting address
  marketplaceFee: string; // (decimal string): nanocoins as marketplace fee
  royaltyAddress: string; // (string): address for the royalties
  royaltyAmount: string; // (decimal string): nanotoncoins sent as royalties
  createdAt: number; // (integer): UNIX timestamp of the sale creation date
  marketplaceAddress: string; // (string): address of the marketplace
  nftItemAddress: string; // (string): identifier of the specific nft item
  ownerAddress: string; // (string): owner of the NFT item
  fullPrice: string; // (decimal string): price in nanocoins
  deployAmount: string; // (decimal string): nanotoncoins sent with deployment of sale contract
  transferAmount: string; // (decimal string): nanotoncoins sent with nft transfer message
  saleMessageBocHex: string; // (string): hex-encoded arbitrary BoC with one cell (typically an empty cell)
  marketplaceSignatureHex: string; // (string): hex-encoded signature
  forwardAmount: string; // (decimal string): nanocoins to be sent as a notification to the sale contract
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
  | NftSalePlaceGetgemsParams;

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