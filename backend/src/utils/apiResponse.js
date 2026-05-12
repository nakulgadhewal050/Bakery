class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
  }
}

const success = (message, data = null) => {
  return new ApiResponse(true, message, data);
};

const error = (message, data = null) => {
  return new ApiResponse(false, message, data);
};

module.exports = { success, error };
