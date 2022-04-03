const express = require('express');
const morgan = require('morgan');
require('dotenv').config()
const { connectionMethod } = require('./config/db')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express();

// middlewares
app.use(cors());
app.use(express.json())
app.use(morgan('dev'))
app.use(cookieParser())
app.use('/auth/student', require('./routes/auth/studentsAuth'))
app.use('/student', require('./routes/student/studentRoutes'))
app.use('/assessment', require('./routes/student/studentRoutes'))

app.get('/', (req, res) => {
    res.send("Welcome to Home Route")
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
    connectionMethod()
})
