// nepali_calendar/public/js/custom_date_control.js

frappe.ui.form.ControlDate = class CustomDate extends frappe.ui.form.ControlDate {
	refresh() {
		super.refresh();
		// Handle read-only state or saved documents
		if (this.df.read_only || (this.frm && !this.frm.is_new())) {
			this.setup_read_only_nepali_date();
		}
	}

	make_input() {
		super.make_input();
		// Handle editable state (before saving)
		this.setup_nepali_date_field();
	}

	setup_nepali_date_field() {
		const $wrapper = this.$wrapper;
		const isDatetime = false;

		setTimeout(() => {
			try {
				window.CalendarToggle.setupNepaliDateField(this.frm, $wrapper, isDatetime);
			} catch (e) {
				console.error("Error setting up Nepali date field for editable Date control:", e);
			}
		}, 100);
	}

	setup_read_only_nepali_date() {
		const $controlValue = this.$wrapper.find(".control-value");
		$controlValue.find(".nepali-date-display").remove(); // Remove existing display

		const adVal = this.get_value();
		if (adVal) {
			try {
				let { date } = window.CalendarUtils.formatDatetime(adVal);
				let bsVal = window.adToBs(date);
				const $altDateDisplay = $('<div class="nepali-date-display"></div>').text(bsVal);
				$controlValue.append($altDateDisplay);
			} catch (e) {
				console.error("AD to BS Conversion Error (Date):", e);
			}
		}
	}
};

frappe.ui.form.ControlDatetime = class CustomDatetime extends frappe.ui.form.ControlDatetime {
	refresh() {
		super.refresh();
		if (this.df.read_only || (this.frm && !this.frm.is_new())) {
			this.setup_read_only_nepali_date();
		}
	}

	make_input() {
		super.make_input();
		this.setup_nepali_date_field();
	}

	setup_nepali_date_field() {
		const $wrapper = this.$wrapper;
		const isDatetime = true;

		setTimeout(() => {
			try {
				window.CalendarToggle.setupNepaliDateField(this.frm, $wrapper, isDatetime);
			} catch (e) {
				console.error(
					"Error setting up Nepali date field for editable Datetime control:",
					e
				);
			}
		}, 100);
	}

	setup_read_only_nepali_date() {
		const $controlValue = this.$wrapper.find(".control-value");
		$controlValue.find(".nepali-date-display").remove(); // Remove existing display

		const adVal = this.get_value();
		if (adVal) {
			try {
				let { date, time } = window.CalendarUtils.formatDatetime(adVal);
				let bsVal = window.adToBs(date);
				if (time) bsVal += " " + time;
				const $altDateDisplay = $('<div class="nepali-date-display"></div>').text(bsVal);
				$controlValue.append($altDateDisplay);
			} catch (e) {
				console.error("AD to BS Conversion Error (Datetime):", e);
			}
		}
	}
};
