const currencyFormatter = require("currency-formatter");

function formatIDR(value) {
  return currencyFormatter.format(value, { code: "IDR" });
}

module.exports = { formatIDR };
