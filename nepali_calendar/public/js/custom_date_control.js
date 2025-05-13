// nepali_calendar/public/js/custom_date_control.js

frappe.ui.form.ControlDate = class CustomDate extends frappe.ui.form.ControlDate {
	make_input() {
		super.make_input();
		this.setup_nepali_date_field();
	}

	setup_nepali_date_field() {
		const $wrapper = this.$wrapper;
		const isDatetime = false; // For Date fields
		setTimeout(() => {
			window.CalendarToggle.setupNepaliDateField(this.frm, $wrapper, isDatetime);
		}, 100);
	}
};

frappe.ui.form.ControlDatetime = class CustomDatetime extends frappe.ui.form.ControlDatetime {
	make_input() {
		super.make_input();
		this.setup_nepali_date_field();
	}

	setup_nepali_date_field() {
		const $wrapper = this.$wrapper;
		const isDatetime = true; // For Datetime fields
		setTimeout(() => {
			window.CalendarToggle.setupNepaliDateField(this.frm, $wrapper, isDatetime);
		}, 100);
	}
};
