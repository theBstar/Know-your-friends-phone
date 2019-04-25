const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');

const app = express();
const { Schema } = mongoose;
const DBURL = 'mongodb://root:toor123@ds163984.mlab.com:63984/project_newpane';
const PORT = process.env.PORT || 3000;

const writeToConsole = (msg) => {
  process.stdout.write(`${msg} \n`);
};

mongoose.connect(DBURL, { useNewUrlParser: true }, (err) => {
  if (err) {
    writeToConsole(`\nCould not establish database connection \nError: ${err.message}\n`);
    throw new Error('Could not connect to database');
  }
});

const personDataSchema = new Schema({
  name: String,
  redirectURL: String,
  visitedDate: String,
  device: String,
});

const PersonData = mongoose.model('PersonData', personDataSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './views')));


app.get('/secret', (req, res) => {
  writeToConsole('Get request on /secret');
  res.sendFile(path.join(__dirname, './views/index.html'));
});

app.get('/personData', async (req, res) => {
  writeToConsole('Get request on /personData');
  const data = await PersonData.find({}).select({
    _id: 0, name: 1, visitedDate: 1, device: 1,
  }).exec();
  res.json(data);
});

app.post('/personData', (req, res) => {
  writeToConsole('Post request on /getPersonData');
  const { name, url } = req.body;
  const newData = new PersonData({
    name,
    redirectURL: url,
  });

  newData.save((err, doc) => {
    if (err) {
      res.json({
        success: null,
      });
    } else {
      res.json({
        success: 'OK',
        name,
        // eslint-disable-next-line no-underscore-dangle
        id: doc._id,
      });
    }
  });
});

app.get('/share/:id', async (req, res) => {
  const { id } = req.params;
  const userData = await PersonData.findById({ _id: id }).select({
    _id: 0, redirectURL: 1,
  });
  const redirectTo = userData && userData.redirectURL;
  writeToConsole(`get on share with id: ${redirectTo}`);
  if (redirectTo) {
    res.redirect(redirectTo);
  }
  const userAgent = req.headers['user-agent'];
  const device = userAgent.slice(userAgent.indexOf('(') + 1, userAgent.indexOf(')'));
  await PersonData.updateOne({ _id: id }, {
    $set: { visitedDate: new Date(), device },
  });
});

app.listen(PORT, () => {
  writeToConsole(`The server has started on port ${PORT}`);
  setInterval(() => {
    writeToConsole(`Server running: ${new Date()}`);
    try {
      http.get('https://amazingzing41.herokuapp.com/secret');
    } catch (e) {
      writeToConsole('Erro occured while making http request for keeping the app alive!');
    }
  }, 1200000);
});
