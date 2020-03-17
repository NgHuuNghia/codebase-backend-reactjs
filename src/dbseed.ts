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

		client.close()
		console.log('💤  Server off')
	} catch (err) {
		console.log('❌  Server error', err.stack)
	}
}

main()
