class FieldError extends Error {

	constructor(fields){
		super('Fields not set.');
		this.name = this.constructor.name;
		this.fields = fields;
	}
}

module.exports = FieldError;