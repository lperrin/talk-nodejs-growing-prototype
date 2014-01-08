var path = require('path');

module.exports = function (name, mockupName, requester) {
  var parentPath = path.dirname((requester || module.parent).filename),
      targetPath = name.indexOf('.') === 0 ? path.resolve(parentPath, name) : name,
      resolvedPath = require.resolve(targetPath),
      mockupPath = mockupName.indexOf('.') === 0 ? path.resolve(parentPath, mockupName) : mockupName,
      mockup = require(mockupPath);

  require(targetPath);
  require.cache[resolvedPath].exports = mockup;

  return mockup;
};