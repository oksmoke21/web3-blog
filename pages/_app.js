import '../styles/globals.css'
import { useState } from 'react'
import Link from 'next/link'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { AccountContext } from '../context.js'
import { ownerAddress } from '../config'
import 'easymde/dist/easymde.min.css'

function MyApp({ Component, pageProps }) {
  
  /* create local state to save account information after signin */
  const [account, setAccount] = useState(null);

  const getWeb3Modal = async () => {      // web3Modal configuration for enabling wallet access
    const web3Modal = new Web3Modal({
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: `${process.env.INFURA_LINK}`
          },
        },
      },
    })
    return web3Modal;
  }

  const connect = async () => {      // the connect function uses web3 modal to connect to the user's wallet
    try {
      const web3Modal = await getWeb3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);
    } catch (err) {
      console.log('error:', err);
    }
  }

  return (
    <div>

      <nav className={nav}>
        <div className={header}>
          <Link href="/"><a>
              <img src='/logo.jpg' alt="Logo" style={{ width: '50px', borderRadius: '50%' }} />
            </a></Link>
          <Link href="/"><a>
              <div className={titleContainer}>
                <h2 className={title}>Web3 Blog</h2>
                <p className={description}>Ayush Ranjan</p>
              </div>
            </a></Link>

          <div className={linkContainer}>
            <Link href="/" ><a className={link}>
                Home
              </a></Link>
            {
              // if the signed in user is the contract owner, we show the nav link to create a new post
              (account === ownerAddress) && (
                <Link href="/create-post"><a className={link}>
                    Create Post
                  </a></Link>
              )
            }
          </div>

          {
            !account && (
              <div className={buttonContainer}>
                <button className={buttonStyle} onClick={connect}>Connect</button>
              </div>
            )
          }
          {
            account && <p className={accountInfo}>Account: {account}</p>
          }
        
          
        </div>
      </nav>

      <div className={container}> 
        <AccountContext.Provider value = {account}>
          <Component {...pageProps} connect = {connect} />
        </AccountContext.Provider>
      </div>

    </div>
  )
}

// Styling ==>

const accountInfo = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  font-size: 14px;
  // background-color: white;
`

const container = css`
  padding: 40px;
`

const linkContainer = css`
  display: flex;
  padding: 13px 60px;
  flex-direction: row;
`

const nav = css`
  background-color: lightgrey;
`

const header = css`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, .075);
  padding: 10px 30px;
`

const description = css`
  margin: 0;
  color: black;
`

const titleContainer = css`
  display: flex;
  flex-direction: column;
  padding-left: 15px;
`

const title = css`
  margin-left: 30px;
  font-weight: 500;
  margin: 0;
  color: black;
`

const buttonContainer = css`
  width: 100%;
  display: flex;
  flex: 1;
  justify-content: flex-end;
`

const buttonStyle = css`
  background-color: white;
  outline: none;
  border: none;
  font-size: 20px;
  padding: 16px 50px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 0px rgba(0, 0, 0, .1);
`

const link = css`
  margin: 0px 40px 0px 0px;
  color: black;
  font-size: 20px;
  font-weight: 400;
`

export default MyApp