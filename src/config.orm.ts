import { NODE_ENV, MONGO_URL, MONGO_PORT, MONGO_NAME } from '@environments'

const orm = {
	development: {
		url: MONGO_URL!
	},
	testing: {
		url: MONGO_URL!
	},
	staging: {
		url: MONGO_URL!
	},
	production: {
		url: `mongodb://${process.env.MONGO_URL}`
	}
}

export default orm[NODE_ENV!]
