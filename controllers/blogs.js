const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.user || !request.user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)
  if (blog.user.toString() === request.user.id) {
    const removedBlog =  await Blog.findByIdAndRemove(request.params.id)
    const user = await User.findById(removedBlog.user)
    user.blogs = user.blogs.filter(blog => blog.toString() !== request.params.id)
    await user.save()
    response.status(204).end()
  } else {
    return response.status(401).json({ error: 'invalid user' })
  }
})

blogsRouter.post('/', async (request, response) => {
  if (!request.user || !request.user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(request.user.id)
  const blog = new Blog({ ...request.body, user: user.id })

  if (!blog.likes) {
    blog.likes = 0
  }
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  if (!request.user || !request.user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const { title, url, likes } = request.body
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, { title, url, likes }, { new: true, runValidators: true, context: 'query' })
  response.json(updatedBlog)
})

module.exports = blogsRouter