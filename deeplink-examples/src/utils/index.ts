export * from './getLocalIPAddress';

export const makeTxInlineDeepLink = (body: any) => {
  const txRequest = {
    version: "0",
    body,
  };

  const host = 'https://app.tonkeeper.com/v1/txrequest-inline/';
  const buff = Buffer.from(JSON.stringify(txRequest));
  return host + encodeURIComponent(buff.toString('base64'));
}

export const makeTxJsonDeepLink = (url: string) => {
  return `https://app.tonkeeper.com/v1/txrequest-url/${url}`;
}

export function getTimeSec() {
  return Math.floor((Date.now() / 1000));
}