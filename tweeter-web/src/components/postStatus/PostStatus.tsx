import "./PostStatus.css";
import { useRef, useState } from "react";
import { AuthToken, Status, User } from "tweeter-shared";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo } from "../userInfo/UserInfoHooks";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../presenter/PostStatusPresenter";

interface Props{
  presenter?: PostStatusPresenter;
}

const PostStatus = (props?: Props) => {
  const { deleteMessage, displayErrorMessage, displayInfoMessage } =
    useMessageActions();

  const { currentUser, authToken } = useUserInfo();
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const postStatusView: PostStatusView = {
    displayErrorMessage,
    setIsLoading: (v: boolean) => setIsLoading(v),
    setPost: (s: string) => setPost(s),
    displayInfoMessage,
    setDisplayedUser: (u: User) => {},
    deleteMessage,
  };

  const presenterRef = useRef<PostStatusPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props?.presenter ?? new PostStatusPresenter(postStatusView);
  }

  const submitPost = async (event: React.MouseEvent) => {
    event.preventDefault();
    presenterRef.current!.submitPost(authToken!,post,currentUser!);
  };

  const clearPost = (event: React.MouseEvent) => {
    event.preventDefault();
    setPost("");
  };

  const checkButtonStatus: () => boolean = () => {
    return !post.trim() || !authToken || !currentUser;
  };

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          aria-label="posttext"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => {
            setPost(event.target.value);
          }}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          className="btn btn-md btn-primary me-1"
          type="button"
          aria-label="poststatus"
          disabled={checkButtonStatus()}
          style={{ width: "8em" }}
          onClick={submitPost}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          className="btn btn-md btn-secondary"
          aria-label="clear"
          type="button"
          disabled={checkButtonStatus()}
          onClick={clearPost}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
