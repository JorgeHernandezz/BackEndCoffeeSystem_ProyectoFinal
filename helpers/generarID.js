function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

const generarID = () => {
    const random = (getRandomInt(0, 9).toString()
    + getRandomInt(0, 9).toString()
    + getRandomInt(0, 9).toString()
    + getRandomInt(0, 9).toString()
    + getRandomInt(0, 9).toString());
    return random;
}

export default generarID;
