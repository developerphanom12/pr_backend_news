class YourSpecificError extends Error {
    constructor(message) {
      super(message);
      this.name = 'YourSpecificError';
    }
  }
  
  module.exports = {
    YourSpecificError,
  };
  