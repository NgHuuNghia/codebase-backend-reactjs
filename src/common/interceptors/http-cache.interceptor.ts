import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
	trackBy(context: ExecutionContext): string | undefined {
		const request = context.switchToHttp().getRequest()
		const httpServer = request.applicationRef

		const isGetRequest = httpServer.getRequestMethod(request) === 'GET'
		console.log('Chin')
		const excludePaths = []
		if (
			!isGetRequest ||
			(isGetRequest && excludePaths.includes(httpServer.getRequestUrl))
		) {
			return undefined
		}
		return httpServer.getRequestUrl(request)
	}
}
