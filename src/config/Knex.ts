import knexBuilder from "knex"
import "dotenv/config"
import { InternalServerError } from "../core/exceptions/InternalServerError.js"

const host = process.env.DB_HOST
const name = process.env.POSTGRES_DB
const user = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
let port: number
try {
	const stringPort = process.env.DB_PORT
	if (stringPort === undefined) {
		console.log("Database environment variables are not defined")
		throw new InternalServerError()
	}
	port = parseInt(stringPort)
} catch (error) {
	console.log(error)
	console.log("DB_PORT should be a positive integer")
	throw new InternalServerError()
}

if (
	host === undefined ||
	name === undefined ||
	user === undefined ||
	password === undefined
) {
	console.log("Database environment variables are not defined")
	throw new InternalServerError()
}

export const knexInstance = knexBuilder({
	client: "pg",
	connection: {
		host: host,
		database: name,
		user: user,
		password: password,
		port: port,
		pool: {
			min: 2,
			max: 10,
		},
	},
})
