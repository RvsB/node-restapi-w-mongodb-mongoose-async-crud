const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
});

//here the mongoose.model method is used to create a data model for the schema provided, this is done so that we can use our schema by converting it into a model we can work with.
//by default mongoose when it creates this model will set the name provided to lowercase and pluralize the name and search for the resulting name in mongodp as a collection
//Mongoose automatically looks for the plural, lowercased version of your model name.
module.exports = mongoose.model("Employee", employeeSchema);
