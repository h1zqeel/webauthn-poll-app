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


const rpName = 'SimpleWebAuthn Example';
const rpID = process.env.RP_ID || 'webauthn-poll-app.vercel.app';
const origin = process.env.ORIGIN || `https://webauthn-poll-app.vercel.app`;



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
	let username: string = req.query.username.toString();
	try{
		const userAuthenticators = await prisma.userCredentials.findMany({where:{username}});

		//findUserOrCreate
		//try creating the user
		let upsertUser:any;
		try{
			upsertUser = await prisma.user.create({
				data: {
				username: username,
				},
			});
		}
		catch(err){
		//catch the error, most probably a conflict return error
		console.log('user already exists');
			return res.status(200).json({error:'username already exists use another'});
		}
		//generate registration options
		const options = generateRegistrationOptions({
			rpName,
			rpID,
			userID: upsertUser.username,
			userName: upsertUser.username,
			attestationType: 'direct',
			authenticatorSelection: {
				userVerification: 'preferred',
			},
		});
		options.excludeCredentials = userAuthenticators.map(authenticator => ({
			id: authenticator.credentialID,
			type: 'public-key',
			transports: ['internal'],
		})),
		options.excludeCredentials.push({
			id:'',
			type:'public-key',
			transports:['internal']
		})

		//set user current challenge
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
		//incase of any kind of error delete the user and return error
		await prisma.user.delete({
			where:{username}
		});
		return res.status(400).json({error:'an error occured, please try again later'});
	}
}