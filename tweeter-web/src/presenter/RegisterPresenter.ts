import { ChangeEvent } from "react";
import { UserService } from "../model.service/UserService";
import { Buffer } from "buffer";
import { User, AuthToken } from "tweeter-shared";
import { Presenter, View } from "./Presenter";

export interface RegisterView extends View {
  setImageUrl: (url: string) => unknown;
  setImageBytes: (bytes: Uint8Array) => unknown;
  setImageFileExtension: (fe: string) => unknown;
  setIsLoading: (loading: boolean) => unknown;
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  navigate: (url: string) => unknown;
}

export default class RegisterPresenter extends Presenter<RegisterView> {
  private userService: UserService = new UserService();
  public register = this.userService.register;
  handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    this.handleImageFile(file);
  };

  handleImageFile = (file: File | undefined) => {
    if (file) {
      this.view.setImageUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const imageStringBase64 = event.target?.result as string;

        // Remove unnecessary file metadata from the start of the string.
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1];

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this.view.setImageBytes(bytes);
      };
      reader.readAsDataURL(file);

      // Set image file extension (and move to a separate method)
      const fileExtension = this.getFileExtension(file);
      if (fileExtension) {
        this.view.setImageFileExtension(fileExtension);
      }
    } else {
      this.view.setImageUrl("");
      this.view.setImageBytes(new Uint8Array());
    }
  };

  getFileExtension = (file: File): string | undefined => {
    return file.name.split(".").pop();
  };

  doRegister = async (
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ) => {
    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);

      const [user, authToken] = await this.userService.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes,
        imageFileExtension
      );

      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.view.navigate(`/feed/${user.alias}`);
    }, "register user");
  };
}
