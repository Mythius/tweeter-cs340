import { useRef } from "react";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Status, User } from "tweeter-shared";
import { useParams } from "react-router-dom";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import {
  PagedItemPresenter,
  PagedItemView,
} from "../../presenter/PagedItemPresenter";
import { StatusService } from "../../model.service/StatusService";
import { FollowService } from "../../model.service/FollowService";
import { useUserNavigation } from "../appNavbar/UserNavigation";

type Item = User | Status;
type Service = StatusService | FollowService;

interface Props<ItemType extends Item, S extends Service> {
  url: string;
  presenterFactory: (
    listener: PagedItemView<ItemType>
  ) => PagedItemPresenter<ItemType, S>;
  componentFactory: (
    item: ItemType,
    url: string,
    navigate: (event: any) => Promise<void>
  ) => JSX.Element;
}

const ItemScroller = <ItemType extends Item, S extends Service>({
  url,
  presenterFactory,
  componentFactory,
}: Props<ItemType, S>) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<ItemType[]>([]);

  const { navigateToUser } = useUserNavigation(url);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PagedItemView<ItemType> = {
    addItems: (newItems: ItemType[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
    displayErrorMessage: displayErrorMessage,
  };

  const presenterRef = useRef<PagedItemPresenter<ItemType, S> | null>(null);
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
            {componentFactory(item, url, navigateToUser)}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ItemScroller;
