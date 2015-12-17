require("./environment.js");
var twilio = require('twilio');

exports.handler = function (event, context) {
  var twilio_account_sid = process.env.TWILIO_ACCOUNT_SID;
  var twilio_auth_token  = process.env.TWILIO_AUTH_TOKEN;
  var my_phone_number    = process.env.MY_PHONE_NUMBER;
  var new_body           = "Message from "+event.from+": "+event.body;
  var client             = new twilio.RestClient(twilio_account_sid, twilio_auth_token);
  var xml                = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

  client.sendSms({
    to: my_phone_number,
    from: event.to,
    body: new_body
  }, function(error, message) {
      if (!error) {
          var log_message = message.sid+" "+message.dateCreated+" "+new_body;
          console.log(log_message);
          context.succeed(xml);
      } else {
          console.log(error);
          context.fail(xml);
      }
  });

};
