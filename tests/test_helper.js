const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'My Blog1',
    author: 'hexd',
    url: 'some url',
    likes: 1
  },
  {
    title: 'My Blog2',
    author: 'hexd',
    url: 'some url',
    likes: 10
  },
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'My Blog',
    author: 'hexd',
    url: 'some url',
    likes: 1
  } )
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb,usersInDb
}