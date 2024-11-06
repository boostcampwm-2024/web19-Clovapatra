const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('This is signaling Server!');
});

app.listen(8001, () => {
    console.log('Server is running on port 8001');
});
