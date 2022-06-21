import type { IronSessionOptions } from "iron-session";
type UserModel = {
	id: number;
	username: string;
	currentChallenge?: string | null;
};
export const sessionOptions: IronSessionOptions = {
  password: process.env.STRONG_PASSWORD as string,
  cookieName: "iron-session/examples/next.js",

};

// This is where we specify the typings of req.session.*
declare module "iron-session" {
  interface IronSessionData {
    user?: UserModel;
  }
}