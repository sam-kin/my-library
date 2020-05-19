let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let GenreSchema = new Schema(
    {
        name: {type: String, required: true, max: 100},
    }
);

//virtual for genre's URL
GenreSchema
.virtual('url')
.get(function () {
    return '/catalog/genre/' + this._id;
});

module.exports = mongoose.model('Genre', GenreSchema);