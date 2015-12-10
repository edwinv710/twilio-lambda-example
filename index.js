require("./environment.js");
var twilio = require('twilio');

exports.handler = function (event, context) {
  var twilio_account_sid = process.env.TWILIO_ACCOUNT_SID;
  var twilio_auth_token  = process.env.TWILIO_AUTH_TOKEN;
  var client = new twilio.RestClient(twilio_account_sid, twilio_auth_token);

  client.sendSms({
    to: event.from,
    from:event.to,
    body:event.body
  }, function(error, message) {
      if (!error) {
          console.log('Success! The SID for this SMS message is:');
          console.log(message.sid);
          console.log('Message sent on:');
          console.log(message.dateCreated);
          context.succeed({});
      } else {
          console.log('Oops! There was an error.');
          console.log(error);
          context.fail({});
      }
  });
};
