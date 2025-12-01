import { AuthToken, User, UserDto } from "tweeter-shared";
import * as bcrypt from "bcryptjs";
import { IDAOFactory } from "../../dao/interface/IDAOFactory";
import { DynamoDAOFactory } from "../../dao/factory/DynamoDAOFactory";
import { IUserDAO } from "../../dao/interface/IUserDAO";
import { ISessionDAO } from "../../dao/interface/ISessionDAO";
import { IS3DAO } from "../../dao/interface/IS3DAO";
import { AuthorizationService } from "../auth/AuthorizationService";

export class UserService {
    private userDAO: IUserDAO;
    private sessionDAO: ISessionDAO;
    private s3DAO: IS3DAO;
    private authService: AuthorizationService;

    constructor(daoFactory?: IDAOFactory) {
        const factory = daoFactory || DynamoDAOFactory.getInstance();
        this.userDAO = factory.createUserDAO();
        this.sessionDAO = factory.createSessionDAO();
        this.s3DAO = factory.createS3DAO();
        this.authService = new AuthorizationService(factory);
    }

    public async getUser(token: string, alias: string): Promise<UserDto | null> {
        // Validate token
        await this.authService.validateToken(token);

        // Get user from database
        const user = await this.userDAO.getByAlias(alias);
        return user ? user.dto : null;
    }

    public async register(
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        userImageBytes: string,
        imageFileExtension: string
    ): Promise<[UserDto, string]> {
        // Validate input
        if (!firstName || !lastName || !alias || !password || !userImageBytes) {
            throw new Error("[bad-request] All fields are required");
        }

        // Check if user already exists
        const existingUser = await this.userDAO.getByAlias(alias);
        if (existingUser) {
            throw new Error("[bad-request] User alias already exists");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Upload image to S3
        const imageUrl = await this.s3DAO.uploadImage(userImageBytes, imageFileExtension);

        // Create user
        const user = new User(firstName, lastName, alias, imageUrl);
        await this.userDAO.create(user, passwordHash);

        // Generate and store session
        const authToken = AuthToken.Generate();
        await this.sessionDAO.create(authToken.token, alias, authToken.timestamp);

        return [user.dto, authToken.token];
    }

    public async login(alias: string, password: string): Promise<[UserDto, string]> {
        // Validate input
        if (!alias || !password) {
            throw new Error("[bad-request] Alias and password are required");
        }

        // Get user with password
        const result = await this.userDAO.getUserWithPassword(alias);
        if (!result) {
            throw new Error("[unauthorized] Invalid credentials");
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(password, result.passwordHash);
        if (!isValidPassword) {
            throw new Error("[unauthorized] Invalid credentials");
        }

        // Generate and store session
        const authToken = AuthToken.Generate();
        await this.sessionDAO.create(authToken.token, alias, authToken.timestamp);

        return [result.user.dto, authToken.token];
    }

    public async logout(token: string): Promise<void> {
        // Validate token and delete session
        await this.authService.validateToken(token);
        await this.sessionDAO.delete(token);
    }
}
