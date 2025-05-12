frappe.ui.form.on("Nepali_Date", {
	onload(frm) {
		const $wrapper = frm.fields_dict.nepali_date.$wrapper;

		setTimeout(() => {
			const $originalInput = $wrapper.find("input");
			const originalClass = $originalInput.attr("class");
			const isDatetime = $originalInput.attr("data-date-time") === "1";

			$wrapper.css("position", "relative");

			if ($wrapper.find(".swap-icon").length === 0) {
				// Swap icon
				const $icon = $(`
                    <i class="fa fa-exchange swap-icon" title="Swap Calendar"
                       style="position:absolute; right:20px; top:6px; cursor:pointer; z-index:10;"></i>
                `);
				$wrapper.append($icon);

				// Display for alternate date
				const $altDateDisplay = $(`
                    <div class="nepali-date-display" style="margin-top: -20px;margin-left:165px; margin-buttom:20px; font-size: 100%; color: #555;"></div>
                `);
				$wrapper.append($altDateDisplay);

				// Hidden BS input
				const $bsInput = $(
					`<input type="text" class="${originalClass}" style="display:none;" />`
				);
				$bsInput.insertAfter($originalInput);

				let isBsMode = false;

				function formatDatetime(dateStr) {
					const [date, time] = dateStr.split(" ");
					return { date, time };
				}

				function updateDisplay(adDate, bsDate) {
					let label = isBsMode ? "Gregorian" : "Nepali";
					let display = isBsMode ? adDate : bsDate;
					$altDateDisplay.text(`${display}`);
				}

				// Handle AD input change
				$originalInput.on("change", () => {
					const adVal = $originalInput.val();
					if (!adVal) return;
					try {
						let adDate = formatDatetime(adVal).date;
						let time = isDatetime ? formatDatetime(adVal).time : "";
						let bsVal = window.adToBs(adDate);
						if (isDatetime && time) bsVal += " " + time;
						$bsInput.val(bsVal);
						frm.set_value("nepali_date", adVal);
						updateDisplay(adVal, bsVal);
					} catch {
						$altDateDisplay.text("Conversion Error");
					}
				});

				// Handle BS input change
				$bsInput.on("change", () => {
					const bsVal = $bsInput.val();
					if (!bsVal) return;
					try {
						let bsDate = formatDatetime(bsVal).date;
						let time = isDatetime ? formatDatetime(bsVal).time : "";
						let adVal = window.bsToAd(bsDate);
						if (isDatetime && time) adVal += " " + time;
						$originalInput.val(adVal).trigger("change");
						frm.set_value("nepali_date", adVal);
						updateDisplay(adVal, bsVal);
					} catch {
						$altDateDisplay.text("Conversion Error");
					}
				});

				// Init nepali date picker
				$bsInput.nepaliDatePicker({
					ndpYear: true,
					ndpMonth: true,
					ndpYearCount: 50,
					onChange: () => $bsInput.trigger("change"),
				});

				// Toggle calendar input view
				$icon.on("click", () => {
					if (!isBsMode) {
						$originalInput.hide();
						$bsInput.show();
					} else {
						$bsInput.hide();
						$originalInput.show();
					}
					isBsMode = !isBsMode;
					const adVal = $originalInput.val();
					const bsVal = $bsInput.val();
					updateDisplay(adVal, bsVal);
				});

				// Initial display
				const initialAd = $originalInput.val();
				if (initialAd) {
					try {
						let adDate = formatDatetime(initialAd).date;
						let time = isDatetime ? formatDatetime(initialAd).time : "";
						let bsVal = window.adToBs(adDate);
						if (isDatetime && time) bsVal += " " + time;
						$bsInput.val(bsVal);
						updateDisplay(initialAd, bsVal);
					} catch {
						$altDateDisplay.text("Conversion Error");
					}
				}
			}
		}, 100);
	},
});
//hi
