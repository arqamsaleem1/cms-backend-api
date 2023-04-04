const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const postSchema = new Schema({
    __id: ObjectId,
    slug: String,
    title: String,
    url: String,
    date: String,
    author: String,
    content: String,
    status: String,
    visibility: String,
    categories: Object,
    featuredImage: Object,
});

module.exports = mongoose.model( 'post', postSchema );