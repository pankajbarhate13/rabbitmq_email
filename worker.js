const amqp = require('amqplib/callback_api');
// const nodemailer = require('nodemailer');
const config = require('../rabbitmq_email/Config/env');



// load aws sdk
var aws = require('aws-sdk');

// load aws config
aws.config.loadFromPath('config.json');

// load AWS SES
var ses = new aws.SES(config.email);


function sendEmailTo(recieverEmail) {

  // Send mail with ethereal
 
  /*  nodemailer.createTestAccount((err, account) => {
    
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false, 
        auth: {
          user: account.user,
          pass: account.pass
        }
    });
    
    let mailOptions = {
      from: '"Pankaj Barhate 👻" <experdel@example.com>',
      to: recieverEmail,
      subject: 'Subscription ✔',
      text: 'You are subscribed successfully.',
      html: '<b>You are subscribed successfully.</b>'
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
  }); */


  // Send mail with AWS
  var urlCrypt = require('url-crypt')('~{ry*I)44==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');

  var date1 = new Date (),
  date2 = new Date ( date1 );
  date2.setMinutes ( date1.getMinutes() + 30 );
  var host = "api" 
  var payload = {
    email: recieverEmail,
    date: date2,
  };

  var reset_password_url = urlCrypt.cryptObj(payload);

  const params = {
    Destination: {
      ToAddresses: [recieverEmail]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: 
          'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n <br><br>' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n<br>' +
          'http://' + host + '?verify=' + reset_password_url + '\n\n<br><br>' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        },
        Text: {
          Charset: 'UTF-8',
          Data: "Hello"
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: "Test Email"
      }
    },
    ReturnPath: 'pankajb.experdel@gmail.com',
    Source: 'pankajb.experdel@gmail.com'
  }
  
  ses.sendEmail(params, (err, data) => {
    if (err){sendToQueue
      console.log(err)
    } 
    else {
      console.log(data)
    }
  })
}

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    const q = 'email';
    ch.assertQueue(q, { durable: true });
    
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, async function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
      
      let form = JSON.parse(msg.content.toString());
      await sendEmailTo(form.email);
      ch.ack(msg);
      
    }, { noAck: false });
  });
});