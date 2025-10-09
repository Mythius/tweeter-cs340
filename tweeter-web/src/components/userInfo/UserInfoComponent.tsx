import "./UserInfoComponent.css";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "./UserInfoHooks";
import { UserInfoPresenter, UserInfoView } from "./UserInfoPresenter";

const UserInfo = () => {
  const [isFollower, setIsFollower] = useState(false);
  const [followeeCount, setFolloweeCount] = useState(-1);
  const [followerCount, setFollowerCount] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const { displayErrorMessage, displayInfoMessage, deleteMessage } =
    useMessageActions();

  const { currentUser, authToken, displayedUser } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const navigate = useNavigate();
  const location = useLocation();

  const view: UserInfoView = {
    currentUser,
    displayedUser,
    displayErrorMessage,
    displayInfoMessage,
    deleteMessage,
    setDisplayedUser,
    authToken: authToken!,
  };

  const presenterRef = useRef<UserInfoPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = new UserInfoPresenter(view);
  }

  if (!displayedUser) {
    setDisplayedUser(currentUser!);
  }

  useEffect(() => {
    const loadData = async () => {
      if (authToken && currentUser && displayedUser) {
        try {
          setIsLoading(true);
          const [isFollowing, fCount, feCount] =
            await presenterRef.current!.initFollowData(
              authToken,
              displayedUser
            );
          setIsFollower(isFollowing);
          setFolloweeCount(feCount);
          setFollowerCount(fCount);
        } catch (e) {
          displayErrorMessage("Error Loading user info");
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [displayedUser]);

  const getBaseUrl = (): string => {
    const segments = location.pathname.split("/@");
    return segments.length > 1 ? segments[0] : "/";
  };

  const switchToLoggedInUser = (event: React.MouseEvent): void => {
    event.preventDefault();
    setDisplayedUser(currentUser!);
    navigate(`${getBaseUrl()}/${currentUser!.alias}`);
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const [newFollowerCount, newFolloweeCount] =
      await presenterRef.current!.followDisplayedUser(
        authToken!,
        displayedUser!
      );
    setFollowerCount(newFollowerCount);
    setFolloweeCount(newFolloweeCount);
    setIsFollower(true);
    setIsLoading(false);
  };

  const handleUnfollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const [newFollowerCount, newFolloweeCount] =
      await presenterRef.current!.unfollowDisplayedUser(
        authToken!,
        displayedUser!
      );
    setFollowerCount(newFollowerCount);
    setFolloweeCount(newFolloweeCount);
    setIsFollower(false);
    setIsLoading(false);
  };

  return (
    <>
      {currentUser === null || displayedUser === null || authToken === null ? (
        <></>
      ) : (
        <div className="container">
          <div className="row">
            <div className="col-auto p-3">
              <img
                src={displayedUser.imageUrl}
                className="img-fluid"
                width="100"
                alt="Posting user"
              />
            </div>
            <div className="col p-3">
              {!displayedUser.equals(currentUser) && (
                <p id="returnToLoggedInUser">
                  Return to{" "}
                  <Link
                    to={`./${currentUser.alias}`}
                    onClick={switchToLoggedInUser}
                  >
                    logged in user
                  </Link>
                </p>
              )}
              <h2>
                <b>{displayedUser.name}</b>
              </h2>
              <h3>{displayedUser.alias}</h3>
              <br />
              {followeeCount > -1 && followerCount > -1 && (
                <div>
                  Followees: {followeeCount} Followers: {followerCount}
                </div>
              )}
            </div>
            <form>
              {!displayedUser.equals(currentUser) && (
                <div className="form-group">
                  {isFollower ? (
                    <button
                      id="unFollowButton"
                      className="btn btn-md btn-secondary me-1"
                      type="submit"
                      style={{ width: "6em" }}
                      onClick={handleUnfollow}
                    >
                      {isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <div>Unfollow</div>
                      )}
                    </button>
                  ) : (
                    <button
                      id="followButton"
                      className="btn btn-md btn-primary me-1"
                      type="submit"
                      style={{ width: "6em" }}
                      onClick={handleFollow}
                    >
                      {isLoading ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      ) : (
                        <div>Follow</div>
                      )}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInfo;
