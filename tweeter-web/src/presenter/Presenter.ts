import { User } from "tweeter-shared";

export interface View {
  displayErrorMessage: (message: string) => void;
}

export interface MessageView extends View {
  displayInfoMessage: (
    message: string,
    duration: number,
    bootstrapClasses?: string | undefined
  ) => string;
  setDisplayedUser: (user: User) => void;
  deleteMessage: (messageId: string) => void;
}

export abstract class Presenter<V extends View> {
  protected constructor(private _view: V) {}
  protected doFailureReportingOperation = async (
    operation: () => Promise<void>,
    operationDescription: string
  ) => {
    try {
      await operation();
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to ${operationDescription} because of exception: ${error}`
      );
    }
  };
  get view(): V {
    return this.view;
  }
}
