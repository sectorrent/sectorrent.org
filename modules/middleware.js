const { ObjectId } = require('mongodb');
const jwt = require('./jwt');
//const TypeError = require('./type_error');

exports.isSignedIn = async (req, secret, usage = {}) => {
	//NO TOKEN NO ENTRY
	if(typeof req.cookies.token == 'undefined' || !req.cookies.token){
		return false;
	}

	try{
		req.token = jwt.decode(req.cookies.token);
		req.token.payload.id = ObjectId.createFromHexString(req.token.payload.id);
	}catch(error){
		return false;
	}

	//NOT NECISSARY UNLESS WE WANT SINGLE USE TOKENS
	if(req.token.payload.usage.type != 'ANY'){ //IF USAGE...
		for(const [key, value] of Object.entries(usage)){
			if(req.token.payload.usage[key] != value){
				return false;
			}
		}
	}

	//SESSION DIED - VERIFY TOKEN
	if(!req.session.signature){
		const integrity = await verifyIntegrity(req);
		if(!integrity.valid){
			return false;
		}

		const valid = jwt.isValid(req.cookies.token, secret+jwt.generateOTP(integrity.secret, parseInt(req.token.payload.exp/60)));
		if(valid){
			req.session.signature = req.token.signature;
			req.session.secret = integrity.secret;
		}
		return valid;
	}

	//VERIFY SIGNATURE MATCHES AND PAYLOAD IS VALID
	if(req.session.signature == req.token.signature){
		return jwt.isValid(req.cookies.token, secret+jwt.generateOTP(req.session.secret, parseInt(req.token.payload.exp/60))); //MAKE A BETTER PWD SYSTEM
	}

	return false;
};

async function verifyIntegrity(req){
	if(!req.token.payload.id || !req.token.payload.data){
		return {
			valid: false
		};
	}

	const data = await global.mongo.getDatabase().collection('users').findOne(
		{
			_id: req.token.payload.id
		},
		{
			projection: {
				_id: false,
				email: true,
				username: true,
				fname: true,
				lname: true,
				password: true,
				role: true
			}
		}
	);

	if(!data){
		return {
			valid: false
		};
	}

	data.role = (data.role) ? data.role : 0;

	return {
		valid: (req.token.payload.data.email == data.email &&
			req.token.payload.data.username == data.username &&
			req.token.payload.data.fname == data.fname &&
			req.token.payload.data.lname == data.lname &&
			req.token.payload.data.role == data.role),
		secret: data.password
	};
}

exports.getUserID = (req) => {
	return req.token.payload.id;
};

exports.getEmail = (req) => {
	return req.token.payload.data.email;
};

exports.getUsername = (req) => {
	return req.token.payload.data.username;
};

exports.getFirstName = (req) => {
	return req.token.payload.data.fname;
};

exports.getLastName = (req) => {
	return req.token.payload.data.lname;
};

exports.getRole = (req) => {
	return req.token.payload.data.role;
};

exports.getProfileAvatar = (req) => {
	return req.profile.payload.data.avatar;
};
