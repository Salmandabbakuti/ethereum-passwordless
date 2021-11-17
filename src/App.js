import { useState, useEffect } from 'react';
import Web3 from 'web3';
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util';
import ethLogo from './ethLogo.svg'
import './App.css';

function App() {
  const [logMessage, setLogMessage] = useState('');
  const [loggedInMsg, setLoggedInMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        window.ethereum.request({ method: "eth_requestAccounts" }).then(async (accounts) => {
          const msgParams = JSON.stringify({
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
          });
          window.ethereum.request({
            method: "eth_signTypedData_v4",
            params: [accounts[0], msgParams],
            from: accounts[0],
          }).then((res) => {
            console.log('Signature: ', res);
            const recovered = recoverTypedSignature({ data: JSON.parse(msgParams), signature: res, version: SignTypedDataVersion.V4 });
            console.log('Recovered account from signature: ', recovered);
            if (recovered === accounts[0]) {
              setLoggedInMsg(`You are logged in as: ${accounts[0]}`);
              console.log(`Successfully recovered signer as '${accounts[0]}'`);
              setLogMessage(`Successfully recovered signer as '${accounts[0]}'`);
            } else {
              console.log(`Failed to verify signer when comparing signature to '${accounts[0]}'`);
            }
          })
            .catch((err) => console.log(err));
        });
      } else {
        setLogMessage('No web3 found, please install MetaMask');
      }
    };
    init();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={ethLogo} className="App-logo" alt="logo" />
        <h1 className="App-title">Passwordless Signin with Ethereum</h1>
        <h5>{loggedInMsg}</h5>
      </header>
      <p className="App-log">{logMessage}</p>
    </div >
  );
}

export default App;
