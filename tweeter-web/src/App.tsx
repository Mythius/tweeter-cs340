import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import UserItemScroller from "./components/mainLayout/UserItemScroller";
import StatusItemScroller from "./components/mainLayout/StatusItemScroller";
import { useUserInfo } from "./components/userInfo/UserInfoHooks";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import AppPresenter from "./presenter/AppPresenter";
import { useRef } from "react";
import { FeedItemPresenter } from "./presenter/FeedItemPresenter";
import { StoryItemPresenter } from "./presenter/StoryItemPresenter";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import { Status, User } from "tweeter-shared";
import ItemScroller from "./components/mainLayout/ItemScroller";
import StatusItem from "./components/statusItem/StatusItem";
import { useUserNavigation } from "./components/appNavbar/UserNavigation";
import UserItem from "./components/userItem/UserItem";
import { StatusService } from "./model.service/StatusService";
import { FollowService } from "./model.service/FollowService";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();
  const appPresenter = useRef<AppPresenter | null>(null);
  if (!appPresenter.current) {
    appPresenter.current = new AppPresenter();
  }

  function statusComponentFactory(
    item: Status,
    url: string,
    navigate: (event: any) => Promise<void>
  ) {
    return <StatusItem item={item} navigateToUser={navigate} />;
  }

  function userComponentFactory(item: User, url: string) {
    return <UserItem user={item} featurePath={url} />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
        <Route
          path="feed/:displayedUser"
          element={
            // <StatusItemScroller
            //   key={`feed-${displayedUser!.alias}`}
            //   url="/feed"
            //   presenterFactory={(view: PagedItemView<Status>) =>
            //     new FeedItemPresenter(view)
            //   }
            // />
            <ItemScroller<Status, StatusService>
              key={`feed-${displayedUser!.alias}`}
              url="/feed"
              presenterFactory={(view: PagedItemView<Status>) =>
                new FeedItemPresenter(view)
              }
              componentFactory={statusComponentFactory}
            ></ItemScroller>
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller<Status, StatusService>
              key={`story-${displayedUser!.alias}`}
              url="/story"
              presenterFactory={(view: PagedItemView<Status>) =>
                new StoryItemPresenter(view)
              }
              componentFactory={statusComponentFactory}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller<User, FollowService>
              key={`followees-${displayedUser!.alias}`}
              url="/followees"
              presenterFactory={(view: PagedItemView<User>) =>
                new FolloweePresenter(view)
              }
              componentFactory={userComponentFactory}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller<User, FollowService>
              key={`followers-${displayedUser!.alias}`}
              url="/followers"
              presenterFactory={(view: PagedItemView<User>) =>
                new FollowerPresenter(view)
              }
              componentFactory={userComponentFactory}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
