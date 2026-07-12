const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(express.static('dist'))

// custom middleware
app.use((request, response, next) => {
  const originalSend = response.send

  response.send = function (body) {
    response.locals.toResponseBody = body
    return originalSend.call(this, body)
  }
  next()
})
morgan.token('response-body', (request, response) => {
  const body = response.locals.toResponseBody

  if (typeof body === 'object') {
    return JSON.stringify(body)
  }

  return body
})
app.use(morgan(':method :url :status :response-time ms :response-body'))

// Get requests handling
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => response.json(persons))
    .catch((error) => next(error))
})

//Get request for a specific person obj/document through id
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).json({ error: 'Person Not Found' })
      }
      response.json(person)
    })
    .catch((error) => next(error))
})

//Get request on a info endpoint for a specific response
app.get('/info', (request, response, next) => {
  const date = Date()
  Person.countDocuments({})
    .then((noOfPersons) => {
      response.send(
        `<p>Phonebook has info for ${noOfPersons} people</p> <p>${date}</p>`,
      )
    })
    .catch((error) => next(error))
})

//Delete request for deleting specific person document from db
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((deletedPerson) => response.status(204).end())
    .catch((error) => next(error))
})

//Post request to people/persons collections
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

//Put request to update the number of already present name
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { $set: { number } },
    { new: true, runValidators: true },
  )
    .then((updatedPerson) => response.json(updatedPerson))
    .catch((error) => next(error))
})

//Unknown endpoint middleware defination
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

//Error handler for all catches
const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformated id' })
  } else if (error.name === 'ValidationError') {
    return response.status(404).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})
