// CommentBox.js
import React, { Component } from 'react';
import 'whatwg-fetch';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import './CommentBox.css';

class CommentBox extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      author: '',
      comment: '',
      updateId: null,
    };
    this.pollInterval = null;
  }

  componentDidMount() {
    this.loadCommentsFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadCommentsFromServer, 10000);
    }
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  onUpdateComment = (id) => {
    const oldComment = this.state.data.find(c => c._id === id);
    if (!oldComment) return;
    this.setState({ author: oldComment.author, text: oldComment.text, updateId: id });
  }

  onDeleteComment = (id) => {
    const i = this.state.data.findIndex(c => c._id === id);
    const data = [
      ...this.state.data.slice(0, i),
      ...this.state.data.slice(i + 1),
    ];
    this.setState({ data });
    fetch(`api/comments/${id}`, { method: 'DELETE' })
      .then(res => res.json()).then((res) => {
        if (!res.success) this.setState({ error: res.error });
      });
  }

  submitComment = (e) => {
    e.preventDefault();
    const { author, text, updateId } = this.state;
    if (!author || !text) return;
    if (updateId) {
      this.submitUpdatedComment();
    } else {
      this.submitNewComment();
    }
  }

  submitNewComment = () => {
    const { author, text } = this.state;
    const data = [...this.state.data, { author, text, _id: Date.now().toString() }];
    console.log(data);
    this.setState({ data });
    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) {
        this.setState({ error: res.error.message || res.error });
      }
      else {
        this.updateServiceNow();
      }
    });
  }

  updateServiceNow = () => {
    const { author, text } = this.state;
    // console.log(text);
    var requestBody = JSON.stringify({
      short_description: text,
      caller_id: author,
     });

    this.setState({ author: '', text: '', error: null });
    // var client=new XMLHttpRequest();
    // client.open("put","https://gregmcg.service-now.com/api/now/table/incident/6d4342fcdba2d300f4917bfdae9619ca");
    //
    // client.setRequestHeader('Accept','application/json');
    // client.setRequestHeader('Content-Type','application/json');
    //
    // //Eg. UserName="admin", Password="admin" for this code sample.
    // client.setRequestHeader('Authorization', 'Basic '+btoa('admin'+':'+'admin'));
    //
    // // client.onreadystatechange = function() {
    // // 	if(this.readyState == this.DONE) {
    // // 		document.getElementById("response").innerHTML=this.status + this.response;
    // // 	}
    // // };
    // client.send(requestBody);


    var client=new XMLHttpRequest();
    client.open("post","https://gregmcg.service-now.com/api/now/table/incident?sysparm_display_value=true&sysparm_fields=number%2Ccaller_id%2Cshort_description%2Cpriority&sysparm_input_display_value=true");

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
  }



  submitUpdatedComment = () => {
    const { author, text, updateId } = this.state;
    fetch(`/api/comments/${updateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ author: '', text: '', updateId: null });
    });
  }

  loadCommentsFromServer = () => {
    // fetch returns a promise. If you are not familiar with promises, see
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    // fetch("https://gregmcg.service-now.com/api/now/table/incident?sysparm_query=caller_id%3D5137153cc611227c000bbd1bd8cd2005&sysparm_fields=caller_id%2Cnumber%2Cpriority%2Cshort_description&sysparm_limit=1")
    //   .then(data => data.json())
    //   .then((res) => {
    //     // if (!res.success) this.setState({ error: res.error });
    //     this.setState({ data: res.data });
    //   });


      var myHeaders = new Headers();

      myHeaders.append('Accept','application/json');
      myHeaders.append('Content-Type','application/json');
      myHeaders.append('Authorization', 'Basic '+btoa('admin'+':'+'admin'));

      var myInit = { method: 'GET',
                     headers: myHeaders,
                     mode: 'cors',
                     cache: 'default' };

      var myRequest = new Request("https://gregmcg.service-now.com/api/now/table/incident?sysparm_query=sys_created_on%3E%3Djavascript%3Ags.dateGenerate('2018-11-07'%2C'15%3A10%3A00')&sysparm_display_value=true&sysparm_fields=number%2Ccaller_id%2Cshort_description%2Cpriority&sysparm_limit=10", myInit);

      fetch(myRequest)
        .then(data => data.json())
          .then((res) => {
            // if (!res.success) this.setState({ error: res.error });
            console.log(res.result);
            var input = res.result;
            var output = Object.keys(input).map(function(key) {
              return {
                author: input[key].caller_id.display_value,
                short_description: input[key].short_description,
                number: input[key].number
              };
            });
            console.log(output);
            this.setState({ data: output });
          });


    // var requestBody = "";
    // // var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    // var client=new XMLHttpRequest();
    // client.open("get",);
    //
    // client.setRequestHeader('Accept','application/json');
    // client.setRequestHeader('Content-Type','application/json');
    //
    // //Eg. UserName="admin", Password="admin" for this code sample.
    // client.setRequestHeader('Authorization', 'Basic '+btoa('admin'+':'+'admin'));
    //
    // // client.onreadystatechange = function() {
    // // 	if(this.readyState == this.DONE) {
    // // 		document.getElementById("response").innerHTML=this.status + this.response;
    // // 	}
    // // };
    //
    // client.send()
  };

  render() {
    return (
      <div className="container">
        <div className="comments">
          <h2>Incidents created:</h2>
          <CommentList
            data={this.state.data}
            handleDeleteComment={this.onDeleteComment}
            handleUpdateComment={this.onUpdateComment}
          />
        </div>
        <div className="form">
          <CommentForm
            author={this.state.author}
            text={this.state.text}
            handleChangeText={this.onChangeText}
            submitComment={this.submitComment}
          />
        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

export default CommentBox;
