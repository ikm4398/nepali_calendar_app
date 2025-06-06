// nepali_calendar/public/js/calendar_toggle.js
window.CalendarToggle = {
	setupNepaliDateField(frm, $wrapper, isDatetime) {
		const { formatDatetime, updateDisplay } = window.CalendarUtils;

		// Find the control wrapper, fallback to frappe-control if control-input-wrapper is not present
		let $controlWrapper = $wrapper.find(".control-input-wrapper");
		if (!$controlWrapper.length) {
			$controlWrapper = $wrapper.hasClass("frappe-control")
				? $wrapper
				: $wrapper.find(".frappe-control");
		}
		if (!$controlWrapper.length) {
			console.warn("Control wrapper not found in wrapper:", $wrapper);
			return;
		}

		const $originalInput = $controlWrapper.find("input");
		if (!$originalInput.length) {
			console.warn("Input not found in control wrapper:", $controlWrapper);
			return;
		}

		const originalClass = $originalInput.attr("class");

		$controlWrapper.css("position", "relative");
		if ($controlWrapper.find(".swap-icon").length > 0) {
			console.log("Swap icon already present, skipping setup for:", $originalInput);
			return;
		}

		const $icon = $('<i class="fa fa-exchange swap-icon" title="Swap Calendar"></i>');
		const $altDateDisplay = $('<div class="nepali-date-display"></div>');
		const $bsInput = $(`<input type="text" class="${originalClass}" style="display:none;" />`);

		$controlWrapper.append($icon, $altDateDisplay);
		$bsInput.insertAfter($originalInput);

		let isBsMode = true; // Initialize in Nepali (BS) mode

		function convertAdToBs() {
			const adVal = $originalInput.val();
			if (!adVal) return;
			try {
				let { date, time } = formatDatetime(adVal);
				let bsVal = window.adToBs(date);
				if (isDatetime && time) bsVal += " " + time;
				$bsInput.val(bsVal);
				if (frm) frm.set_value($originalInput.attr("data-fieldname"), adVal);
				updateDisplay($altDateDisplay, adVal, bsVal, isBsMode);
			} catch (e) {
				console.error("AD to BS Conversion Error:", e);
				$altDateDisplay.text("Conversion Error");
			}
		}

		function convertBsToAd() {
			const bsVal = $bsInput.val();
			if (!bsVal) return;
			try {
				let { date, time } = formatDatetime(bsVal);
				let adVal = window.bsToAd(date);
				if (isDatetime && time) adVal += " " + time;
				$originalInput.val(adVal).trigger("change");
				if (frm) frm.set_value($originalInput.attr("data-fieldname"), adVal);
				updateDisplay($altDateDisplay, adVal, bsVal, isBsMode);
			} catch (e) {
				console.error("BS to AD Conversion Error:", e);
				$altDateDisplay.text("Conversion Error");
			}
		}

		$originalInput.on("change", convertAdToBs);
		$bsInput.on("change", convertBsToAd);

		try {
			$bsInput.nepaliDatePicker({
				ndpYear: true,
				ndpMonth: true,
				ndpYearCount: 50,
				onChange: () => $bsInput.trigger("change"),
			});
			console.log("Nepali Datepicker initialized for:", $bsInput);
		} catch (e) {
			console.error("Error initializing Nepali Datepicker:", e);
		}

		$icon.on("click", () => {
			$originalInput.toggle();
			$bsInput.toggle();
			isBsMode = !isBsMode;
			updateDisplay($altDateDisplay, $originalInput.val(), $bsInput.val(), isBsMode);
		});

		// Initially show BS input and hide AD input
		$originalInput.hide();
		$bsInput.show();

		// Perform initial conversion if a value exists
		if ($originalInput.val()) {
			convertAdToBs();
		} else if ($bsInput.val()) {
			convertBsToAd();
		}
	},
};
