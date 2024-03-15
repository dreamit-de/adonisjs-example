import { test } from '@japa/runner'

test.group('Graphql', () => {
  test('get a single user', async ({ client }) => {
    const response = await client
      .post('/graphql')
      .header('content-type', 'application/json')
      .json({ query: '{ user(id:"1") { userId, userName } }' })

    response.assertStatus(200)
    response.assertBody({
      data: {
        user: {
          userId: '1',
          userName: 'UserOne',
        },
      },
    })
  })
})
