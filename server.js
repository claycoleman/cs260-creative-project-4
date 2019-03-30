const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// Configure multer so that it will upload to '/public/user-images'
const multer = require('multer');
const upload = multer({
  dest: './public/user-images/',
  limits: {
    fileSize: 10000000,
  },
});

app.use(express.static('public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/cp4-blog', {
  useNewUrlParser: true,
});

const authorSchema = new mongoose.Schema({
  name: String,
});

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  authorId: String,
  photoPath: String,
});

// Create models.
const Author = mongoose.model('Author', authorSchema);
const Post = mongoose.model('Post', postSchema);

// Get author
app.get('/api/author', async (req, res) => {
  try {
    let author = await Author.findById(req.query.authorId);
    console.log(author)
    res.send(author);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get or create author
app.post('/api/author', async (req, res) => {
  try {
    let author = await Author.findOne({ name: req.body.name });
    if (!author) {
      author = new Author({
        name: req.body.name,
      });
      author.save();
    }
    res.send(author);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    let filter = {};
    if (req.params.authorId) {
      filter.authorId = req.params.authorId;
    }

    let posts = await Post.find(filter);
    res.send(posts);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Create a new post
app.post('/api/posts', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    body: req.body.body,
    photoPath: req.body.photoPath,
  });
  try {
    await post.save();
    res.send(post);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Edit an post
app.put('/api/posts/:id', async (req, res) => {
  try {
    let post = await Post.findOne({ _id: req.params.id });
    post.title = req.body.title;
    post.body = req.body.body;
    if (req.params.editPhoto) {
      post.photoPath = req.params.photoPath;
    }
    await post.save();
    res.send({ post });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Delete an post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.send({ success: true });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Upload a photo.
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    photoPath: '/user-images/' + req.file.filename,
  });
});

app.listen(3000, () => console.log('Server listening on port 3000!'));
