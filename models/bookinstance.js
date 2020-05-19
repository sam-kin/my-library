let mongoose = require('mongoose');
let moment = require('moment');
let Schema = mongoose.Schema;

let BookinstancesSchema = new Schema (
    {
        book: {type: Schema.Types.ObjectId, ref: 'Book', required: true},
        imprint: {type: String, required: true},
        status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
        due_back: {type: Date, default: Date.now}
    }
);


//virtual for the bookinstances' URL
BookinstancesSchema
.virtual('url')
.get(function () {
    return '/catalog/bookinstance/' + this._id;
});

//virtual for formated due back date
BookinstancesSchema
.virtual('due_back_formated')
.get(function () {
    return moment(this.due_back).format('MMM Do, YYYY');
});

module.exports = mongoose.model('Bookinstance', BookinstancesSchema);