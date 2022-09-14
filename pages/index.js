import { css } from '@emotion/css';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import Link from 'next/link';
import { AccountContext } from '../context';

import { contractAddress, ownerAddress } from '../config';
import Blog from '../artifacts/contracts/Blog.sol/Blog.json';

export default function Home(props) {
  // posts are fetched server side and passed in as props via getServerSideProps
  const { posts } = props; // array of created posts received by getServerSideProps, empty if no posts are created
  const account = useContext(AccountContext); 
  const router = useRouter();
  const navigate = async () => {
    router.push('/create-post');
  };

  return (
    <div>
      <div className={postList}>
        {
          // maps over the 'posts' array to seperate them and renders a button for each post in order of newest to oldest
          posts.map( (post, index) => (
            // link to view each individual post from mapped array
            // 2nd item (post[1]) returned by contract function is the title of the post
            // 3rd item (post[2]) returned by contract function is the hash of the post
            <Link href={`/post/${post[2]}`} key={index}><a> {/* /post/q24kjfn4fn93f434nf94... (IPFS hash) */}
                <div className={linkStyle}>
                  <p className={postTitle}>{post[1]}</p>  
                  <div className={arrowContainer}>
                  <img
                      src='/right-arrow.svg'
                      alt='Right arrow'
                      className={smallArrow}
                    />
                  </div>
                </div>
              </a></Link>
          ))
        }
      </div>
      <div className={container}>
        {
          (account === ownerAddress) && posts && !posts.length && (
            /* if the signed in user is the account owner, render a button to create the first post */
            <button className={buttonStyle} onClick={navigate}>
              Create your first post
              <img
                src='/right-arrow.svg'
                alt='Right arrow'
                className={arrow}
              />
            </button>
          )
        }
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  let provider;
  if (process.env.ENVIRONMENT === 'local') {
    provider = new ethers.providers.JsonRpcProvider();
  } else if (process.env.ENVIRONMENT === 'testnet') {
    provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_ID}`);
    // provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today');
  } else {
    provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/');
  }
  // provider has been set to different blockchains based upon environment

  const contract = new ethers.Contract(contractAddress, Blog.abi, provider);
  const data = await contract.fetchPosts();
  return {
    props: {
      posts: JSON.parse(JSON.stringify(data))
    }
  };
}

// Styling ==>

const arrowContainer = css`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  padding-right: 20px;
`

const postTitle = css`
  font-size: 30px;
  font-weight: bold;
  cursor: pointer;
  margin: 0;
  padding: 16px;
`

const linkStyle = css`
  border: 2px solid #ddd;
  margin-top: 20px;
  border-radius: 20px;
  display: flex;
`

const postList = css`
  width: 700px;
  margin: 0 auto;
  padding-top: 50px;  
`

const container = css`
  display: flex;
  justify-content: center;
`

const buttonStyle = css`
  margin-top: 100px;
  background-color: lightgrey;
  outline: none;
  border: none;
  font-size: 40px;
  padding: 20px 70px;
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 7px 0px rgba(0, 0, 0, .1);
`

const arrow = css`
  width: 30px;
  margin-left: 30px;
`

const smallArrow = css`
  width: 25px;
`