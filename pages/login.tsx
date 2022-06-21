import { Button, CircularProgress, TextField } from '@mui/material';
import type { NextPage } from 'next'
import Link from 'next/link';
import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { LoadingButton } from '@mui/lab';
import { platformAuthenticatorIsAvailable } from '@simplewebauthn/browser';
import Router from 'next/router'
import { sessionOptions } from '../lib/session';
import { withIronSessionSsr } from "iron-session/next";

const Login: NextPage = ()=>{
	const [response, setResponse] = useState('');
	const [additionalResponse, setAdditionalResponse] = useState('');
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	useEffect(()=>{
		if(response == 'logged in')
			Router.push('/')
	},[response]);

	async function login () {
		if(!username.length){
			setResponse('Username Cant be Empty');
			return;
		}
		setLoading(true);
		setResponse('');
		setAdditionalResponse('');
		const resp:any = await (await fetch('/api/login?username='+username)).json();
		if(resp.error){
			setLoading(false);
			console.log(resp.error);
			setResponse(resp.error);
			return;
		}
		console.log(resp);
		
		try{
			let asseResp = await startAuthentication(resp);


			const verificationResp = await fetch('/api/startLogin?username='+username, {
					method: 'POST',
					headers: {
					'Content-Type': 'application/json',
					},
					body: JSON.stringify(asseResp),
				});
				const verificationJSON = await verificationResp.json();
				if (verificationJSON && verificationJSON.verified) {
					console.log('you have logged in');
					setResponse('logged in');

				} else {
					console.log('failed to authenticate');
					setResponse('login failed');
				}
				setLoading(false);
		}
		catch(e){
			console.log(e);
			setLoading(false);
			setResponse('No Valid Authenticators Found for Your Device for User: '+username+'');
			setAdditionalResponse('if you want to add a New Device, login with your Existing Device, and Visit the Add Authenticator Page');
		}
	}
	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<h1>Login using WebAuthN</h1>
				<TextField id="filled-basic" label="Username" variant="filled" value={username} onChange={e=>setUsername(e.target.value)} />
				<br></br>
				<div className='row'>
					<Link href='/register'><Button variant='text'>Register</Button></Link>
					<LoadingButton variant='contained' loading={loading} onClick={login}>Login</LoadingButton>
				</div>
				<br></br>
				<div>
					{response!=='logged in'?response:''}
				</div>
				<div>
					{additionalResponse}
				</div>
			</main>
		</div>
	)
}

export default Login;

export const getServerSideProps = withIronSessionSsr(
	async function getServerSideProps({ req }) {
	  const user:any = req.session.user ;
	  if (user) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			  },
		};
	  }
  
	  return {
		props: {
		},
	  };
	},
	{
	  ...sessionOptions
	},
  );