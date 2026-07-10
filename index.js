const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.static('dist'))

app.use(express.json())

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

let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

const generateId = () => {
  return String(Math.floor(Math.random() * 1000000))
}

// Get requests handling
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const requestId = request.params.id

  const person = persons.find((p) => p.id === requestId)
  if (!person) {
    return response.status(404).end()
  }

  response.json(person)
})

app.get('/info', (request, response) => {
  const date = Date()
  const noOfContacts = persons.length

  response.send(
    `<p>Phonebook has info for ${noOfContacts} people</p> <p>${date}</p>`,
  )
})

//Delete requests
app.delete('/api/persons/:id', (request, response) => {
  const deleteRequestId = request.params.id

  persons = persons.filter((p) => p.id !== deleteRequestId)

  response.status(204).end()
})

//Post requests
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    })
  }

  const exist = persons.find(
    (p) => p.name.toLowerCase() === body.name.toLowerCase(),
  )
  if (exist) {
    return response.status(409).json({
      error: 'name must be unique',
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }
  persons = persons.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})
