const dayjs = require("dayjs");

function formatDateTime(dateValue) {
  return dayjs(dateValue).format("DD MMM YYYY, HH:mm");
}

module.exports = { formatDateTime };
