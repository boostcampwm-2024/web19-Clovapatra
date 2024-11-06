const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('This is voice processing Server!');
});

app.listen(8002, () => {
    console.log('Server is running on port 8001');
});
