const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('salainen', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })

  await user.save()
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map((blog) => new Blog({ ...blog, user: user._id }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog has id property', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  expect(blogs[0].id).toBeDefined()
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('no token to be 401 ', async () => {
  const newBlog = {
    title: 'add test',
    author: 'Edsger W. Dijkstra',
    likes: 50,
    url: 'test url'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

test('a valid blog can be added ', async () => {
  const response = await api.post('/api/login').send({
    username: 'root',
    name: 'Superuser',
    password: 'salainen'
  })

  const token = response.body.token

  const newBlog = {
    title: 'add test',
    author: 'Edsger W. Dijkstra',
    likes: 50,
    url: 'test url'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', token)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(n => n.title)
  expect(titles).toContain(
    'add test'
  )
})

test('default blog likes is zero ', async () => {
  const tRes = await api.post('/api/login').send({
    username: 'root',
    name: 'Superuser',
    password: 'salainen'
  })

  const token = tRes.body.token

  const newBlog = {
    title: 'add test',
    author: 'Edsger W. Dijkstra',
    url: 'test url'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', token)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const addedBlog = response.body


  expect(addedBlog.likes).toBe(0)
})

test('title and url is required', async () => {
  const response = await api.post('/api/login').send({
    username: 'root',
    name: 'Superuser',
    password: 'salainen'
  })

  const token = response.body.token

  let newBlog = {
    title: 'test title',
    author: 'Edsger W. Dijkstra',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', token)
    .expect(400)

  newBlog = {
    url: 'test url',
    author: 'Edsger W. Dijkstra',
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .set('Authorization', token)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const response = await api.post('/api/login').send({
    username: 'root',
    name: 'Superuser',
    password: 'salainen'
  })

  const token = response.body.token

  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', token)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length - 1
  )

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).not.toContain(blogToDelete.title)
})

test('a blog can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const response = await api.put(`/api/blogs/${blogToUpdate.id}`).send({ ...blogToUpdate, likes: blogToUpdate.likes + 1 }).expect(200)
    .expect('Content-Type', /application\/json/)

  const updatedBlog = response.body

  expect(updatedBlog.likes).toBe(blogToUpdate.likes + 1)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'Superuser', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
})