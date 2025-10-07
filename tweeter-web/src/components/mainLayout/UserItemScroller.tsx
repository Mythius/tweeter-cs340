import React, { useRef } from "react";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { User } from "tweeter-shared";
import { useParams } from "react-router-dom";
import UserItem from "../userItem/UserItem";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import {
  UserItemPresenter,
  UserItemView,
} from "../../presenter/UserItemPresenter";

interface Props {
  featureUrl: string;
  presenterFactory: (listener: UserItemView) => UserItemPresenter;
}

const UserItemScroller: React.FC<Props> = ({
  featureUrl,
  presenterFactory,
}) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<User[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: UserItemView = {
    addItems: (newItems: User[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: displayErrorMessage,
  };

  const presenterRef = useRef<UserItemPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = presenterFactory(listener);
  }

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (
      authToken &&
      displayedUserAliasParam &&
      displayedUserAliasParam != displayedUser!.alias
    ) {
      presenterRef
        .current!.getUser(authToken!, displayedUserAliasParam!)
        .then((toUser) => {
          if (toUser) {
            setDisplayedUser(toUser);
          }
        });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenterRef.current!.reset();
  };

  const loadMoreItems = async () => {
    return presenterRef.current!.loadMoreItems(
      authToken!,
      displayedUser!.alias
    );
  };

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={() => loadMoreItems()}
        hasMore={presenterRef.current.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="row mb-3 mx-0 px-0 border rounded bg-white"
          >
            <UserItem user={item} featurePath={featureUrl} />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};
export default UserItemScroller;
