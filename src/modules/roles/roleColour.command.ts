import { Command, ExecutableSubcommand } from 'djs-slash-helper'
import { ColorResolvable, GuildMember } from 'discord.js'
import { ColourRoles } from '../../store/models/ColourRoles.js'
import { config } from '../../Config.js'
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10'
import { wrapInTransaction } from '../../sentry.js'

const ResetSubcommand: ExecutableSubcommand = {
  type: ApplicationCommandOptionType.Subcommand,
  name: 'reset',
  description: 'Reset your role colour',
  async handle (interaction) {
    await interaction.deferReply({ ephemeral: true })
    const user = interaction.user
    const member = interaction.member as GuildMember
    const roleInfo = await ColourRoles.findOne({
      where: {
        id: user.id
      }
    })
    if (roleInfo == null) {
      await interaction.followUp(
        'You do not have a colour role. Use </rolecolour set:1059214166075912223> to set one'
      )
      return
    }
    const roleId = roleInfo.getDataValue('role') // no idea why normal property lookup doesnt work
    if (!roleId) {
      throw new Error('No colour role found, database call failed?')
    }
    const role = member.roles.resolve(roleId.toString())
    if (!role) {
      await Promise.all([
        ColourRoles.destroy({
          where: {
            id: user.id
          }
        }),
        interaction.followUp(
          'You do not have a colour role. Use </rolecolour set:1059214166075912223> to set one'
        )
      ])
    }

    await Promise.all([
      role.delete(),
      ColourRoles.destroy({
        where: {
          id: user.id
        }
      }),
      interaction.followUp('Your role colour has been reset')
    ])
  }
}

const SetSubcommand: ExecutableSubcommand = {
  type: ApplicationCommandOptionType.Subcommand,
  name: 'set',
  description: 'Set your role colour',
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: 'colour',
      description: 'The colour to set as a hex string (format: `#RRGGBB`)',
      required: true
    }
  ],
  handle: wrapInTransaction('rolecolour/set', async (span, interaction) => {
    const colour = interaction.options.get('colour', true).value as string
    if (!colour.startsWith('#') || colour.length !== 7) {
      await interaction.reply({
        content: 'Not a valid colour',
        ephemeral: true
      })
      return
    }

    await interaction.deferReply({ ephemeral: true })
    const user = interaction.user
    const member = interaction.member as GuildMember
    const roleInfo = await ColourRoles.findOne({
      where: {
        id: user.id
      }
    })
    let role
    if (roleInfo != null) {
      const roleId = roleInfo.getDataValue('role') // no idea why normal property lookup doesnt work
      if (!roleId) {
        throw new Error('No colour role found, database call failed?')
      }
      role = member.roles.resolve(roleId.toString())
      await role?.setColor(colour as ColorResolvable)
    }

    if (role == null) {
      const position = interaction.guild?.roles.resolve(
        config.roles.separators.general
      )?.position ?? 0
      role = await member.guild.roles.create({
        color: colour as ColorResolvable,
        permissions: [],
        name: member.user.username,
        position
      })
      await ColourRoles.upsert({
        id: BigInt(user.id),
        role: BigInt(role.id)
      })
    }

    await member.roles.add(role)

    await interaction.editReply({
      content: `Set your colour to ${colour}`
    })
  })
}

export const RoleColourCommand: Command<ApplicationCommandType.ChatInput> = {
  name: 'rolecolour',
  description: 'Set your role colour',
  type: ApplicationCommandType.ChatInput,
  default_permission: false,
  options: [
    SetSubcommand,
    ResetSubcommand
  ],
  handle () {
    throw new Error('This command should not be executed')
  }
}
