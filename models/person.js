require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose
  .connect(url, { family: 4 })
  .then((result) => console.log('connected with MongoDB'))
  .catch((error) =>
    console.log('error while connecting with MongoDB:', error.message),
  )

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => /^\d{2,3}-\d{7,}$/.test(v),
      message: "Invalid phone number format" 
    },
    required: true
  }
})

personSchema.set('toJSON', {
  transform: ((document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  })
})

module.exports = mongoose.model('Person', personSchema)