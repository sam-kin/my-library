let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BookSchema = new Schema(
    {
        title: {type: String, required: true},
        author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
        genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
        summary: {type: String, required: true},
        isbn: {type: String, required: true}
    }
);

//virtual for the book's URL
BookSchema
.virtual('url')
.get(function () {
    return '/catalog/book/' + this._id;
});

module.exports = mongoose.model('Book', BookSchema);