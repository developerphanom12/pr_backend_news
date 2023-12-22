const express = require('express');
const app = express();
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const Admin = require('./routes/adminRoutes')
const creator = require('./routes/creatorRoutes')
const user = require('./routes/useroutes')
dotenv.config();

app.use(express.json()); 

app.use(cors({ origin: true })); 


const port = process.env.PORT || 3800;
const ipAddress = '127.0.0.1';


app.use('/api/admin', Admin)
app.use('/api/creator', creator)
app.use('/api/user', user) 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running on http://${ipAddress}:${port}`);
});
