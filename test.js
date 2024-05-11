const bytes = 537346048000;

const convertBytesToMebi1 = (bytesVal) => {
  console.log(bytesVal / (1024 * 1024));
};

const convertBytesToMebi2 = (bytesVal) => {
  console.log(bytesVal / (1024 * 1024 * 1000));
};

console.log(convertBytesToMebi1(bytes));
console.log(convertBytesToMebi2(bytes));
