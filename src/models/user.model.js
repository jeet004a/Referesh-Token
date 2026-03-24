import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, 'Username is required'],
        unique: [true, 'Username already exists'],
    },
    email: {
        type: String,
        require: [true, 'Username is required'],
        unique: [true, 'Username already exists'],
    },
    password: {
        type: String,
        require: [true, 'Username is required'],
    }
})

const userModel = mongoose.model('User', userSchema)

export default userModel