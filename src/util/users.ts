import { GuildMember, PartialGuildMember, User } from 'discord.js'
import { config } from '../Config.js'

export const userShouldBePinged = (
  user: GuildMember | PartialGuildMember
): boolean =>
  !user.roles.cache.has(
    config.roles.noPing
  )

export const pseudoMention = (user: User): `${string}#${string}` =>
  `${user.username}#${user.discriminator}`

export const mention = (
  user: GuildMember | User | PartialGuildMember
): string => {
  if (user instanceof User) {
    return actualMention(user)
  } else {
    return userShouldBePinged(user)
      ? actualMention(user)
      : pseudoMention(
        user.user
      )
  }
}
export const actualMention = (
  user: GuildMember | User | PartialGuildMember
): string => `<@${user.id}>`

export const mentionWithNoPingMessage = (user: GuildMember): string =>
  userShouldBePinged(user)
    ? `<@${user.id}> (Don't want to be pinged? </role No Ping:1059214166075912222>)`
    : pseudoMention(user.user)

export const isSpecialUser = (user: GuildMember): boolean =>
  user.premiumSinceTimestamp !=
  null ||
  user.roles.cache.has(config.roles.staff) ||
  user.roles.cache.has(config.roles.notable ?? '')
