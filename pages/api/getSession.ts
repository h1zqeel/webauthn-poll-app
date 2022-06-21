import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "../../lib/session";
import { NextApiRequest, NextApiResponse } from "next";

type UserModel = {
	id: number;
	username: string;
	isLoggedIn: Boolean;
};
export default withIronSessionApiRoute(getSession, sessionOptions);

async function getSession(req: NextApiRequest, res: NextApiResponse<UserModel>) {
	console.log(req.session.user,'server');
  if (req.session.user) {
	// console.log('yess')

    res.json({
		
      	...req.session.user,
      	isLoggedIn: true,
    });
  } else {
	// console.log('yes')
    res.json({
		id:-1,
		username:'',
    	isLoggedIn: false,
    });
  }
}