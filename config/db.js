const mongoose = require('mongoose');
const dbConnection = process.env.MONGO_URI

const connectionMethod = async () => {
    try {
        await mongoose.connect(dbConnection)
        console.log("Db connected")
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports ={ connectionMethod }