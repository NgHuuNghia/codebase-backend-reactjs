import { SchemaDirectiveVisitor } from 'graphql-tools'
import { ForbiddenError, AuthenticationError } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'

class PermissionDirective extends SchemaDirectiveVisitor {
	visitFieldDefinition(field) {
		const { resolve = defaultFieldResolver } = field
		const { permission } = this.args

		field.resolve = async function(...args) {
			const { currentUser, permissions } = args[2]

			// console.log('Hello', permission, permissions)

			if (!currentUser) {
				throw new AuthenticationError(
					'Authentication token is invalid, please try again.'
				)
			}

			// console.log(permissions.indexOf(permission))

			if (permissions.indexOf(permission) === -1) {
				throw new ForbiddenError('You are not authorized for this resource.')
			}

			return resolve.apply(this, args)
		}
	}
}

export default PermissionDirective
