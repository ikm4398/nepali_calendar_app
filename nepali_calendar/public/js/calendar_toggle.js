window.CalendarToggle = {
	setupNepaliDateField(frm, $wrapper, isDatetime) {
		const { formatDatetime, updateDisplay } = window.CalendarUtils;

		const $controlWrapper = $wrapper.find(".control-input-wrapper");
		if (!$controlWrapper.length) return; // Exit if no control wrapper found

		const $originalInput = $controlWrapper.find("input");
		if (!$originalInput.length) return; // Exit if no input found

		const originalClass = $originalInput.attr("class");

		$controlWrapper.css("position", "relative");
		if ($controlWrapper.find(".swap-icon").length > 0) return; // Prevent duplicate icons

		const $icon = $('<i class="fa fa-exchange swap-icon" title="Swap Calendar"></i>');
		const $altDateDisplay = $('<div class="nepali-date-display"></div>');
		const $bsInput = $(`<input type="text" class="${originalClass}" style="display:none;" />`);

		$controlWrapper.append($icon, $altDateDisplay);
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
