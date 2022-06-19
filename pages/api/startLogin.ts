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

const userAuthenticators: Authenticator[] = [];

const rpName = 'SimpleWebAuthn Example';
const rpID = 'localhost';
const origin = `http://${rpID}:6969`;



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
	let username = req.query.username;
	const upsertUser: UserModel = await prisma.user.upsert({
		where: {
		  username: req.query.username,
		},
		update: {},
		create: {
		  username: req.query.username,
		},
	  });
	const authenticator = prisma.UserCredentials.findUnique({where:{username}});

	let verification;
	console.log(req.body,'cred');
	try {
		verification = await verifyAuthenticationResponse({
		  credential: body,
		  expectedChallenge,
		  expectedOrigin: origin,
		  expectedRPID: rpID,
		  authenticator,
		});
	  } catch (error) {
		console.error(error);
		return res.status(400).send({ error: error.message });
	  }
	
	const { verified } = verification;

	return res.status(200).json({verified});
}