import { SchemaDirectiveVisitor } from 'graphql-tools'
import { ForbiddenError, AuthenticationError } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'
import { Role as RoleEntity } from '@models'
import { getMongoRepository } from 'typeorm'

class PermissionDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field) {
		const { resolve = defaultFieldResolver } = field
		const { permission } = this.args

		field.resolve = async function(...args) {
			const { currentUser } = args[2]

			if (!currentUser) {
				throw new AuthenticationError(
					'Authentication token is invalid, please try again.'
				)
			}

			const roleInfor = await getMongoRepository(RoleEntity).findOne({
				_id: currentUser.idRole
			})

			const { permissions } = roleInfor

			if (permissions.indexOf(permission) === -1) {
				throw new ForbiddenError('You are not authorized for this resource.')
			}

			return resolve.apply(this, args)
		}
	}
}

export default PermissionDirective
