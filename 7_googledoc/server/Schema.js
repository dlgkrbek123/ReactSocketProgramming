const { Schema, model } = require('mongoose');

const googleDocSchema = new Schema({
  _id: String,
  data: Object,
});

module.exports = model('GoogleDocs', googleDocSchema);
