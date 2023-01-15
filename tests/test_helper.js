const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}