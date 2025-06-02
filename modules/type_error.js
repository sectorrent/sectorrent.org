class TypeError extends Error {

	constructor(type, message){
		super('Fields not set.');
		this.name = this.constructor.name;
		this.type = type;
		this.message = message;
	}
}

module.exports = TypeError;