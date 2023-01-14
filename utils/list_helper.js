const groupBy = require('lodash/groupBy')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((prev, cur) => {
    return prev + cur.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  let favoriteBlog = null

  blogs.forEach(blog => {
    if (!favoriteBlog || blog.likes > favoriteBlog.likes) {
      favoriteBlog = blog
    }
  })

  return favoriteBlog ? {
    title: favoriteBlog.title,
    author: favoriteBlog.author,
    likes: favoriteBlog.likes
  } : null
}

const prolificAuthor = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const blogGroups = groupBy(blogs, 'author')
  const prolificAuthor = {
    author: null,
    blogs: -1
  }
  for (const key in blogGroups) {
    if (Object.hasOwnProperty.call(blogGroups, key)) {
      const blogs = blogGroups[key].length
      if (blogs > prolificAuthor.blogs) {
        prolificAuthor.author = key
        prolificAuthor.blogs = blogs
      }
    }
  }
  return prolificAuthor
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const blogGroups = groupBy(blogs, 'author')
  const mostLikesAuthor = {
    author: null,
    likes: -1
  }
  for (const key in blogGroups) {
    if (Object.hasOwnProperty.call(blogGroups, key)) {
      const likes = (blogGroups[key]).reduce((prev, cur) => {
        return prev + cur.likes
      }, 0)
      if (likes > mostLikesAuthor.likes) {
        mostLikesAuthor.author = key
        mostLikesAuthor.likes = likes
      }
    }
  }
  return mostLikesAuthor
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  prolificAuthor,
  mostLikes
}