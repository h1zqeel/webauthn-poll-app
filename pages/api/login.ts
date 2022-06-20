// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

import {
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
  } from '@simplewebauthn/server';


type UserModel = {
	id: number;
	username: string | null;
	currentChallenge?: string | null;
};

type Authenticator = {
	// SQL: Encode to base64url then store as `TEXT`. Index this column
	credentialID: string;
	// SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
	key: Buffer;
	// SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
	counter: number;
	username: string | null;
	// SQL: `VARCHAR(255)` and store string array as a CSV string
	// ['usb' | 'ble' | 'nfc' | 'internal']
	transports?: string | null;
};


const rpName = 'SimpleWebAuthn Example';
const rpID = 'localhost';
const origin = `http://${rpID}:6969`;



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
	let username: any = req.query.username.toString();
	try{
		try{
			//checking if user exists or not
			await prisma.user.findFirst({where:{username}});
		} catch(err){
			console.log(err);
			return res.status(200).json({error:'invalid username'});
		}
		const userAuthenticators:Authenticator[] = await prisma.userCredentials.findMany({where:{username}});

		const options = generateAuthenticationOptions({
			userVerification: 'preferred',
		});
		options.allowCredentials = userAuthenticators.map(authenticator => ({
			id: authenticator.credentialID,
			type: 'public-key',
			transports: ['internal']
		})),

			await prisma.user.update({
				where:{
					username,
				},
				data:{
					currentChallenge: options.challenge
				},
			})

		return res.status(200).json(options);
	}
	catch(err){
		return res.status(200).json({error:'an unknown error occured'});
	}
}