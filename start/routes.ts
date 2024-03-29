/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { buildSchema, GraphQLError } from 'graphql'

import { GraphQLServer, JsonLogger } from '@dreamit/graphql-server'

interface User {
  userId: string
  userName: string
}

interface LogoutResult {
  result: string
}

export const userOne: User = { userId: '1', userName: 'UserOne' }
export const userTwo: User = { userId: '2', userName: 'UserTwo' }

const userSchema = buildSchema(`
  schema {
    query: Query
    mutation: Mutation
  }
  
  type Query {
    returnError: User 
    users: [User]
    user(id: String!): User
  }
  
  type Mutation {
    login(userName: String, password: String): LoginData
    logout: LogoutResult
  }
  
  type User {
    userId: String
    userName: String
  }
  
  type LoginData {
    jwt: String
  }
  
  type LogoutResult {
    result: String
  }
`)

const userSchemaResolvers = {
  returnError(): User {
    throw new GraphQLError('Something went wrong!', {})
  },
  users(): User[] {
    return [userOne, userTwo]
  },
  user(input: { id: string }): User {
    switch (input.id) {
      case '1': {
        return userOne
      }
      case '2': {
        return userTwo
      }
      default: {
        throw new GraphQLError(`User for userid=${input.id} was not found`, {})
      }
    }
  },
  logout(): LogoutResult {
    return { result: 'Goodbye!' }
  },
}

const graphqlServer = new GraphQLServer({
  schema: userSchema,
  rootValue: userSchemaResolvers,
  logger: new JsonLogger('fastifyServer', 'user-service'),
})

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('/graphql', async ({ request, response }) => {
  await graphqlServer.handleRequest(
    {
      headers: request.headers(),
      url: request.url(),
      body: request.body(),
      method: request.method(),
    },
    {
      setHeader: function (name, value) {
        response.header(name, value as string)
        return this
      },
      end: function (chunk) {
        response.send(chunk)
        return this
      },
      removeHeader: response.removeHeader,
      statusCode: response.response.statusCode,
    }
  )
})
