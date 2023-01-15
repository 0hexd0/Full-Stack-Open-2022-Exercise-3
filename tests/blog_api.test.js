const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog))
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

test('a valid blog can be added ', async () => {
  const newBlog = {
    title: 'add test',
    author: 'Edsger W. Dijkstra',
    likes: 50,
    url: 'test url'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
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
  const newBlog = {
    title: 'add test',
    author: 'Edsger W. Dijkstra',
    url: 'test url'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const addedBlog = response.body


  expect(addedBlog.likes).toBe(0)
})

test('title and url is required', async () => {
  let newBlog = {
    title: 'test title',
    author: 'Edsger W. Dijkstra',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  newBlog = {
    url: 'test url',
    author: 'Edsger W. Dijkstra',
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
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

afterAll(() => {
  mongoose.connection.close()
})