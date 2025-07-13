import mongoose from 'mongoose';

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
  },
  { timestamps: true },
);

export const contact = mongoose.model('Contact', contactsSchema);

export const getAllContacts = () => {
  return contact.find();
};

export const getContactById = (contactId) => {
  return contact.findById(contactId);
};

export const createContact = (payload) => {
  return contact.create(payload);
};

export const updateContact = (contactId, payload) => {
  return contact.findByIdAndUpdate(contactId, payload, {new: true});
};

export const deleteContact = (contactId) => {
  return contact.findOneAndDelete({ _id: contactId });
};

