const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv').config();
const userRoute = require('./routes/userRoute')
const errorHandler = require('./middleware/errorMiddleware')
const cookieParser = require('cookie-parser');

const app = express();

// middlaware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
// routees middleware
app.use('/api/users', userRoute)

//  routes
app.get('/', (req, res) =>{
    res.send("Homepage")
});


// error middleware
app.use(errorHandler);



const PORT = process.env.PORT  || 4500;
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(PORT, () => {
        console.log(`server is runninng at ${PORT}`);
    })
})
.catch((err) => console.log(err))