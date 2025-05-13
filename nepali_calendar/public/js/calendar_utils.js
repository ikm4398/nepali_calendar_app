// nepali_calendar/public/js/calendar_utils.js

window.CalendarUtils = {
	formatDatetime(dateStr) {
		try {
			const [date, time] = dateStr.split(" ");
			return { date, time: time || "" };
		} catch (e) {
			console.error("Error formatting datetime:", e);
			return { date: "", time: "" };
		}
	},

	updateDisplay($displayEl, adDate, bsDate, isBsMode) {
		try {
			const display = isBsMode ? adDate : bsDate;
			$displayEl.text(display || "Invalid Date");
		} catch (e) {
			console.error("Error updating display:", e);
			$displayEl.text("Display Error");
		}
	},
};
