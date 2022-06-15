type DBHelper = {
  isJson: (val: unknown) => boolean;
};

const isJson = (item: unknown) => {
  let newItem;
  newItem = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    if (typeof newItem === 'string') {
      newItem = JSON.parse(newItem);
    }
  } catch (e) {
    return false;
  }

  if (typeof newItem === 'object' && newItem !== null) {
    return true;
  }

  return false;
};

const dbHelper: DBHelper = {
  isJson,
};

export default dbHelper;
