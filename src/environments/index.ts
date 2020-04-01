import * as dotenv from 'dotenv'
dotenv.config()
// bot telegram
const GROUP_CHAT_ID: string = process.env.GROUP_CHAT_ID || '-439672763' // LUNCH PROJECT
const TOKEN_BOT: string =
	process.env.TOKEN_BOT || '1180039188:AAEXH4YsdKTF73Ly2L8y8nbFYFuyjllU8c0'
// environment
const NODE_ENV: string = process.env.NODE_ENV || 'development'

// author
const AUTHOR: string = process.env.AUTHOR || 'Acexis'

// couchdb
const COUCH_NAME: string = process.env.COUCH_NAME || 'xxx'
// console.log(APP_NAME)

// application
const NAME: string = process.env.NAME || 'lun3'
const PRIMARY_COLOR: string = process.env.PRIMARY_COLOR || '#bae7ff'
const DOMAIN: string = process.env.DOMAIN || 'devcloud3.digihcs.com'
const PORT: number = +process.env.PORT || 14047
const END_POINT: string = process.env.END_POINT || `graphql${NAME}`
const VOYAGER: string = process.env.VOYAGER || 'voyager'
const FE_URL: string = process.env.FE_URL || 'xxx'
const RATE_LIMIT_MAX: number = +process.env.RATE_LIMIT_MAX || 10000
const GRAPHQL_DEPTH_LIMIT: number = +process.env.GRAPHQL_DEPTH_LIMIT || 4

// static
const STATIC: string = process.env.STATIC || 'static'

// mlab
const MLAB_URL: string =
	process.env.MLAB_URL ||
	'mongodb://admin:chnirt1803@ds119663.mlab.com:19663/chnirt-secret'

// mongodb
const MONGO_PORT: number = +process.env.MONGO_PORT || 14049
const MONGO_NAME: string = process.env.MONGO_NAME || NAME
const MONGO_URL: string = `mongodb://localhost:${MONGO_PORT}/${MONGO_NAME}`

// jsonwebtoken
const ISSUER: string = process.env.ISSUER || 'http://chnirt.github.io'
const ACCESS_TOKEN: string = process.env.ACCESS_TOKEN || 'access-token'
const ACCESS_TOKEN_SECRET: string =
	process.env.ACCESS_TOKEN_SECRET || '02838633636'
const REFRESH_TOKEN: string = process.env.REFRESH_TOKEN || 'refresh-token'
const REFRESH_TOKEN_SECRET: string =
	process.env.REFRESH_TOKEN_SECRET || 'refresh-token-key'
const EMAIL_TOKEN: string = process.env.EMAIL_TOKEN || 'email-token'
const EMAIL_TOKEN_SECRET: string =
	process.env.EMAIL_TOKEN_SECRET || 'email-token-key'
const RESETPASS_TOKEN: string = process.env.RESETPASS_TOKEN || 'resetpass-token'
const RESETPASS_TOKEN_SECRET: string =
	process.env.RESETPASS_TOKEN_SECRET || 'resetpass-token-key'

// bcrypt
const SALT: number = +process.env.SALT || 10

// nodemailer
const NODEMAILER_USER: string = process.env.NODEMAILER_USER || 'xxx'
const NODEMAILER_PASS: string = process.env.NODEMAILER_PASS || 'xxx'

// pubsub
const NOTIFICATION_SUBSCRIPTION: string = 'newNotification'
const USER_SUBSCRIPTION: string = 'newUser'
const MESSAGES_SUBSCRIPTION: string = 'newMessages'

export {
	GROUP_CHAT_ID,
	TOKEN_BOT,
	NODE_ENV,
	AUTHOR,
	COUCH_NAME,
	NAME,
	PRIMARY_COLOR,
	DOMAIN,
	PORT,
	END_POINT,
	VOYAGER,
	FE_URL,
	RATE_LIMIT_MAX,
	GRAPHQL_DEPTH_LIMIT,
	STATIC,
	MLAB_URL,
	MONGO_URL,
	MONGO_PORT,
	MONGO_NAME,
	ISSUER,
	ACCESS_TOKEN,
	ACCESS_TOKEN_SECRET,
	REFRESH_TOKEN,
	REFRESH_TOKEN_SECRET,
	RESETPASS_TOKEN,
	RESETPASS_TOKEN_SECRET,
	EMAIL_TOKEN,
	EMAIL_TOKEN_SECRET,
	SALT,
	NODEMAILER_USER,
	NODEMAILER_PASS,
	USER_SUBSCRIPTION,
	NOTIFICATION_SUBSCRIPTION,
	MESSAGES_SUBSCRIPTION
}
