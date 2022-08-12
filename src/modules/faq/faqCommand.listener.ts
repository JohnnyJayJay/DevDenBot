import {FAQ} from '../../store/models/FAQ.js'
import {EventListener} from '../module.js'
import {createFaqEmbed} from './faq.util.js'

export const FaqCommandListener: EventListener = {
	async messageCreate(_, message) {
		console.log(message.content)
		console.log(message.content)
		console.log(message.content)
		console.log(message.content)
		console.log(message.content)

		if (!message.content.startsWith('?')) return
		const arg = message.content.split(/ /)[0].substring(1)
		if (!arg) return
		const faq = await FAQ.findOne({
			where: {name: arg}
		})
		if (!faq) {
			const reply = await message.reply(`Could not find FAQ \`${arg}\``)
			setTimeout(() => reply.delete(), 5000)
			return
		}

		const embed = createFaqEmbed(faq, message.author, message.member ?? undefined)
		await message.reply({embeds: [embed]})
	}
}
