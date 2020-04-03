import { MongoClient } from 'mongodb'

import { MONGO_URL, MONGO_NAME, NAME } from './environments'

async function main() {
	console.log('🚀  Server ready')

	const client = new MongoClient(MONGO_URL, {
		useNewUrlParser: true
		// useUnifiedTopology: true
	})

	try {
		await client.connect()

		console.log('🌱  Database seeder is running')

		const db = client.db(MONGO_NAME)

		const accounts = [
			{
				_id: '24b143d0-5dcc-11ea-b131-411071cb195a',
				username: 'superadmin',
				password: '$2b$10$5g52Kh.NU4dnxBGNFxP/fOg7IA6KA07cZDrMd0qncPezamU6F/Bca'
			},
			{
				_id: '44b143d0-5dcc-aa43-b131-411071cb195a',
				username: 'admin',
				password: '$2b$10$5g52Kh.NU4dnxBGNFxP/fOg7IA6KA07cZDrMd0qncPezamU6F/Bca'
			},
			{
				_id: '54b143d0-123a-11ea-c131-411071cb195a',
				username: 'user',
				password: '$2b$10$5g52Kh.NU4dnxBGNFxP/fOg7IA6KA07cZDrMd0qncPezamU6F/Bca'
			}
		]

		accounts.map(async item => {
			await db.collection('accounts').findOneAndUpdate(
				{ _id: item._id },
				{
					$set: {
						...item,
						createdAt: +new Date(),
						updatedAt: +new Date()
					}
				},
				{ upsert: true }
			)
		})

		const users = [
			{
				_id: '24bc8e70-5dcc-11ea-b131-411071cb195a',
				idAccount: '24b143d0-5dcc-11ea-b131-411071cb195a',
				fullName: 'Superadmin',
				idRole: 'f2dbbda0-be4d-11e9-bc7c-2117bce2f37c',
				isActive: true
			},
			{
				_id: '14bc8d71-5dcc-11ea-das5-411071cb195a',
				idAccount: '44b143d0-5dcc-aa43-b131-411071cb195a',
				fullName: 'admin',
				idRole: 'f35a65e0-be4e-11e9-a6ad-c109fb49072b',
				isActive: true
			},
			{
				_id: '34bc8e70-s455-123a-b131-411071cb195a',
				idAccount: '54b143d0-123a-11ea-c131-411071cb195a',
				fullName: 'Nguyễn Hữu Nghĩa',
				idRole: 'f45a65e0-be4e-11e9-a6ad-c109fb49072b',
				isActive: true
			}
		]

		users.map(async item => {
			await db.collection(`${NAME}_users`).findOneAndUpdate(
				{ _id: item._id },
				{
					$set: {
						...item,
						createdAt: +new Date(),
						updatedAt: +new Date()
					}
				},
				{ upsert: true }
			)
		})

		const permissions = [
			{
				_id: 'f1dbbda0-be4d-11e9-bc7c-2117bce2f37c',
				code: 'USER_CREATE',
				description: 'Tạo người dùng'
			},
			{
				_id: 'ad5a65e0-be4e-11e9-a6ad-c109fb49072b',
				code: 'USER_UPDATE',
				description: 'Cập nhật người dùng'
			},
			{
				_id: '6ca4ffb0-be4e-11e9-b75c-d915f7b6e00b',
				code: 'USER_DELETE',
				description: 'Xóa người dùng'
			},
			{
				_id: '19355210-bf04-11e9-83da-09d22932d6d6',
				code: 'MENU_CREATE',
				description: 'Tạo menu'
			},
			{
				_id: 'f1f12d40-bf04-11e9-a629-29525b452984',
				code: 'MENU_UPDATE',
				description: 'Cập nhật menu'
			},
			{
				_id: '08fcd5c0-bf05-11e9-a629-29525b452984',
				code: 'MENU_DELETE',
				description: 'Xóa menu'
			},
			{
				_id: 'b4592b60-be4e-11e9-a6ad-c109fb49072b',
				code: 'ORDER_CREATE',
				description: 'Đặt món'
			},
			{
				_id: 'ce33d260-be4e-11e9-a6ad-c109fb49072b',
				code: 'ORDER_CONFIRM',
				description: 'Xác nhận đã ăn'
			},
			{
				_id: 'ce33d440-be4e-11e9-a6ad-c109fb49072b',
				code: 'ROLE_CREATE',
				description: 'Tạo vai trò'
			},
			{
				_id: 'ce33d440-be4e-zzzz-a6ad-c109fb49072b',
				code: 'ROLE_REMOVE',
				description: 'Xóa vai trò'
			},
			{
				_id: 'ce33d440-be4e-zzzz-asag-c109fb49072b',
				code: 'ROLE_EDIT',
				description: 'Sửa vai trò'
			}
		]

		permissions.map(async item => {
			await db.collection(`${NAME}_permissions`).findOneAndUpdate(
				{ _id: item._id },
				{
					$setOnInsert: {
						_id: item._id
					},
					$set: {
						code: item.code,
						description: item.description,
						createdAt: new Date(),
						updatedAt: new Date()
					}
				},
				{ upsert: true }
			)
		})

		const roles = [
			{
				_id: 'f2dbbda0-be4d-11e9-bc7c-2117bce2f37c',
				code: 'SUPERADMIN',
				description: 'Quyền cao nhất quản lí tất cả khu vực ',
				isActive: true,
				permissions: ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE']
			},
			{
				_id: 'f35a65e0-be4e-11e9-a6ad-c109fb49072b',
				code: 'ADMIN',
				description: 'Quyền quản lí khu vực',
				isActive: true,
				permissions: [
					'MENU_CREATE',
					'MENU_UPDATE',
					'MENU_DELETE',
					'ORDER_CREATE',
					'ORDER_CONFIRM'
				]
			},
			{
				_id: 'f45a65e0-be4e-11e9-a6ad-c109fb49072b',
				code: 'USER',
				description: 'Quyền người dùng cơ bản',
				isActive: true,
				permissions: ['ORDER_CREATE', 'ORDER_CONFIRM']
			}
		]

		roles.map(async item => {
			await db.collection(`${NAME}_roles`).findOneAndUpdate(
				{ _id: item._id },
				{
					$set: {
						...item,
						createdAt: new Date(),
						updatedAt: new Date()
					}
				},
				{ upsert: true }
			)
		})

		enum Category {
			COMPANY,
			CITY,
			DEPARTMENT
		}
		const nodes = [
			{
				_id: 'nodebda0-be4d-11e9-bc7c-2117bce2f37c',
				name: 'ACEXIS',
				category: Category[Category.COMPANY]
			},
			{
				_id: 'node65e0-be4e-11e9-a6ad-c109fb49072b',
				name: 'Hồ Chí Minh',
				category: Category[Category.CITY],
				idParent: 'nodebda0-be4d-11e9-bc7c-2117bce2f37c'
			},
			{
				_id: 'aade65e0-be4e-11e9-a6ad-c109fb49072b',
				name: 'Nha Trang',
				category: Category[Category.CITY],
				idParent: 'nodebda0-be4d-11e9-bc7c-2117bce2f37c'
			},
			{
				_id: 'nbbe65e0-aaj9-11e5-a6ad-c109fb49072b',
				name: 'Đà Nẵng',
				category: Category[Category.CITY],
				idParent: 'nodebda0-be4d-11e9-bc7c-2117bce2f37c'
			}
		]

		nodes.map(async item => {
			await db.collection(`${NAME}_nodes`).findOneAndUpdate(
				{ _id: item._id },
				{
					$set: {
						...item,
						createdAt: new Date(),
						updatedAt: new Date()
					}
				},
				{ upsert: true }
			)
		})

		client.close()
		console.log('💤  Server off')
	} catch (err) {
		console.log('❌  Server error', err.stack)
	}
}

main()
