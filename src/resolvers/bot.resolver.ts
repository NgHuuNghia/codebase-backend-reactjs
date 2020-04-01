import { Resolver } from '@nestjs/graphql'
import * as TelegramBot from 'node-telegram-bot-api'
import { TOKEN_BOT, GROUP_CHAT_ID } from '@environments'
process.env['NTBA_FIX_319'] = '1'
const bot = new TelegramBot(TOKEN_BOT, { polling: true })

@Resolver('BotResponse')
export class BotResolver {
	constructor() {}
	async pushNotiOrder(): Promise<Boolean> {
		bot.sendMessage(GROUP_CHAT_ID, 'Đặt cơm nào mn ơi')
		bot.sendAudio(
			GROUP_CHAT_ID,
			'https://media.giphy.com/media/hoxltRnFzLhVsGAdpK/giphy.gif'
		)
		return true
	}

	pushNotiComfirmOrder() {
		bot.sendMessage(
			GROUP_CHAT_ID,
			'Nghỉ ăn trưa thôi mọi người ơi. Nhớ xác nhận đã ăn nha!!!.'
		)
		bot.sendAudio(
			GROUP_CHAT_ID,
			'https://media.giphy.com/media/3o7TKw9BgGKmSMzpgk/giphy.gif'
		)
	}
}
