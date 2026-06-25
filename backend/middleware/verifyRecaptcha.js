const axios =
require("axios");

const MINIMUM_SCORE = 0.5;

module.exports =
async (
req,
res,
next
) => {

try {

const token =
req.body.captchaToken;

if (!token) {

return res.status(400).json({

success:false,

message:
"Captcha token is missing."

});

}

const response =
await axios.post(

"https://www.google.com/recaptcha/api/siteverify",

null,

{

params:{

secret:
process.env.RECAPTCHA_SECRET_KEY,

response:token

}

}

);

const data =
response.data;

if (!data.success) {

return res.status(403).json({

success:false,

message:
"Captcha verification failed."

});

}

if (
data.score <
MINIMUM_SCORE
) {

return res.status(403).json({

success:false,

message:
"Suspicious activity detected."

});

}

req.recaptcha = {

score:data.score,

action:data.action

};
const expectedAction =
req.path.replace("/", "");

if (
data.action !== expectedAction &&
!(
expectedAction === "forgot-password" &&
data.action === "forgot_password"
)
) {

return res.status(403).json({

success:false,

message:"Invalid captcha action."

});

}

next();

}

catch(error){

console.log(
"RECAPTCHA ERROR:",
error.message
);

return res.status(500).json({

success:false,

message:
"Unable to verify captcha."

});

}

};