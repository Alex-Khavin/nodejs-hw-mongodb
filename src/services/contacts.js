import mongoose from 'mongoose';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { SORT_ORDER } from '../constants/index.js';

const contactsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
    photo: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref: 'users',
    },
  },
  { timestamps: true, versionKey: false },
);

export const contact = mongoose.model('Contact', contactsSchema);

export const getAllContacts = async ({
  page,
  perPage,
  sortOrder = SORT_ORDER,
  sortBy,
  filter = {},
  userId,
}) => {
  const limit = perPage;
  const skip = page > 0 ? (page - 1) * perPage : 0;

  const contactsQuery = contact.find({ userId });

  if (filter.name) {
    contactsQuery.where('name').equals(filter.name);
  }
  if (filter.phoneNumber) {
    contactsQuery.where('phoneNumber').equals(filter.phoneNumber);
  }
  if (filter.email) {
    contactsQuery.where('email').equals(filter.email);
  }
  if (filter.isFavourite) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }
  if (filter.contactType) {
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  const contactsCount = await contact
    .find()
    .merge(contactsQuery)
    .countDocuments();

  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();
  const paginationData = calculatePaginationData(contactsCount, page, perPage);

  return {
    data: contacts,
    ...paginationData,
  };
};

export const getContactById = (contactId, userId) => {
  return contact.findOne({ _id: contactId, userId });
};

export const createContact = (payload) => {
  return contact.create(payload);
};

export const updateContact = (contactId, payload, userId) => {
  return contact.findByIdAndUpdate(contactId, payload, {userId}, { new: true });
};

// export const updateContact = (contactId, payload, userId) => {
//   return contact.findOneAndUpdate(
//     { _id: contactId, userId },
//     payload,
//     { new: true }
//   );
// };

export const deleteContact = (contactId, userId) => {
  return contact.findOneAndDelete({ _id: contactId, userId });
};
