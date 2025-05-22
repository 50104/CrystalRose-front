const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
    },
  },
};
