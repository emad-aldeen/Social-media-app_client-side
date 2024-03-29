import React, { useState } from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { Button, Confirm, Icon } from 'semantic-ui-react';

import { FETCH_POSTS_QUERY } from '../util/graphql'
import MyPopups from '../util/MyPopups'

function DeleteButton({ postId, commentId, callback }){
    const [confirmOpen, setConfirmOpen] = useState(false);

    const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION

    const [deletePostOrMutation] = useMutation(mutation, {
        update(proxy){
            setConfirmOpen(false);

            if(!commentId){
            // TODO: remove post from cache
            const data = proxy.readQuery({
                query: FETCH_POSTS_QUERY
            });
            data.getPosts = data.getPosts.filter(p => p.id !== postId);
            proxy.writeQuery({ query: FETCH_POSTS_QUERY, data })
            }

            if(callback) callback();
        },
        variables: {
            postId,
            commentId
        }
    })

    return (
    <>
        <MyPopups content={commentId ? 'Delete comment' : 'Delete Post'}>
            <Button
                as='div'
                color='red'
                floated='right'
                onClick={() => setConfirmOpen(true)}
            >
                <Icon name='trash' style={{ margin: 0 }} />
            </Button>
        </MyPopups>
        <Confirm
            open={confirmOpen}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={deletePostOrMutation}
        />
    </>
    )
}

const DELETE_POST_MUTATION = gql`
    mutation deletePost($postId: ID!){
        deletePost(postId: $postId)
    }
`

const DELETE_COMMENT_MUTATION = gql`
    mutation deleteComment($postId: ID!, $commentId: ID!){
        deleteComment(postId: $postId, commentId: $commentId){
            id
            commentCount
            comments{
                id
                username
                body
            }
        }
    }
`

export default DeleteButton;