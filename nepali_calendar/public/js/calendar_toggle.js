// nepali_calendar/public/js/calendar_toggle.js

window.CalendarToggle = {
	setupNepaliDateField(frm, $wrapper, isDatetime) {
		const { formatDatetime, updateDisplay } = window.CalendarUtils;

		const $originalInput = $wrapper.find("input");
		if (!$originalInput.length) return; // Exit if no input found

		const originalClass = $originalInput.attr("class");

		$wrapper.css("position", "relative");
		if ($wrapper.find(".swap-icon").length > 0) return; // Prevent duplicate icons

		const $icon = $(`<i class="fa fa-exchange swap-icon" title="Swap Calendar" 
            style="position:absolute; right:10px; top:40px; cursor:pointer; z-index:10;"></i>`);
		const $altDateDisplay = $(`<div class="nepali-date-display"
            style="margin-left:5px; font-size: 100%; color: #555;"></div>`);
		const $bsInput = $(`<input type="text" class="${originalClass}" style="display:none;" />`);

		$wrapper.append($icon, $altDateDisplay);
		$bsInput.insertAfter($originalInput);

		let isBsMode = false;

		function convertAdToBs() {
			const adVal = $originalInput.val();
			if (!adVal) return;
			try {
				let { date, time } = formatDatetime(adVal);
				let bsVal = window.adToBs(date);
				if (isDatetime && time) bsVal += " " + time;
				$bsInput.val(bsVal);
				frm.set_value($originalInput.attr("data-fieldname"), adVal);
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
				frm.set_value($originalInput.attr("data-fieldname"), adVal);
				updateDisplay($altDateDisplay, adVal, bsVal, isBsMode);
			} catch (e) {
				console.error("BS to AD Conversion Error:", e);
				$altDateDisplay.text("Conversion Error");
			}
		}

		$originalInput.on("change", convertAdToBs);
		$bsInput.on("change", convertBsToAd);

		$bsInput.nepaliDatePicker({
			ndpYear: true,
			ndpMonth: true,
			ndpYearCount: 50,
			onChange: () => $bsInput.trigger("change"),
		});

		$icon.on("click", () => {
			$originalInput.toggle();
			$bsInput.toggle();
			isBsMode = !isBsMode;
			updateDisplay($altDateDisplay, $originalInput.val(), $bsInput.val(), isBsMode);
		});

		if ($originalInput.val()) convertAdToBs();
	},
};
