import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { css } from '@emotion/css';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import Error from 'next/error';

import { contractAddress } from '../../config';
import Blog from '../../artifacts/contracts/Blog.sol/Blog.json';

const ipfsURI = 'https://ipfs.io/ipfs/';

export default function Post(props) {
  // IPFS config taken from server-side code
  const { auth } = props;
  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const [post, setPost] = useState(null);
  const [editing, setEditing] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    fetchPost()
  }, [id]);

  const fetchPost = async () => {
    try {
      // fetching individual post by ipfs hash
      if (!id) {
        const err = new Error('ERROR: No post with given IPFS hash ID exists');
        throw err.props;
      };
      let provider;
      if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'local') {
        provider = new ethers.providers.JsonRpcProvider();
      } else if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'testnet') {
        // have to use NEXT_PUBLIC_ env variable as this line of code is in frontend
        provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_RINKEBY_ID}`);
      } else {
        provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/');
      }
      const contract = new ethers.Contract(contractAddress, Blog.abi, provider);
      const val = await contract.fetchPost(id);
      const postId = val[0].toNumber();

      // fetching IPFS metadata
      const ipfsUrl = `${ipfsURI}/${id}`;
      const response = await fetch(ipfsUrl);
      const data = await response.json();
      if (data.coverImage) {
        let coverImagePath = `${ipfsURI}/${data.coverImage}`;
        data.coverImagePath = coverImagePath;
      }
      // appending the post ID to the post data
      /* we need this ID to make updates to the post */
      data.id = postId;
      setPost(data);
    } catch (err) {
      console.log(err);
    }
  }

  const savePostToIpfs = async () => {
    try {
      const added = await client.add(JSON.stringify(post));
      return added.path;
    } catch (err) {
      console.log('error: ', err);
    }
  }

  const updatePost = async () => {
    try {
      const hash = await savePostToIpfs()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, Blog.abi, signer)
      await contract.updatePost(post.id, post.title, hash, true)
      router.push('/')
    } catch (err) {
      console.log('Updating post error: ', err)
    }
  }

  const onChange = async (e) => {
    setPost(() => ({ ...post, [e.target.name]: e.target.value }));
  }

  if (!post) 
  {
    return null;
  }

  return (
    <div className={container}>
      {
        editing && (
          <div>
            <input
              onChange={onChange}
              name='title'
              placeholder='Add updated title'
              value={post.title}
              className={titleStyle}
            />
            <hr></hr>
            <input
              onChange={onChange}
              name='content'
              placeholder="Add updated content"
              value={post.content}
              className={contentStyle}
              size={45}
              type='text'
            />
            <button className={button} onClick={updatePost}>Update post</button>
          </div>
        )
      }
      {
        !editing && (
          <div>
            {
              post.coverImagePath && (
                <img
                  src={post.coverImagePath}
                  className={coverImageStyle}
                />
              )
            }
            <h1>{post.title}</h1>
            <div className={contentContainer}>
              {post.content}
            </div>
          </div>
        )
      }
      <button className={button} onClick={() => setEditing(editing ? false : true)}>{editing ? 'View post' : 'Edit post'}</button>
    </div>
  )
}

export async function getServerSideProps() {
  const projectId = `${process.env.INFURA_ID}`;
  const projectSecret = `${process.env.INFURA_SECRET}`;
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
  return {
    props: {
      auth: auth
    }
  };
}

// Styling ==>

const button = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  margin-top: 15px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`

const titleStyle = css`
  margin-top: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  font-size: 44px;
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`

const contentStyle = css`
  margin-top: 60px;
  margin-bottom: 40px;
  border: none;
  outline: none;
  background-color: inherit;
  size: 200px;
  font-size: 30px;  
  font-weight: 600;
  &::placeholder {
    color: #999999;
  }
`


const coverImageStyle = css`
  width: 900px;
`

const container = css`
  width: 800px;
  margin: 0 auto;
`

const contentContainer = css`
  margin-top: 60px;
  padding: 0px 40px;
  border-left: 1px solid #e7e7e7;
  border-right: 1px solid #e7e7e7;
  & img {
    max-width: 900px;
  }
`