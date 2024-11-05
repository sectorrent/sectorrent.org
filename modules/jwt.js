const crypto = require('crypto');

exports.generate = (headers, payload, secret) => {
	const message = base64UrlEncode(JSON.stringify(headers))+'.'+base64UrlEncode(JSON.stringify(payload));
	const signature = base64UrlEncode(crypto.createHmac('sha256', secret).update(message).digest());
	return message+'.'+signature;
};

exports.isValid = (jwt, secret) => {
	const token = jwt.split('.');

	const expires = JSON.parse(Buffer.from(token[1], 'base64').toString()).exp < Date.now()/1000;
	const signature = base64UrlEncode(crypto.createHmac('sha256', secret).update(token[0]+'.'+token[1]).digest());

	if(expires || signature !== token[2]){
		return false;
	}
	
	return true;
};

exports.decode = (jwt) => {
	const token = jwt.split('.');
	return {
		header: JSON.parse(Buffer.from(token[0], 'base64').toString()),
		payload: JSON.parse(Buffer.from(token[1], 'base64').toString()),
		signature: token[2]
	};
};

exports.generateOTP = (secret, time) => {
	time = Buffer.from(time.toString(16).padStart(16, '0'), 'hex');
	const otp = crypto.createHmac('sha256', secret).update(time).digest('hex');
	return otp.substr(0, 6);
};

function base64UrlEncode(s){
	return Buffer.from(s).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}