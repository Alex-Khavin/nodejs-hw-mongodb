const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;

  const isContactType = (type) => ['work', 'home', 'personal'].includes(type);
  if (isContactType(type)) return type;
};

// const parseNumber = (number) => {
//     const isString = typeof number === 'string';
//     if (!isString) return;

//     const parsedNumber = parseInt(number);
//     if (Number.isNaN(parsedNumber)) {
//         return;
//     }
//     return parsedNumber;
// };

export const parseFilterParams = (query) => {
    const { name, phoneNumber, email, isFavourite, contactType } = query;

    const parsedContactType = parseContactType(contactType);

    return {
        name,
        phoneNumber,
        email,
        isFavourite,
        contactType: parsedContactType,
    };
 };
