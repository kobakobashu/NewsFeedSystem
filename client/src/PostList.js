import React, { useState, useEffect } from "react";
import axios from "axios";
import CommentCreate from "./CommentCreate";
import CommentList from "./CommentList";

const PostList = () => {
  const [posts, setPosts] = useState({});
  const [editMode, setEditMode] = useState({});
  const [editedTitles, setEditedTitles] = useState({});

  const fetchPosts = async () => {
    const res = await axios.get("http://posts.com/posts");

    setPosts(res.data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEditClick = (postId) => {
    setEditMode((prevState) => ({
      ...prevState,
      [postId]: true,
    }));

    setEditedTitles((prevState) => ({
      ...prevState,
      [postId]: posts[postId].title,
    }));
  };

  const handleCompleteClick = async (postId, event) => {
    event.preventDefault();

    await axios.put(`http://posts.com/posts/modify/${postId}`, {
      title: editedTitles[postId],
    });

    setEditMode((prevState) => ({
      ...prevState,
      [postId]: false,
    }));

    fetchPosts();
  };

  const renderedPosts = Object.values(posts).map((post) => {
    return (
      <div
        className="card"
        style={{ width: "30%", marginBottom: "20px" }}
        key={post.id}
      >
        <div className="card-body">
          {editMode[post.id] ? (
            <div>
              <form onSubmit={(e) => handleCompleteClick(post.id, e)}>
                <input
                  type="text"
                  value={editedTitles[post.id]}
                  className="form-control"
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setEditedTitles((prevState) => ({
                      ...prevState,
                      [post.id]: newTitle,
                    }));
                  }}
                />
                <button className="btn btn-primary" type="submit">Rename</button>
              </form>
            </div>
          ) : (
            <div>
              <h3>{post.title}</h3>
              <button className="btn btn-primary" onClick={() => handleEditClick(post.id)}>Edit</button>
            </div>
          )}
          <CommentList comments={post.comments} />
          <CommentCreate postId={post.id} />
        </div>
      </div>
    );
  });

  return (
    <div className="d-flex flex-row flex-wrap justify-content-between">
      {renderedPosts}
    </div>
  );
};

export default PostList;
