const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  profilePicUrl: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['provider', 'customer'],
    required: true
  }

 

}, { timestamps: true });

 favorites:[{
    type: mongoose.Schema.Types.ObjectedId,
    ref: 'User',
    default:[]
  }]



module.exports = mongoose.model('User', userSchema);