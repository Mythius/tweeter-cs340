import { Link, useNavigate, useNavigation } from "react-router-dom";
import { AuthToken, FakeData, Status, Type, User } from "tweeter-shared";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useUserNavigation } from "../appNavbar/UserNavigation";

interface Props {
  status: Status;
  featurePath: string;
}

const Post = (props: Props) => {
  const { navigateToUser } = useUserNavigation(props.featurePath);

  return (
    <>
      {props.status.segments.map((segment, index) =>
        segment.type === Type.alias ? (
          <Link
            key={index}
            to={`${props.featurePath}/${segment.text}`}
            onClick={navigateToUser}
          >
            {segment.text}
          </Link>
        ) : segment.type === Type.url ? (
          <a
            key={index}
            href={segment.text}
            target="_blank"
            rel="noopener noreferrer"
          >
            {segment.text}
          </a>
        ) : segment.type === Type.newline ? (
          <br key={index} />
        ) : (
          segment.text
        )
      )}
    </>
  );
};

export default Post;
