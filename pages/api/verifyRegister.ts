// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient, Prisma, User } from '@prisma/client';
const prisma = new PrismaClient();

import {
	generateRegistrationOptions,
	verifyRegistrationResponse,
  } from '@simplewebauthn/server';

type Data = {
  name: string
}

type UserModel = {
	id: number;
	username: string;
	currentChallenge?: string | null;
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

const rpName = 'Polling App Built with Web Auth N';
const rpID = process.env.RP_ID || 'webauthn-poll-app.vercel.app';
const origin = process.env.ORIGIN || `https://webauthn-poll-app.vercel.app`;


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
	let username: string = req.query.username.toString();

	try{
		let upsertUser: any = await prisma.user.findFirst({
				where: {
				username: username,
				},
			});
		
		let verification;

		try {
		verification = await verifyRegistrationResponse({
			credential: req.body,
			expectedChallenge: upsertUser.currentChallenge || '',
			expectedOrigin: origin,
			expectedRPID: rpID,
		});
		} catch (error) {
			await prisma.user.delete({
				where:{username}
			});
		return res.status(200).send({ error: 'errored during registration' });
		}

		const { verified, registrationInfo: info } = verification;
		if(verified && info){
			await prisma.userCredentials.create({data:{
				credentialID: req.body.id,
				username: username,
				key: info.credentialPublicKey,
				counter: info.counter,
			}})
		}
		else {
			await prisma.user.delete({
				where:{username}
			})
			return res.status(200).json({error:'error occured trying to create credential'});
		}

		return res.status(200).json({verified});
	}
	catch(err){
		// incase of any error catch the error and delete the creted user
		await prisma.user.delete({
			where:{username}
		});
		return res.status(400).json({error:'an error occured, please try again later'});
	}
}