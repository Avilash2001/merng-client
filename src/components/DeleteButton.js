import React, { useState } from "react";
import { Icon, Confirm, Button } from "semantic-ui-react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { FETCH_POSTS_QUERY } from "../util/graphql";
import MyPopup from "../util/MyPopup";

function DeleteButton(props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const mutation = props.commentId ? DELETE_COMMENT : DELETE_POST;

  const [deletePostOrComment] = useMutation(mutation, {
    update(proxy) {
      setConfirmOpen(false);
      if (!props.commentId) {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY,
        });
        let newData = [...data.getPosts];
        newData = newData.filter((p) => p.id !== props.postId);
        proxy.writeQuery({
          query: FETCH_POSTS_QUERY,
          data: {
            ...data,
            getPosts: {
              newData,
            },
          },
        });
      }

      if (props.callback) props.callback();
    },
    variables: {
      postId: props.postId,
      commentId: props.commentId,
    },
  });

  return (
    <>
      <MyPopup content={props.commentId ? "Delete Comment" : "Delete Post"}>
        <Button
          as="div"
          color="red"
          floated="right"
          onClick={() => setConfirmOpen(true)}
        >
          <Icon name="trash" style={{ margin: 0 }} />
        </Button>
      </MyPopup>

      <Confirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deletePostOrComment}
      />
    </>
  );
}

const DELETE_POST = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

const DELETE_COMMENT = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      comments {
        id
        username
        createdAt
        body
      }
      commentCount
    }
  }
`;

export default DeleteButton;
