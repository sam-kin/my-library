let mongoose = require('mongoose');
let moment = require('moment');
let Schema = mongoose.Schema;

let AuthorSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        last_name: {type: String, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date}
    }
);

//virtual of the author's name
AuthorSchema
.virtual('name')
.get(function () {
    let fullName;

    if (this.first_name && this.last_name) {
        fullName = this.first_name + ', ' + this.last_name;
    }
    if (!this.first_name || !this.last_name) {
        fullName = '';
    }

    return fullName;
});

//virtual of the author's lifespan
AuthorSchema
.virtual('lifspan')
.get(function () {
    return (this.date_of_birth.getYear() - this.date_of_death.getYear());
});

// virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
    return '/catalog/author/' + this._id;
});

//virtual for date of birth
AuthorSchema
.virtual('formated_date_of_birth')
.get(function () {
    return moment(this.date_of_birth).format('MMM Do, YYYY');
});

//virtual for date of death
AuthorSchema
.virtual('formated_date_of_death')
.get(function () {
    return this.date_of_death !== null? moment(this.date_of_death).format('MMM Do, YYYY') : null;
});

AuthorSchema
.virtual('date_of_birth_reformated')
.get(function () {
    return moment(this.date_of_birth).format('YYYY-MM-DD');
});

module.exports = mongoose.model('Author', AuthorSchema);