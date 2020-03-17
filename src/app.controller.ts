import { Controller, Get, Param, Res, HttpService } from '@nestjs/common'

import { STATIC } from './environments'

@Controller()
export class AppController {
	constructor(private readonly httpService: HttpService) {}

	@Get(`${STATIC!}/:fileId`)
	getUpload(@Param('fileId') fileId, @Res() res): any {
		return res.sendFile(fileId, {
			root: STATIC!
		})
	}
}
