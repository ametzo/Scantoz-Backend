const formatDate = (date, time = false) => {
    const dt = new Date(date);

    const day = String(dt.getDate()).padStart(2, "0");
    const month = String(dt.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = dt.getFullYear();

    const dateString = `${day}-${month}-${year}`;

    const timeString = ` ${dt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })}`;

    return dateString + (time ? timeString : "");
};

module.exports = formatDate;
