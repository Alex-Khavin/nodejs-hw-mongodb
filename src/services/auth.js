import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
// import 'dotenv/config';
import jwt from 'jsonwebtoken';
// import { SMTP } from '../constants/index.js';
import { sendEmail } from '../utils/sendEmail.js';
import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user !== null) {
    throw new createHttpError.Conflict('Email in use');
  }

  //Хешуємо password:
  payload.password = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create(payload);
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user === null) {
    throw createHttpError(401, 'User not found');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ userId: user._id });

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    // _id: sessionId, не зміг зрозуміти чому не працює рефреш з цим ID як у конспекті?
    refreshToken,
  });

  console.log({ _id: sessionId, refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

const { JWT_SECRET, APP_DOMAIN, SMTP_FROM } = process.env;

export const requestResetToken = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    JWT_SECRET,
    { expiresIn: '5m' },
  );

  try {
    await sendEmail({
      from: SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${APP_DOMAIN}/reset-password/token=${resetToken}">here</a> to reset your password!</p>`,
    });
  } catch (error) {
    console.log(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (token, password) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UsersCollection.findById(decoded.sub);
    if (!user) {
      throw new createHttpError.NotFound('Users not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UsersCollection.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    await SessionsCollection.deleteOne({ userId: user._id }); //deleteMany можливо краще?
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new createHttpError.Unauthorized('Token is expired or invalid.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new createHttpError.Unauthorized('Invalid token');
    }
    throw error;
  }
};

export const loginOrRegister = async (email, name) => {
  let user = await UsersCollection.findOne({ email });

  if (!user) {
    const password = await bcrypt.hash(
      crypto.randomBytes(30).toString('base64'),
      10,
    );

    user = await UsersCollection.create({ name, email, password });
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSession = createSession();
  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};
