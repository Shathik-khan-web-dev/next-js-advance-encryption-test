const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
});

// Prevent model overwrite error by checking if the model already exists
const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

module.exports = Category;
