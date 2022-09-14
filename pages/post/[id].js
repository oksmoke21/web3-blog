import ReactMarkdown from 'react-markdown';
import { useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { css } from '@emotion/css';
import { ethers } from 'ethers';
import { AccountContext } from '../../context';

import { contractAddress, ownerAddress } from '../../config';
import Blog from '../../artifacts/contracts/Blog.sol/Blog.json';

const ipfsURI = 'https://ipfs.io/ipfs';

export default function Post({ post }) {
  const account = useContext(AccountContext);
  const router = useRouter();
  const { id } = router.query;

  if (router.isFallback) {
    return <div>Loading...</div>
  };

  return (
    <div>
      {
        post && (
          <div className={container}>
            {
              // renders an edit button if the user is the owner 
              ownerAddress === account && (
                <div className={editPost}>
                  <Link href={`/edit-post/${id}`}><a>
                      Edit post
                    </a></Link>
                </div>
              )
            }
            {
              // renders a cover image if the post has one
              post.coverImage && (
                <img
                  src={post.coverImage}
                  className={coverImageStyle}
                />
              )
            }
            <div className={titleContainer}>
              {post.title}
            </div>
            <div className={contentContainer}>
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>
        )
      }
    </div>
  )
}

export async function getStaticPaths() {
  let provider;
  if (process.env.ENVIRONMENT === 'local') {
    provider = new ethers.providers.JsonRpcProvider();
  } else if (process.env.ENVIRONMENT === 'testnet') {
    provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${process.env.INFURA_RINKEBY_ID}`);
    // provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.matic.today');
  } else {
    provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/');
  }

  const contract = new ethers.Contract(contractAddress, Blog.abi, provider);
  const data = await contract.fetchPosts();
  
  /* then we map over the posts and create a params object passing */
  /* the id property to getStaticProps which will run for ever post */
  /* in the array and generate a new page */
  const paths = data.map(d => ({ params: { id: d[2] } }));

  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  // params is paths from above function
  const { id } = params;
  const ipfsUrl = `${ipfsURI}/${id}`;
  const response = await fetch(ipfsUrl);
  const data = await response.json();
  let coverImage = `${ipfsURI}/${data.coverImage}`;
  data.coverImage = coverImage;

  return {
    props: {
      post: data
    },
  }
}

// Styling ==>

const editPost = css`
  border: 2px solid black;
  position: absolute;
  display: flex;
  border-radius: 10px;
  padding: 5px 5px;
  margin: 20px 0px;
  font-size: 20px;
`

const coverImageStyle = css`
  width: 900px;
  margin-top: 90px;
`

const container = css`
  width: 900px;
  margin: 0 auto;
`

const titleContainer = css`
  margin-top: 60px;
  font-weight: bold;
  font-size: 50px;
  border-bottom: 1px solid #e7e7e7;
  & img {
    max-width: 900px;
  }
`
const contentContainer = css`
  margin-top: 60px;
  font-size: 20px;
  padding: 0px 40px;
  border-left: 1px solid #e7e7e7;
  border-right: 1px solid #e7e7e7;
  & img {
    max-width: 900px;
  }
`