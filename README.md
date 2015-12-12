# Tutorial: Use Twilio's REST API on AWS Lambda

## Objectives


1. Learn how to create an AWS Lambda function that executes node.js code.
2. Learn how to use Twilio's REST API in a Lambda function.
3. Expose our Lambda function to the web using Amazon API Gateway service.

## Overview

When learning any technology, I believe in tacking a project that is simple yet functional and can be further expanded in countless ways after completion. 
This philosophy leads us to the problem we are trying to solve.

For a moment, lets imagine this scenario. We are trying to signup for a service that requires a text message for 
authentication but we do not feel comfortable giving them our personal cell phone number. To solve this problem, we decide to 
obtain a temporary phone number and  create an application that routes all messages received from our temporary number to our 
personal number. 

## Steps

### Create a Twilio account.

First, we need to sign-up for a Twilio account. Go to http://www.twilio.com and sign-up for a trial account. 
After you finish the sign up process, please make sure that you obtain a new phone number for your trial account.  
Since we need to make use of the api, make sure to find and make note of your account's API credentials. 

### Create a node project.

Lets start out by creating a folder called "twiliolambda". Naviagte to that directory and initialize a 
node project. For simplicity sake, you can use the defaults values provided by the initializer.

```
$ mkdir twiliolambda
$ cd twiliolambda
$ npm init
```
After our project has been initialize, we will need to install the necessary dependecies. 
The first dependency we will install is [twilio-node](https://github.com/twilio/twilio-node). The twilio-node package is the official node wrapper for Twilio API.

```
$ npm install -g twilio --save
```

We are also going to use the [node-lambda](https://github.com/motdotla/node-lambda) package. The node-lamda package allows us to easily test our Lamda functions locally.  
It also has many other great features such as allowing us to deploy or function directly to AWS.

```
$ npm install -g node-lambda -dev
```

Now that we have all our dependencies installed, we can start getting out hands dirty with code.

### Adding our API credentials to our app.

Before we can start using the Twilio API, we will need to set-up our credentials. Create a file called environment.js. 
The environment.js file will store our API credentials in the proccess.env object. Please make sure to replace the two values with 
the corresponding API credential.

```javascript
process.env.TWILIO_ACCOUNT_SID = "TWILIO ACCOUNT SID";
process.env.TWILIO_AUTH_TOKEN = "TWILIO AUTh TOKEN";
```

Important Notice: if youa re going to upload this project to github, please make sure you do not upload this file. It would be a good idea to include the 
environment.js in the.gitignore file. 


### Creating our function

Most Lambda function start with a simililar layout. We are going to start by typing the following code into our index.js file. 
If you do not have an index.js file, please create it in the root directory of your project.

```javascript
exports.handler = function (event, context) {
};
```

We will also want to require our environment.js file and the Twilio module.  

```javascript
require("./environment.js");
var twilio = require('twilio');

exports.handler = function (event, context) {  
};
```

With the Twilio module and the API credentials, we can start using the API. Lets create a client. 

```javascript
require("./environment.js");
var twilio = require('twilio');

exports.handler = function (event, context) {  
     
  var twilio_account_sid = process.env.TWILIO_ACCOUNT_SID;
  var twilio_auth_token  = process.env.TWILIO_AUTH_TOKEN;
  var client = new twilio.RestClient(twilio_account_sid, twilio_auth_token);


};
```

When a text message is sent to our Twilio number, twilio is going to send that message over to our 
lambda function. It will also provide us with three parameters we will make use of in our app.

    To - Our Twilio phone number.
    From - The phone number that sent us the message.
    Body - The message that wa sent.

:warning:  **Note:** Even though the paramaters provided to us will start in a capital letter, we are going to use them in the traditional
camel-case form. In a later step we will intercept the request and format the parameters.

```javascript
require("./environment.js");
var twilio = require('twilio');

exports.handler = function (event, context) {  
     
  var twilio_account_sid = process.env.TWILIO_ACCOUNT_SID;
  var twilio_auth_token  = process.env.TWILIO_AUTH_TOKEN;
  var client = new twilio.RestClient(twilio_account_sid, twilio_auth_token);

     client.sendSms({
    to: recievingPhoneNumber,
    from:event.to,
    body:message
  }, function(error, message) {
  });

};
```

The last thing we need to do is to complete the callback function. The callback function will be executed after each attempt to send a text message by the REST API. 
The callback function will execute whether the text message is sent or fails. If there was an error in our request, our callback function will return an error object. 
We can use test the availability of this object to test if our the operation passed or failed.

For our pourposes, we will display a message to the console to log the response from the API request. We will also let lambda know whether the function passed or failed by 
excecuting the succeed or fail function from the context object.

For our pourposes, we will display a message to the console to log the response from the request. We will also tell lambda whether the function passed or failed by excecuting the succeed or fail function from the context object.

```javascript

require("./environment.js");
var twilio = require('twilio');

exports.handler = function (event, context) {
  var twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  var twilioAuthToken  = process.env.TWILIO_AUTH_TOKEN;
  var recievingPhoneNumber = process.env.RECIEVING_PHONE_NUMBER;
  var client = new twilio.RestClient(twilioAccountSid, twilioAuthToken);
  var message = "New message from "+event.from+": "+event.body;

  client.sendSms({
    to: recievingPhoneNumber,
    from:event.to,
    body:message
  }, function(error, message) {
      if (!error) {
          console.log("The message from "+event.from+" was sent successfully!");
          console.log("The Twilio Message ID is "+message.sid);
          context.succeed({});
      } else {
          console.log('Unfortunately, the following error occured: ');
          console.log(error);
          context.fail({});
      }
  });
};
```

### Testing our function locally


There you go, we have completed all the code necessary for out lambda function. Before we can test, we will need to provide some sample paramters to 
that will mimick what we can expect from Twilio. The package `node-lamda` provides us with a command to do just that.

Before we run the command, we will need to create a file called event.json. To simulate the parameters  that our lambda function will revieve,
we will populate this file with twith the relative paramters. Remember to replace the strings with the appropriate values.

{
  "from": "Your Phone Number",
  "to": "Your Twilio Number",
  "body": "Hello World!"
}

After saving the event.json file, run the lambda function using the following command:

    $ node-lambda run

Within 10-15 seconds you shouldrecieve a text message. Congratulations, you have completed all the necessary code!

### Set-up you lambda function on AWS

So far we have created a our function from the code perspective, now we will set-up the serice.  If you do not have an AWS developer account, please signup for one. 
On a personal note, I feel that an AWS developer account is esential for any web developer.

Once you have an AWS account, go to the dashboard that desplays all the services provided by Amazon, and click on `Lambda`. Press the `Create Lambda` button to provision your function.

On the next screen, you will be asked to find a blueprint. Search for the `twilio blueprint` and select it. 
The twilio blueprint is helpful because it provides us with another set of instructions that will help us in configuring Twilio with lambda. 
It also provides with sample code to text if we correctly set-up the function.


<a href="http://res.cloudinary.com/dqacnk0ea/image/upload/blog/twilio-lambda-article/001LambdaBlueprint.png" target="_blank" style="text-align: center;display: block;margin-top: 50px;margin-bottom: 50px;"><img src="http://res.cloudinary.com/dqacnk0ea/image/upload/c_scale,w_400/blog/twilio-lambda-article/001LambdaBlueprint.png" 
alt="IMAGE ALT TEXT HERE" width="400" border="10" /></a>



