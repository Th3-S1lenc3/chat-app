const path = require('path');

module.exports = {
  webpack: {
    alias: {
      "src": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@context": path.resolve(__dirname, "src/components/context"),
      "@utilties": path.resolve(__dirname, "src/utilties"),
    }
  }
}
