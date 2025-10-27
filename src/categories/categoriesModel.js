const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const categorySchema = new Schema({
    __id: ObjectId,
    slug: String,
    name: String,
    url: String,
    date: String,
    author: String,
    description: String,
    parent: String,
}, { collection: 'categories' });


module.exports = mongoose.model( 'category', categorySchema );