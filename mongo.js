const { urlencoded } = require('express')
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://learningfullstack:${password}@cluster0.lccvpum.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url, { family: 4 })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.map((p) => console.log(`${p.name} ${p.number}`))
    mongoose.connection.close()
  })
}

if (process.argv.length === 4) {
  console.log('name or number is missing in arguments')
  mongoose.connection.close()
}

if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })
  person.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}

if (process.argv.length > 5) {
  console.log('fatal wrong argument specification')
  mongoose.connection.close()
}
