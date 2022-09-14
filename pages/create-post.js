import { useState, useRef, useEffect } from 'react' // new
import { useRouter } from 'next/router'
import { css } from '@emotion/css'
import { ethers } from 'ethers'
import { create } from 'ipfs-http-client'

import {contractAddress} from '../config'
import Blog from '../artifacts/contracts/Blog.sol/Blog.json'

const initialState = { title: '', content: '' }

export default function CreatePost(props) {
    const { auth } = props; // destructuring the prop as it is currently an object
    const client = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
            authorization: auth,
        },
    });
    const [post, setPost] = useState(initialState)
    const [image, setImage] = useState(null)
    const [loaded, setLoaded] = useState(false)

    const fileRef = useRef(null)
    const { title, content } = post;
    const router = useRouter();

    function onChange(e) {
        setPost(() => ({ ...post, [e.target.name]: e.target.value }))
    }

    const createNewPost = async () => {
        // saves post to ipfs then anchors to smart contract
        try{
            if (!title || !content) return;
            const hash = await savePostToIpfs();
            console.log(hash)
            await savePost(hash);
            router.push(`/`);
        } catch (err) {
            console.log(err)
        }
    }

    const savePostToIpfs = async () => {
        try {
            const added = await client.add(JSON.stringify(post));
            console.log('Added to IPFS: ', added);
            return added.path;
        } catch (err) {
            console.log(err);
        }
    }

    const savePost = async (hash) => {
        // anchor post to smart contract
        if (typeof window.ethereum !== 'undefined') { // checking if user is signed in
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                const signer = provider.getSigner()
                const contract = new ethers.Contract(contractAddress, Blog.abi, signer)
                console.log('contract: ', contract)
                const val = await contract.createPost(post.title, hash)

                //optional - wait for transaction to be confirmed before rerouting
                await provider.waitForTransaction(val.hash);

                console.log('val: ', val)
            } catch (err) {
                console.log(err)
            }
        }
    }

    const triggerOnChange = async () => {
        // trigger handleFileChange handler of hidden file input on button click
        fileRef.current.click()
    }

    const handleFileChange = async(e) => {
        try {
            // upload cover image to ipfs and save hash to state
            const uploadedFile = e.target.files[0]
            if (!uploadedFile) return
            const added = await client.add(uploadedFile)
            setPost(state => ({ ...state, coverImage: added.path }))
            setImage(uploadedFile)
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className={container}>
            {
                image && (
                    <img className={coverImageStyle} src={URL.createObjectURL(image)} />
                )
            }
            <input
                onChange={onChange}
                name='title'
                placeholder='Give it a title ...'
                value={post.title}
                className={titleStyle}
            />
            <hr></hr>
            <input
                onChange={onChange}
                name='content'
                placeholder="What's on your mind?"
                value={post.content}
                className={contentStyle}
                size={45}
                type='text'
            />

            <div>
                {
                    loaded && (
                        <>
                            <button
                                className={button}
                                type='button'
                                onClick={createNewPost}
                            >Publish</button>
                            <button
                                onClick={triggerOnChange}
                                className={button}
                            >Add cover image</button>
                        </>
                    )
                }
            </div>
            <input
                id='selectImage'
                className={hiddenInput}
                type='file'
                onChange={handleFileChange}
                ref={fileRef}
            />
        </div>
    )
}


export async function getServerSideProps() {
    const projectId = `${process.env.INFURA_ID}`;
    const projectSecret = `${process.env.INFURA_SECRET}`;
    const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
    console.log(auth)
    return{
        props: {
            auth: auth
        }
    }
}

// Styling ==>

const hiddenInput = css`
  display: none;
`

const coverImageStyle = css`
  max-width: 800px;
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

const container = css`
  width: 800px;
  margin: 0 auto;
`

const button = css`
  background-color: #fafafa;
  outline: none;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  font-size: 18px;
  padding: 16px 70px;
  box-shadow: 7px 7px rgba(0, 0, 0, .1);
`