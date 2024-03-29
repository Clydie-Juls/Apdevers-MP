import Header from "@/components/custom/header";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AnimBackground from "@/components/custom/animBackground";
import PostBody from "@/components/custom/postBody";
import CommentBody from "@/components/custom/commentBody";
import PostHeader from "@/components/custom/postHeader";
import { Account } from "@/lib/Account";
import { useParams } from "react-router";
import { fetchWithTokenRefresh } from "@/lib/authFetch";

const DISPLAY_COUNT = 10;

const Post = () => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [whatToDelete, setWhatToDelete] = useState();
  const [account, setAccount] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [poster, setPoster] = useState(null);
  const { id } = useParams();
  const [idOfCommentToDelete, setIdOfCommentToDelete] = useState(null);
  const [rateButtonTrigger, setRateButtonTrigger] = useState(false);

  const [page, setPage] = useState(0);
  const maxPages = useMemo(
    () => Math.ceil(comments.length / DISPLAY_COUNT),
    [comments]
  );

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const { response, data } = await fetchWithTokenRefresh(() =>
          fetch(`/api/posts/${id}`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
          })
        );
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const postData = data;
        console.log("post data:", postData);
        setPost(postData);

        const posterInfo = await fetchUserById(postData.post.posterId);
        setPoster(posterInfo);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    const fetchCommentsData = async () => {
      try {
        const { response, data } = await fetchWithTokenRefresh(() =>
          fetch(`/api/posts/${id}/comments`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
            },
          })
        );

        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const commentsData = data;
        console.log("comment data:", commentsData);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    const checkLoginStatus = async () => {
      const isLoggedIn = await Account.isLoggedIn();
      if (!isLoggedIn) {
        setAccount(null);
        return;
      }

      const accountDetails = await Account.getDetails();
      setAccount(accountDetails);
    };

    fetchPostData();
    fetchCommentsData();
    checkLoginStatus();
  }, [id, rateButtonTrigger]);

  const fetchUserById = async (userId) => {
    try {
      console.log("Fetching user with ID:", userId);
      const { response, data } = await fetchWithTokenRefresh(() =>
        fetch(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        })
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const userData = data;
      console.log("User fetched successfully:", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const handleDelete = async () => {
    if (whatToDelete === "post") {
      await fetch(`/api/posts/${id}`, {
        method: "delete",
      });

      setConfirmDelete(false);
      location.replace(`/`);
    } else {
      await fetch(`/api/comments/${idOfCommentToDelete}`, {
        method: "delete",
      });
      setIdOfCommentToDelete(null);

      setConfirmDelete(false);
      location.replace(`/post/${id}`);
    }
  };

  function gotoPrevPage() {
    setPage((p) => Math.max(0, p - 1));
  }

  function gotoNextPage() {
    setPage((p) => Math.min(p + 1, maxPages - 1));
  }

  function gotoPage(pageIndex) {
    setPage(pageIndex);
  }

  const onPostLikeClick = async () => {
    const { response, data } = await fetchWithTokenRefresh(() =>
      fetch(`/api/posts/like/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      })
    );

    if (!response.ok) {
      const errorMessage = data;
      throw new Error(errorMessage || "Like failed");
    }
    console.log("Liked");
    setRateButtonTrigger(!rateButtonTrigger);
  };

  const onPostDislikeClick = async () => {
    const { response, data } = await fetchWithTokenRefresh(() =>
      fetch(`/api/posts/dislike/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      })
    );

    if (!response.ok) {
      const errorMessage = data;
      throw new Error(errorMessage || "Like failed");
    }
    console.log("disLiked");
    setRateButtonTrigger(!rateButtonTrigger);
  };

  const onCommentLikeClick = async (id) => {
    const { response, data } = await fetchWithTokenRefresh(() =>
      fetch(`/api/comments/like/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      })
    );
    if (!response.ok) {
      const errorMessage = data;
      throw new Error(errorMessage || "Like failed");
    }
    console.log("Liked");
    setRateButtonTrigger(!rateButtonTrigger);
  };

  const onCommentDislikeClick = async (id) => {
    const { response, data } = await fetchWithTokenRefresh(() =>
      fetch(`/api/comments/dislike/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
      })
    );

    if (!response.ok) {
      const errorMessage = data;
      throw new Error(errorMessage || "Dislike failed");
    }
    console.log("Disliked");
    setRateButtonTrigger(!rateButtonTrigger);
  };

  console.log("fdfefffe", { post, poster, comments });
  return (
    <AnimBackground className="h-screen bg-background flex flex-col">
      <Header />

      <div className="px-16 py-5">
        {post && poster && (
          <>
            <PostHeader
              title={post?.post.title}
              posterId={poster?.user._id}
              profile={poster?.user.picture}
              userName={poster?.user.username}
            />
            <PostBody
              id={post.post._id}
              accountId={account?._id}
              tags={post.post.tags}
              paragraph={post.post.body}
              numComments={comments.length}
              likerIds={post.post.reactions.likerIds}
              dislikerIds={post.post.reactions.dislikerIds}
              onLikeClick={onPostLikeClick}
              onDislikeClick={onPostDislikeClick}
              onDeleteButtonClick={() => {
                setConfirmDelete(true);
                setWhatToDelete("post");
              }}
            />

            {comments
              .slice(page * DISPLAY_COUNT, page * DISPLAY_COUNT + DISPLAY_COUNT)
              .map((comment) => {
                const isReply = comment.commentRepliedToId;
                if (isReply) {
                  return (
                    <CommentBody
                      id={comment._id}
                      key={comment._id}
                      postId={comment.postId}
                      posterId={comment.commenterId._id}
                      profile={comment.commenterId.picture}
                      userName={comment.commenterId.username}
                      paragraph={comment.body}
                      isOwner={comment.commenterId._id === account?._id}
                      ownerId={account?._id}
                      isReply={isReply}
                      onDeleteBtnClick={() => {
                        setConfirmDelete(true);
                        setWhatToDelete("comment");
                        setIdOfCommentToDelete(comment._id);
                      }}
                      nestedUserName={
                        comment.commentRepliedToId.commenterId.username
                      }
                      nestedProfile={
                        comment.commentRepliedToId.commenterId.picture
                      }
                      nestedParagraph={comment.commentRepliedToId.body}
                      likes={comment.reactions.likerIds}
                      dislikes={comment.reactions.dislikerIds}
                      onLikeClick={() => onCommentLikeClick(comment._id)}
                      onDislikeClick={() => onCommentDislikeClick(comment._id)}
                    />
                  );
                } else {
                  return (
                    <CommentBody
                      id={comment._id}
                      key={comment._id}
                      postId={comment.postId}
                      posterId={comment.commenterId._id}
                      profile={comment.commenterId.picture}
                      userName={comment.commenterId.username}
                      paragraph={comment.body}
                      isOwner={comment.commenterId._id === account?._id}
                      ownerId={account?._id}
                      isReply={isReply}
                      onDeleteBtnClick={() => {
                        setConfirmDelete(true);
                        setWhatToDelete("comment");
                        setIdOfCommentToDelete(comment._id);
                      }}
                      likes={comment.reactions.likerIds}
                      dislikes={comment.reactions.dislikerIds}
                      onLikeClick={() => onCommentLikeClick(comment._id)}
                      onDislikeClick={() => onCommentDislikeClick(comment._id)}
                    />
                  );
                }
              })}
          </>
        )}

        {/* Confirmation prompt */}
        {confirmDelete && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center">
            <div className="bg-black text-white border border-border p-8 rounded-lg">
              <p className="text-lg font-bold mb-4">Confirm Deletion</p>
              <p className="mb-4">
                Are you sure you want to delete this {whatToDelete}?
              </p>
              <div className="flex justify-between">
                <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button onClick={handleDelete} variant="destructive">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {maxPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={gotoPrevPage} />
              </PaginationItem>

              {[...Array(maxPages)].map((_, i) => (
                <PaginationLink key={i} onClick={() => gotoPage(i)}>
                  {i + 1}
                </PaginationLink>
              ))}

              <PaginationItem>
                <PaginationNext onClick={gotoNextPage} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AnimBackground>
  );
};

export default Post;
