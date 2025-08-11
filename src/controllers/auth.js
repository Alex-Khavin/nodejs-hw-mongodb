import {
  loginOrRegister,
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
  requestResetToken,
  resetPassword,
} from '../services/auth.js';
import { getGoogleOAuthUrl, validateCode } from '../utils/googleOAuthclient.js';

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: session.refreshTokenValidUntil,
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: session.accessTokenValidUntil,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  //   res.cookie('refreshToken', session.refreshToken, {
  //     httpOnly: true,
  //     expires: session.refreshTokenValidUntil,
  //   });
  //   res.cookie('sessionId', session._id, {
  //     httpOnly: true,
  //     expires: session.accessTokenValidUntil,
  //   });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

export const refreshUserController = async (req, res) => {
  const session = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  setupSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);

  res.json({
    message: 'Reset password email has been successfully sent.',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  const { token, password } = req.body;

  await resetPassword(token, password);

  res.json({
    message: 'Password has been successfully reset.',
    status: 200,
    data: {},
  });
};

export const getGoogleOAuthController = async (req, res) => {
  const url = await getGoogleOAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: { url },
  });
};

export const confirmOAuthController = async (req, res) => {
  const ticket = await validateCode(req.body.code);

  const session = await loginOrRegister(
    ticket.payload.email,
    ticket.payload.name,
  );

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
