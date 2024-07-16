
let dateToYMD = (date) => {
    let year, month, day;
    year = String(date.getFullYear());
    month = String(date.getMonth() + 1);
    if (month.length === 1) {
        month = "0" + month;
    }
    day = String(date.getDate());
    if (day.length === 1) {
        day = "0" + day;
    }
    return year + "-" + month + "-" + day;
};

module.exports = {
    dateToYMD: dateToYMD
};