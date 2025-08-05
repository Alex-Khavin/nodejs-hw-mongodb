import * as fs from 'node:fs/promises';
import path from 'node:path';

import createHttpError from 'http-errors';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortOrder, sortBy } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId: req.user.id,
  });

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const contacts = await getContactById(req.params.contactId, req.user.id);

  if (contacts === null) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id: ${req.params.contactId}!`,
    data: contacts,
  });
};

const { UPLOAD_TO_CLOUDINARY } = process.env;

export const createContactsController = async (req, res) => {
  let photo = null;

  if (UPLOAD_TO_CLOUDINARY === 'true') {
    const result = await uploadToCloudinary(req.file.path);
    await fs.unlink(req.file.path);//видаляємо з tmp тимчасовий файл.
    photo = result.secure_url;
  } else {
    await fs.rename(req.file.path, path.resolve('src/uploads/photo', req.file.filename));
    photo = `http://localhost:3000/photo/${req.file.filename}`;
  }

  const newContact = await createContact({
    ...req.body,
    photo,
    userId: req.user.id,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const patchContactController = async (req, res, next) => {
  let photo = null;

  if (UPLOAD_TO_CLOUDINARY === 'true') {
    const result = await uploadToCloudinary(req.file.path);
    await fs.unlink(req.file.path);//видаляємо з tmp тимчасовий файл.
    photo = result.secure_url;
  } else {
    await fs.rename(req.file.path, path.resolve('src/uploads/photo', req.file.filename));
    photo = `http://localhost:3000/photo/${req.file.filename}`;
  }

  const patchContact = await updateContact(
    req.params.contactId,
    { ...req.body, ...(photo && { photo }) },
    req.user.id,
  );

  if (patchContact === null) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: patchContact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const contacts = await deleteContact(contactId, req.user.id);
  if (!contacts) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }
  res.status(204).end();
};
