import React, { useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from "web3modal";

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

const button = {
  width: "400px",
  margin: "5px",
  padding: "20px",
  border: "none",
  backgroundColor: "black",
  color: "white",
  fontSize: 16,
  cursor: "pointer",
}

export default function Home() {
  const [account, setAccount] = useState('');
  const [connection, setConnection] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');

  async function connect() {
    const web3Modal = new Web3Modal({
      network: "ropsten",
      cacheProvider: true,
    });
    web3Modal.clearCachedProvider()
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const accounts = await provider.listAccounts();
    setConnection(connection);
    setAccount(accounts[0]);
  }

  async function signIn() {
    setError('')
    const msgParams = JSON.stringify(eip712Types);
    connection.request({
      method: "eth_signTypedData_v4",
      params: [account, msgParams],
      from: account,
    }).then(async (res) => {
      const response = await fetch(`/api/auth?address=${account}&signature=${res}`, {
        method: 'POST'
      })
      const data = await response.json();
      setLoggedIn(data.authenticated);
    })
  }

  async function signOut() {
    setLoggedIn(false);
  }

  return (
    <div style={{ width: '900px', margin: '50px auto' }}>
      <h1 className="App-title">Passwordless Signin with Ethereum</h1>
      {!connection && <button style={button} onClick={connect}> Connect Wallet</button>}
      {error && <h2>No account yet created. Please sign up!</h2>}
      {connection && !loggedIn && <button style={button} onClick={signIn}>Sign In</button>}
      {loggedIn && (
        <>
          <h1>Welcome, {account}</h1>
          <button style={button} onClick={signOut}>Sign Out</button>
        </>
      )}
    </div>
  )
}