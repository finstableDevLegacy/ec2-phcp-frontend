const setItem = (key: string, data: Object) => {
  try {
    const dataStr = JSON.stringify(data);
    return localStorage.setItem(key, dataStr);
  } catch (e) { }
};

const getItem = (key: string) => {
  try {
    const localStr = localStorage.getItem(key);
    return JSON.parse(localStr!);
  } catch (e) {
    return null;
  }
};

const removeItem = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (e) { }
};

const localService = {
  setItem,
  getItem,
  removeItem,
};

export default localService;
