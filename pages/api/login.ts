// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

import {
	generateAuthenticationOptions,
	verifyAuthenticationResponse,
  } from '@simplewebauthn/server';


type UserModel = {
	id: string;
	username: string;
	currentChallenge?: string;
};

type Authenticator = {
	// SQL: Encode to base64url then store as `TEXT`. Index this column
	credentialID: Buffer;
	// SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
	credentialPublicKey: Buffer;
	// SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
	counter: number;
	// SQL: `VARCHAR(255)` and store string array as a CSV string
	// ['usb' | 'ble' | 'nfc' | 'internal']
	transports?: AuthenticatorTransport[];
};


const rpName = 'SimpleWebAuthn Example';
const rpID = 'localhost';
const origin = `http://${rpID}:6969`;



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
	let username = req.query.username;
	const userAuthenticators = await prisma.userCredentials.findMany({where:{username}});
	console.log(userAuthenticators);
	//findUserOrCreate
	const upsertUser = await prisma.user.upsert({
		where: {
		  username: req.query.username,
		},
		update: {},
		create: {
		  username: req.query.username,
		},
	  })
	  const options = generateAuthenticationOptions({
		allowCredentials: userAuthenticators.map(authenticator => ({
		  id: authenticator.credentialID,
		  type: 'public-key',
		  transports: ['internal']

		})),
		userVerification: 'preferred',
	  });
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