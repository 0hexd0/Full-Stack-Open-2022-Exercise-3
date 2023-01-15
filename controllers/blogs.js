const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  if(!blog.likes) {
    blog.likes = 0
  }
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const { title,url, likes } = request.body
  const updatedBlog = await  Blog.findByIdAndUpdate(request.params.id,   { title,url,likes } , { new: true, runValidators: true, context: 'query' } )
  response.json(updatedBlog)
})

module.exports = blogsRouter