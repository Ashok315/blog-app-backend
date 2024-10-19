import mongoose from 'mongoose';

// database connection
const connectDB=async ()=>{
    try {
         const connectionDB= await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
         console.log(`MongoDB connected!! DB HOST: ${connectionDB.connection.host}`)
        
    } catch (error) {
        console.log('MongoDB Connection Failed',error)
        throw new Error(error.message)
    }
}

export default connectDB
