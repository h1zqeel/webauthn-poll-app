// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma, UserCredentials } from '@prisma/client';
const prisma = new PrismaClient();

import {
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
  } from '@simplewebauthn/server';


type UserModel = {
	id: number;
	username: string;
	currentChallenge?: string | null;
};

type Authenticator = {
	// SQL: Encode to base64url then store as `TEXT`. Index this column
	credentialID: string;
	// SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
	credentialPublicKey: Buffer;
	// SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
	counter: number;

	username: string;
	// SQL: `VARCHAR(255)` and store string array as a CSV string
	// ['usb' | 'ble' | 'nfc' | 'internal']
	transports?: string;
};

const userAuthenticators: Authenticator[] = [];

const rpName = 'SimpleWebAuthn Example';
const rpID = process.env.RP_ID || 'webauthn-poll-app.vercel.app';
const origin = process.env.ORIGIN || `https://webauthn-poll-app.vercel.app`;



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
	let username: string = req.query.username.toString();
	try{
	const upsertUser: UserModel = await prisma.user.upsert({
		where: {
		  username: username,
		},
		update: {},
		create: {
		  username: username,
		},
	  });
	const authenticator:any = await prisma.userCredentials.findFirst({where:{username}});
console.log(authenticator, 'auther');
	let verification;
	console.log(req.body,'cred');
	try {
		verification = await verifyAuthenticationResponse({
		  credential: req.body,
		  expectedChallenge: upsertUser.currentChallenge || '',
		  expectedOrigin: origin,
		  expectedRPID: rpID,
		  authenticator: {
			credentialPublicKey: authenticator.key,
			credentialID: authenticator.credentialID,
			counter: authenticator.counter
		  },
		});
	  } catch (error) {
		console.error(error);
		return res.status(200).send({ error: 'error trying to authenticate' });
	  }

	const { verified } = verification;
	if(verified){
		console.log(verified);
		//start a session with public key and username
	}
	return res.status(200).json({verified});
	}
	catch(err){
		return res.status(400).json({error:'an unknown error occured'})
	}
}