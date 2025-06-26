function getTime() {
  return new Date().toISOString();
}

module.exports = {
  info(msg) {
    console.log(`[INFO] [${getTime()}] ${msg}`);
  },
  error(msg) {
    console.error(`[ERROR] [${getTime()}] ${msg}`);
  },
  message(msg, userId) {
    console.log(`[MESSAGE] [${getTime()}] ${userId}: ${msg}`);
  }
}; 