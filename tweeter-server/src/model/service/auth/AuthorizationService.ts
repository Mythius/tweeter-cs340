import { ISessionDAO } from "../../dao/interface/ISessionDAO";
import { IDAOFactory } from "../../dao/interface/IDAOFactory";

export class AuthorizationService {
  private sessionDAO: ISessionDAO;
  private readonly SESSION_EXPIRATION_HOURS = 24;

  constructor(daoFactory: IDAOFactory) {
    this.sessionDAO = daoFactory.createSessionDAO();
  }

  /**
   * Validates an authentication token and returns the associated user alias
   * @param token The authentication token to validate
   * @returns The user's alias if the token is valid
   * @throws Error with [unauthorized] prefix if token is invalid or expired
   */
  async validateToken(token: string): Promise<string> {
    if (!token || token.trim() === "") {
      throw new Error("[unauthorized] Missing authentication token");
    }

    const session = await this.sessionDAO.get(token);

    if (!session) {
      throw new Error("[unauthorized] Invalid or expired token");
    }

    // Check if session has expired (extra validation beyond DynamoDB TTL)
    const expirationTime = session.timestamp + this.SESSION_EXPIRATION_HOURS * 60 * 60 * 1000;
    if (Date.now() > expirationTime) {
      await this.sessionDAO.delete(token);
      throw new Error("[unauthorized] Token has expired");
    }

    return session.userAlias;
  }
}
