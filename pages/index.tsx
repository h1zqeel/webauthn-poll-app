import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { sessionOptions } from '../lib/session';
import { withIronSessionSsr } from "iron-session/next";
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import Router from 'next/router'

interface Props {
	user?: UserModel;
  }

type UserModel = {
	id: number;
	username: string;
	isLoggedIn: Boolean;
};

const Home: NextPage<Props> = ({user}:Props) => {
	const [response, setResponse] = useState({ok:false})
	const logout = async ()=>{
		let res = await (await fetch('/api/logout')).json();
		setResponse(res);
	}
	useEffect(()=>{
		if(response.ok){
			Router.push('/login');
		}
	},[response]);
  return (
    <div className={styles.container}>
      <Head>
        <title>WebAuthN</title>
      </Head>

      <main className={styles.main}>
		<h1>Welcome to WebAuthN</h1>

		<div>logged in as {user?user.username:''}</div>
		<br></br>
		<Button variant='contained' onClick={logout}>Logout</Button>
      </main>

    </div>
  )
}

export default Home;

export const getServerSideProps = withIronSessionSsr(
	async function getServerSideProps({ req }) {
	  const user:any = req.session.user ;
	  if (!user) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			  },
		};
	  }
  
	  return {
		props: {
		  user: req.session.user,
		},
	  };
	},
	{
	  ...sessionOptions
	},
  );
