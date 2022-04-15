import {GuildMember, PartialGuildMember, User} from 'discord.js'
import {config} from '../Config.js'

export const userShouldBePinged = (user: GuildMember | PartialGuildMember) => !user.roles.cache.has(config.roles.noPing)

export const pseudoMention = (user: User) => `${user.username}#${user.discriminator}`

export const mention = (user: GuildMember | PartialGuildMember) =>
	userShouldBePinged(user) ? actualMention(user) : pseudoMention(user.user)

export const actualMention = (user: GuildMember | User | PartialGuildMember) => `<@${user.id}>`

export const mentionWithNoPingMessage = (user: GuildMember) =>
	userShouldBePinged(user) ? `<@${user.id}> (Don't want to be pinged? **/role No Ping**)` : pseudoMention(user.user)
