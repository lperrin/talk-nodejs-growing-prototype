exports.getTimestamp = function (time) {
  switch (typeof time) {
    case 'object':
      return time.getTime();

    case 'string':
      return new Date(time).getTime();

    case 'number':
      return time;

    default:
      throw new Error('Bad time type ' + time);
  }
};
