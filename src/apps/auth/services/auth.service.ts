import { OTPService } from '.';
import {
  ErrorResponse,
  ErrorResponseType,
  JwtService,
  MailServiceUtilities,
  SuccessResponseType,
} from '../../../common/shared';
import { config } from '../../../core/config';
import { EntityService, IEntityModel } from '../../actions';
import { IUserModel, UserService } from '../../actions/users';
import { IOTPModel } from '../types';

class AuthService {
  async register(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const {
        entityChoice,
        existingEntity,
        newEntity,
        firstname,
        lastname,
        email,
        password,
      } = payload;

      // Vérification si l'utilisateur existe déjà
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;
      if (userResponse.success && userResponse.document) {
        throw new ErrorResponse(
          'UNIQUE_FIELD_ERROR',
          'The entered email is already registered.',
        );
      }

      let entityId;

      if (entityChoice === 'join') {
        const entityResponse = (await EntityService.findOne({
          slug: existingEntity,
        })) as SuccessResponseType<IEntityModel>;
        if (!entityResponse.success || !entityResponse.document) {
          throw new ErrorResponse(
            'NOT_FOUND_ERROR',
            'Selected organization not found.',
          );
        }

        if (!entityResponse.document.active) {
          throw new ErrorResponse(
            'INACTIVE_ENTITY_ERROR',
            "The selected organization is inactive. If you are it's owner, please contact the administrator.",
          );
        }

        entityId = entityResponse.document._id;
      } else if (entityChoice === 'create') {
        const entityCreationResponse = (await EntityService.create({
          name: newEntity,
        })) as SuccessResponseType<IEntityModel>;
        if (
          !entityCreationResponse.success ||
          !entityCreationResponse.document
        ) {
          throw new ErrorResponse(
            'ENTITY_CREATION_ERROR',
            'Failed to create a new organization.',
          );
        }

        entityId = entityCreationResponse.document._id;
      } else {
        throw new ErrorResponse(
          'INVALID_ENTITY_CHOICE',
          'Invalid entity choice.',
        );
      }

      const createUserResponse = (await UserService.create({
        firstname,
        lastname,
        email,
        password,
        entity: entityId,
      })) as SuccessResponseType<IUserModel>;

      if (!createUserResponse.success || !createUserResponse.document) {
        throw new ErrorResponse(
          'USER_CREATION_ERROR',
          'Failed to create user.',
        );
      }

      await MailServiceUtilities.sendAccountCreationEmail({
        to: email,
        firstname: createUserResponse.document.firstname,
      });

      return {
        success: true,
        document: {
          user: createUserResponse.document,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async verifyAccount(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      if (userResponse.document.verified) {
        return { success: true };
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.ACCOUNT_VERIFICATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const verifyUserResponse = await UserService.markAsVerified(email);

      if (!verifyUserResponse.success) {
        throw verifyUserResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async generateLoginOtp(
    email: string,
  ): Promise<SuccessResponseType<IOTPModel> | ErrorResponseType> {
    try {
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;

      // This should not be done because verify comes now after login
      // if (!user.verified) {
      //   throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      // }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const otpResponse = await OTPService.generate(
        email,
        config.otp.purposes.LOGIN_CONFIRMATION.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      return otpResponse;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async loginWithPassword(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, password } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      const user = userResponse.document;
      const isValidPasswordResponse = (await UserService.isValidPassword(
        user.id,
        password,
      )) as SuccessResponseType<{ isValid: boolean }>;

      if (
        !isValidPasswordResponse.success ||
        !isValidPasswordResponse.document?.isValid
      ) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      // This should not be done because verify comes now after login
      // if (!user.verified) {
      //   throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      // }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const accessToken = await JwtService.signAccessToken(user.id);
      const refreshToken = await JwtService.signRefreshToken(user.id);

      return {
        success: true,
        document: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async loginWithOtp(
    payload: any,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      const { email, code } = payload;
      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('UNAUTHORIZED', 'Invalid credentials.');
      }

      const user = userResponse.document;

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.LOGIN_CONFIRMATION.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      // This should not be done because verify comes now after login
      // if (!user.verified) {
      //   throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      // }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const accessToken = await JwtService.signAccessToken(user.id);
      const refreshToken = await JwtService.signRefreshToken(user.id);

      return {
        success: true,
        document: {
          token: { access: accessToken, refresh: refreshToken },
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async refresh(
    refreshToken: string,
  ): Promise<SuccessResponseType<any> | ErrorResponseType> {
    try {
      if (!refreshToken) {
        throw new ErrorResponse('BAD_REQUEST', 'Refresh token is required.');
      }

      const userId = await JwtService.verifyRefreshToken(refreshToken);
      const accessToken = await JwtService.signAccessToken(userId);
      // Refresh token change to ensure rotation
      const newRefreshToken = await JwtService.signRefreshToken(userId);

      return {
        success: true,
        document: { token: { access: accessToken, refresh: newRefreshToken } },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async logout(
    accessToken: string,
    refreshToken: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      if (!refreshToken || !accessToken) {
        throw new ErrorResponse(
          'BAD_REQUEST',
          'Refresh and access token are required.',
        );
      }

      const { userId: userIdFromRefresh } =
        await JwtService.checkRefreshToken(refreshToken);
      const { userId: userIdFromAccess } =
        await JwtService.checkAccessToken(accessToken);

      if (userIdFromRefresh !== userIdFromAccess) {
        throw new ErrorResponse(
          'UNAUTHORIZED',
          'Access token does not match refresh token.',
        );
      }

      // Blacklist the access token
      await JwtService.blacklistToken(accessToken);

      // Remove the refresh token from Redis
      await JwtService.removeFromRedis(userIdFromRefresh);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async forgotPassword(
    email: string,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      if (!email) {
        throw new ErrorResponse('BAD_REQUEST', 'Email should be provided.');
      }

      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;

      // This should not be done because verify comes now after login
      // if (!user.verified) {
      //   throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      // }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const otpResponse = await OTPService.generate(
        email,
        config.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!otpResponse.success) {
        throw otpResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }

  async resetPassword(
    payload: any,
  ): Promise<SuccessResponseType<null> | ErrorResponseType> {
    try {
      // We suppose a verification about new password and confirmation password have already been done
      const { email, code, newPassword } = payload;

      const userResponse = (await UserService.findOne({
        email,
      })) as SuccessResponseType<IUserModel>;

      if (!userResponse.success || !userResponse.document) {
        throw new ErrorResponse('NOT_FOUND_ERROR', 'User not found.');
      }

      const user = userResponse.document;

      // This should not be done because verify comes now after login
      // if (!user.verified) {
      //   throw new ErrorResponse('UNAUTHORIZED', 'Unverified account.');
      // }

      if (!user.active) {
        throw new ErrorResponse(
          'FORBIDDEN',
          'Inactive account, please contact admins.',
        );
      }

      const validateOtpResponse = await OTPService.validate(
        email,
        code,
        config.otp.purposes.FORGOT_PASSWORD.code,
      );

      if (!validateOtpResponse.success) {
        throw validateOtpResponse.error;
      }

      const updatePasswordResponse = await UserService.updatePassword(
        user.id,
        newPassword,
      );

      if (!updatePasswordResponse.success) {
        throw updatePasswordResponse.error;
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof ErrorResponse
            ? error
            : new ErrorResponse(
                'INTERNAL_SERVER_ERROR',
                (error as Error).message,
              ),
      };
    }
  }
}

export default new AuthService();
