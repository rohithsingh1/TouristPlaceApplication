// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = 'ACba0561abefb56d438e5fc4f5b8e7d50a';
const authToken = 'dd23798c4dbd36a7029724d5d06dec90';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+14794691951',
     to: '+917901427367'
   })
  .then(message => console.log(message.sid));
