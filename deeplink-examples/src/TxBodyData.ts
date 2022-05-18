import { NftChangeOwnerParams, NftCollectionDeployParams, NftItemDeployParams, NftSaleCancelParams, NftSalePlaceGetgems, NftSalePlaceParams, NftTransferParams, TxRequestBody, TxResponseOptions } from "./TxRequest.types";

export const getNFTCollectionDeployBody = (
  response_options: TxResponseOptions,
  expires_sec: number
): TxRequestBody<NftCollectionDeployParams> => ({
  type: 'nft-collection-deploy',
  params: {
    ownerAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    royaltyAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    collectionContentUri: 'https://s.getgems.io/nft/c/626aa683e90df48ddc57b793/meta.json',
    nftItemContentBaseUri: 'https://s.getgems.io/nft/c/626aa683e90df48ddc57b793',
    nftItemCodeHex: 'B5EE9C7241020D010001D0000114FF00F4A413F4BCF2C80B0102016202030202CE04050009A11F9FE00502012006070201200B0C02D70C8871C02497C0F83434C0C05C6C2497C0F83E903E900C7E800C5C75C87E800C7E800C3C00812CE3850C1B088D148CB1C17CB865407E90350C0408FC00F801B4C7F4CFE08417F30F45148C2EA3A1CC840DD78C9004F80C0D0D0D4D60840BF2C9A884AEB8C097C12103FCBC20080900113E910C1C2EBCB8536001F65135C705F2E191FA4021F001FA40D20031FA00820AFAF0801BA121945315A0A1DE22D70B01C300209206A19136E220C2FFF2E192218E3E821005138D91C85009CF16500BCF16712449145446A0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00104794102A375BE20A00727082108B77173505C8CBFF5004CF1610248040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB000082028E3526F0018210D53276DB103744006D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0093303234E25502F003003B3B513434CFFE900835D27080269FC07E90350C04090408F80C1C165B5B60001D00F232CFD633C58073C5B3327B5520BF75041B',
    amount: 100000000,
    royalty: 0.2,
  },
  response_options,
  expires_sec,
});

export const getNFTItemDeployBody = (
  response_options: TxResponseOptions,
  expires_sec: number
): TxRequestBody<NftItemDeployParams> => ({
  type: 'nft-item-deploy',
  params: {
    ownerAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    nftCollectionAddress: 'EQAiwgIKpPUggGpVkiJe_Wo0flouYiAuipM78qgTCutTm3-g',
    amount: 100000000,
    itemIndex: 0,
    itemContentUri: 'https://s.getgems.io/nft/c/626aa683e90df48ddc57b793/0.json'
  },
  response_options,
  expires_sec,
});

export const getNFTChangeOwnerBody = (
  response_options: TxResponseOptions,
  expires_sec: number
): TxRequestBody<NftChangeOwnerParams> => ({
  type: 'nft-change-owner',
  params: {
    newOwnerAddress: 'EQAn7UCXbrjmgAApFV5FzuVX4P2avn_S3O3BwFpxgi2yf_Cy',
    nftCollectionAddress: 'EQAiwgIKpPUggGpVkiJe_Wo0flouYiAuipM78qgTCutTm3-g',
    amount: 100000000
  },
  response_options,
  expires_sec,
});

export const getNFTTransferBody = (
  response_options: TxResponseOptions,
  expires_sec: number
): TxRequestBody<NftTransferParams> => ({
  type: 'nft-transfer',
  params: {
    newOwnerAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    nftItemAddress: 'EQCu-GX7Gq0Q5WXKKQWLpwOw3ccjSrhAo6l4sffZJLH94mGC',
    amount: 100000000,
    forwardAmount: 100000000,
    text: 'just message'
  },
  response_options,
  expires_sec,
});

export const getNFTSalePlaceBody = (
  response_options: TxResponseOptions,
  expires_sec: number
): TxRequestBody<NftSalePlaceParams> => ({
  type: 'nft-sale-place',
  params: {
    marketplaceAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    nftItemAddress: 'EQCu-GX7Gq0Q5WXKKQWLpwOw3ccjSrhAo6l4sffZJLH94mGC',
    fullPrice: 1000000000,
    marketplaceFee: 100000000,
    royaltyAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    royaltyAmount: 100000000,
    amount: 100000000
  },
  response_options,
  expires_sec,
});

export const getNFTSaleCancelBody = (
  response_options: TxResponseOptions,
  expires_sec: number
): TxRequestBody<NftSaleCancelParams> => ({
  type: 'nft-sale-cancel',
  params: {
    saleAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    marketplaceAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
    nftItemAddress: 'EQCu-GX7Gq0Q5WXKKQWLpwOw3ccjSrhAo6l4sffZJLH94mGC',
    fullPrice: 100000000,
    marketplaceFee: 100000000,
    royaltyAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n', 
    royaltyAmount: 100000000,
    amount: 100000000
  },
  response_options,
  expires_sec,
});

export const getGetgemsNFTSaleBody = (
  response_options: TxResponseOptions,
  expires_sec: number
): TxRequestBody<NftSalePlaceGetgems> => ({
  type: 'nft-sale-place-getgems',
  params: {
    marketplaceFeeAddress: '',
    marketplaceFee: 100000000,
    royaltyAddress: '',
    royaltyAmount: 100000000,
    createdAt: 213123123,
    marketplaceAddress: '',
    nftItemAddress: '',
    ownerAddress: '',
    fullPrice: 1000000000,
    amount: 100000000,
    messageHex: '',
    marketplaceSignatureHex: ''
  },
  response_options,
  expires_sec,
});

export const bodyExtractors = {
  'nft-collection-deploy': getNFTCollectionDeployBody,
  'nft-item-deploy': getNFTItemDeployBody,
  'nft-change-owner': getNFTChangeOwnerBody,
  'nft-transfer': getNFTTransferBody,
  'nft-sale-place': getNFTSalePlaceBody,
  'nft-sale-cancel': getNFTSaleCancelBody,
  'nft-sale-place-getgems': getGetgemsNFTSaleBody
}