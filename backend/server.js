// first we import our dependencies…
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { getSecret } from './secrets';
import Comment from './models/comment'

// and create our instances
const app = express();
const router = express.Router();

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;

mongoose.connect(getSecret('dbUri'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(logger('dev'));

// now we can set the route path & initialize the API
router.get('/', (req,res) => {
  res.json({message: 'Welcome to my first ServiceNow Integration!'});
});

router.get('/comments', (req, res) => {
  Comment.find((err, comments) => {
    if (err) return res.json({success: false, error: err });
    return res.json({success: true, data: comments});
    // console.log(data);
  });

  var requestBody = "";
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var client=new XMLHttpRequest();
  client.open("get","https://gregmcg.service-now.com/api/now/table/incident?sysparm_display_value=true&sysparm_fields=number%2Ccaller_id%2Cshort_description%2Cpriority&sysparm_limit=10");

  client.setRequestHeader('Accept','application/json');
  client.setRequestHeader('Content-Type','application/json');

  //Eg. UserName="admin", Password="admin" for this code sample.
  client.setRequestHeader('Authorization', 'Basic '+btoa('admin'+':'+'admin'));

  // client.onreadystatechange = function() {
  // 	if(this.readyState == this.DONE) {
  // 		document.getElementById("response").innerHTML=this.status + this.response;
  // 	}
  // };
  client.send(requestBody);
  return res;

});

router.post('/comments', (req, res) => {
  const comment = new Comment();
  // body parser lets us use the req.body
  const { author, text } = req.body;
  if (!author || !text) {
    return res.json({
      sucess: false,
      error: "You must provide an author and comment"
    });
  }
  comment.author = author;
  comment.text = text;
  comment.save(err=> {
    if(err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

router.put('/comments/:commentId', (req, res) => {
  const{commentId} = req.params;
  if (commentId){
    return res.json({success: false, error: "No comment id provided"});
  }
  Comment.findById(commentId, (error, comment) => {
      if (error) return res.json({success: false, error });
      const { author, text } = req.body;
      if (author) comment.author = author;
      if (text) comment.text = text;
      comment.save(error => {
          if (error) return res.json({success:false, error});
          return res.json({ success: true });
    });
  });
});

router.delete('/comments/:commentId', (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    return res.json({ success: false, error: 'No comment id provided' });
  }
  Comment.remove({ _id: commentId }, (error, comment) => {
    if (error) return res.json({ success: false, error });
    return res.json({ success: true });
  });
});

// Use our router configuration when we call /api
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
