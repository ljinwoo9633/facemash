const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    like: {
        type: Number,
        default: 0
    },
    gender: {
        type: String,
        required: true
    },
    follow: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    follow_number: {
        type: Number,
        default: 0
    },
    follower: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    follower_number:{
        type: Number,
        default: 0
    },
    ranking: {
        type: Number,
        default: 0
    },
    description_exists: {
        type: Boolean,
        default: false
    },
    description: [
        {
            type: String
        }
    ],
    main_image_filename: {
        type: String
    },
    main_image_filename_exists: {
        type: Boolean,
        default: false
    },
    main_image_id: {
        type: mongoose.Schema.Types.ObjectId
    }
})

module.exports = mongoose.model('User', UserSchema);