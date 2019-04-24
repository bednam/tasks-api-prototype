import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import resolvers from './src/resolvers'
import typeDefs from './src/schema'
import models from './src/models'

const PORT = process.env.PORT || 3500
const app = express()

const server = new ApolloServer({
	typeDefs,
	resolvers,
	playground: true,
	context: { models }
})

server.applyMiddleware({ app })

app.get('/', (req, res) => {
	res.send({ hello: 'there!' })
})

app.listen(PORT, () =>
	console.log(`Listening at http://localhost:${PORT}/graphql`)
)
