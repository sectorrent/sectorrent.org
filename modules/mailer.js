var nodemailer = require('nodemailer');

exports.mail = async (auth, mail) => {
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: auth.email,
            pass: auth.password
        }

    }).sendMail({
        name: mail.name,
        from: auth.email,
        to: '"'+mail.to_name+'" '+mail.email,
        subject: mail.subject,
        html: mail.content

    }, function(error, info){
        if(error){
            console.log(error);
        }
    });
};
