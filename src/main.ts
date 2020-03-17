import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { express as voyagerMiddleware } from 'graphql-voyager/middleware'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
// import * as csurf from 'csurf'
import * as rateLimit from 'express-rate-limit'
// import * as cookieParser from 'cookie-parser'
// import * as fs from 'fs'
import chalk from 'chalk'
import { getConnection } from 'typeorm'

import { MyLogger } from '@config'
import {
	ValidationPipe,
	LoggingInterceptor,
	TimeoutInterceptor,
	LoggerMiddleware
	// logger
} from '@common'
import { timeout, interval, cron } from '@shared'
import {
	NODE_ENV,
	PRIMARY_COLOR,
	DOMAIN,
	PORT,
	END_POINT,
	VOYAGER,
	RATE_LIMIT_MAX,
	STATIC
} from '@environments'

declare const module: any

async function bootstrap() {
	try {
		const app = await NestFactory.create<NestExpressApplication>(AppModule, {
			cors: true,
			logger: new MyLogger()
		})

		// NOTE: database connect
		const connection = getConnection('default')
		const { isConnected } = connection
		isConnected
			? Logger.log(`🌨️  Database connected`, 'TypeORM', false)
			: Logger.error(`❌  Database connect error`, '', 'TypeORM', false)

		// NOTE: tasks
		// timeout()
		// interval()
		cron()

		// NOTE: adapter for e2e testing
		const httpAdapter = app.getHttpAdapter()

		// NOTE: added security
		app.use(helmet())

		// NOTE: loggerMiddleware
		NODE_ENV !== 'testing' && app.use(LoggerMiddleware)

		// NOTE: body parser
		app.use(
			bodyParser.json({
				// type: (request: any) =>
				// 	request.get('Content-Type') === 'application/graphql' ||
				// 	request.get('Content-Type') === 'application/json',
				limit: '50mb'
			})
		)
		app.use(
			bodyParser.urlencoded({
				limit: '50mb',
				extended: true,
				parameterLimit: 50000
			})
		)

		// NOTE: session
		// app.use(session({ secret: 'nest is awesome' }))

		// NOTE: cruf
		// app.use(csurf())

		// NOTE: rateLimit
		app.use(
			rateLimit({
				windowMs: 1000 * 60 * 60, // an hour
				max: RATE_LIMIT_MAX!, // limit each IP to 100 requests per windowMs
				message:
					'⚠️  Too many request created from this IP, please try again after an hour'
			})
		)

		// NOTE: voyager
		process.env.NODE_ENV !== 'production' &&
			app.use(
				`/${VOYAGER!}`,
				voyagerMiddleware({
					displayOptions: {
						skipRelay: false,
						skipDeprecated: false
					},
					endpointUrl: `/${END_POINT!}`
				})
			)

		// NOTE: interceptors
		app.useGlobalInterceptors(new LoggingInterceptor())
		app.useGlobalInterceptors(new TimeoutInterceptor())

		// NOTE: global nest setup
		app.useGlobalPipes(new ValidationPipe())

		app.enableShutdownHooks()

		// NOTE: size limit
		app.use('*', (req, res, next) => {
			const query = req.query.query || req.body.query || ''
			if (query.length > 2000) {
				throw new Error('Query too large')
			}
			next()
		})

		// NOTE: serve static
		app.useStaticAssets(join(__dirname, `../${STATIC}`))

		const server = await app.listen(PORT!)

		// NOTE: hot module replacement
		if (module.hot) {
			module.hot.accept()
			module.hot.dispose(() => app.close())
		}

		NODE_ENV !== 'production'
			? Logger.log(
					`🚀  Server ready at http://${DOMAIN!}:${chalk
						.hex(PRIMARY_COLOR!)
						.bold(`${PORT!}`)}/${END_POINT!}`,
					'Bootstrap'
			  )
			: Logger.log(
					`🚀  Server is listening on port ${chalk
						.hex(PRIMARY_COLOR!)
						.bold(`${PORT!}`)}`,
					'Bootstrap'
			  )

		NODE_ENV !== 'production' &&
			Logger.log(
				`🚀  Subscriptions ready at ws://${DOMAIN!}:${chalk
					.hex(PRIMARY_COLOR!)
					.bold(`${PORT!}`)}/${END_POINT!}`,
				'Bootstrap'
			)
	} catch (error) {
		// logger.error(error)
		Logger.error(`❌  Error starting server, ${error}`, '', 'Bootstrap', false)
		process.exit()
	}
}
bootstrap().catch(e => {
	Logger.error(`❌  Error starting server, ${e}`, '', 'Bootstrap', false)
	throw e
})

// {
// 	"maxTaskDuration": 24,
// 	"timeAutoStop1": {
// 		"hour": 12,
// 		"minute": 45,
// 		"second": 0
// 	},
// 	"timeAutoStop2": {
// 		"hour": 20,
// 		"minute": 5,
// 		"second": 0
// 	},
// 	"allowTimerBeforeApproved": true
// }
