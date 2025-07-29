import { Router } from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactsController,
  patchContactController,
  deleteContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { createContactsSchema, updateContactsSchema } from '../validation/contacts.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrlWrapper(getContactsController));

router.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));

router.post('/', validateBody(createContactsSchema), ctrlWrapper(createContactsController));

router.patch('/:contactId', isValidId, validateBody(updateContactsSchema), ctrlWrapper(patchContactController));

router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));

export default router;
