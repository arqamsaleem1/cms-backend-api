const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
    __id: ObjectId,
    firstName: String,
    lastName: String,
    userName: String,
    email: String,
    date: String,
    passwrod: String,

}, { collection: 'users' });


module.exports = mongoose.model( 'user', userSchema );