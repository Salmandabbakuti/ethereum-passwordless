import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util';

const users = [];

const eip712Types = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
    ],
    Mail: [{ name: 'contents', type: 'string' }]
  },
  domain: { name: 'Ether Magic Login', version: '1', chainId: 3 },
  primaryType: 'Mail',
  message: { contents: 'Hello, Bob! Welcome to passwordless' }
};

export default function auth(req, res) {
  let authenticated = false;
  const { address, signature } = req.query;
  const decodedAddress = recoverTypedSignature({ data: eip712Types, signature, version: SignTypedDataVersion.V4 });
  console.log('Recovered account from signature: ', decodedAddress);
  if (decodedAddress.toLowerCase() === address.toLowerCase()) {
    console.log('Successfully recovered account from signature: ', decodedAddress);
    authenticated = true;
    const user = users.find(u => u.address = address);
    if (!user) {
      console.log('User not found, Signing up..');
      users.push({ address, registeredOn: new Date() });
    }
  } else {
    console.log('Failed to recover account from signature');
  }
  res.status(200).json({ decodedAddress, authenticated });
};
