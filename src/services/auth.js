import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
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



//   const accessToken = randomBytes(30).toString('base64');
//   const refreshToken = randomBytes(30).toString('base64');

//   return await SessionsCollection.create({
//     userId: user._id,
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//     refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
//   });
};

export const refreshUsersSession = async ({sessionId, refreshToken}) => {
  const session = await SessionsCollection.findOne({
    // _id: sessionId, не зміг зрозуміти чому не працює рефреш з цим ID як у конспекті?
    refreshToken,
  });

    console.log({_id: sessionId, refreshToken});

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
