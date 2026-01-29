const mongoose = require('mongoose');

mongoose.connect(
  'mongodb+srv://varunjamwal933_db_user:8t1rSdhKiRLtO3du@cluster0.wkpsrs7.mongodb.net/test?retryWrites=true&w=majority'
)
.then(() => console.log("DB Connected"))
.catch(err => console.log("DB Connection Error:", err));
