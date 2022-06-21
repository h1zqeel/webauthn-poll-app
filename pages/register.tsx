import { Button, TextField } from '@mui/material';
import type { NextPage } from 'next'
import Link from 'next/link';
import styles from '../styles/Home.module.css'
import { startRegistration } from '@simplewebauthn/browser';
import { useState, useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { sessionOptions } from '../lib/session';
import { withIronSessionSsr } from "iron-session/next";

const Register: NextPage = ()=>{
	const [response, setResponse] = useState('');
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);

	const register = async () => {
		if(!username.length){
			setResponse('Username Cant be Empty');
			return;
		}
		setLoading(true);
		setResponse('');
	    const resp:any = await (await fetch('/api/register?username='+username)).json();
		if(resp.error){
			setLoading(false);
			console.log(resp.error);
			setResponse(resp.error);
			return;
		}
		try{
			let attResp = await startRegistration(await resp);
			const verificationResp = await fetch('/api/verifyRegister?username='+username, {
				method: 'POST',
				headers: {
				  'Content-Type': 'application/json',
				},
				body: JSON.stringify(attResp),
			  });
			  const verificationJSON = await verificationResp.json();
			  if (verificationJSON && verificationJSON.verified) {
				console.log('registration successful');
				setResponse('register success');
				setUsername('');
			  } else {
				console.log('registration failed');
				setResponse('register failed');
			  }
			  setLoading(false);
		} catch(err){
			console.log(err);
			setResponse('cancelled');
			setLoading(false);
		}
	}
	return (
		<div className={styles.container}>
			<main className={styles.main}>
				<h1>Register using WebAuthN</h1>
				<TextField id="filled-basic" label="Username" variant="filled" value={username} onChange={e=>setUsername(e.target.value)} />
				<br></br>
				<div className='row'>
					<Link href='/login'><Button variant='text'>Login</Button></Link>
					<LoadingButton variant='contained' loading={loading} onClick={register}>Register</LoadingButton>
				</div>
				<br></br>
				<div>
					{response}
				</div>
			</main>
		</div>
	)
}

export default Register;

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