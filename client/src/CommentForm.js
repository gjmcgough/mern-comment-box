import React from 'react';
import PropTypes from 'prop-types';

const CommentForm = props => (
  <form onSubmit={props.submitComment}>
    <div className="textContent">
      <h4>What is your name?</h4>
      <input
        type="text"
        name="author"
        placeholder="Your name..."
        value={props.author}
        onChange={props.handleChangeText}
      />
      <h4>Please provide a brief description of your issue.</h4>
      <input
        type="text"
        name="text"
        placeholder="Say Something..."
        value={props.text}
        onChange={props.handleChangeText}
        className="short-description"
      />
      <button type="submit">Submit</button>
    </div>
  </form>
);

CommentForm.propTypes = {
  // submitComment: PropTypes.func.isRequired,
  handleChangeText: PropTypes.func.isRequired,
  text: PropTypes.string,
  author: PropTypes.string,
};

CommentForm.defaultProps = {
  text: '',
  author: '',
};

export default CommentForm;
