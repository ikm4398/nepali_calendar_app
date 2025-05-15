// nepali_calendar/public/js/list_view.js

// Debounce function to limit frequent calls
function debounce(func, wait) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}

// Cache for adToBs results
const dateCache = new Map();

frappe.views.ListView = class CustomListView extends frappe.views.ListView {
	constructor(opts) {
		super(opts);
		this.formattedValues = new Map(); // Cache formatted values per row
	}

	setup_columns() {
		super.setup_columns();
		this.applyFormatters();
	}

	render() {
		super.render();
		this.applyFormatters();
		this.ensureFormattedDates();
		this.setup_event_listeners();
	}

	// Reapply formatting after list refresh or navigation
	after_refresh() {
		super.after_refresh();
		console.log("List view refreshed, forcing date formatting");
		this.ensureFormattedDates();
	}

	// Handle filter application
	apply_filters() {
		super.apply_filters();
		console.log("Filters applied, forcing date formatting");
		this.ensureFormattedDates();
	}

	setup_event_listeners() {
		// Listen for page show or navigation events
		$(document).on("page-change", () => {
			console.log("Page changed, forcing date formatting");
			this.ensureFormattedDates();
		});
		// Listen for list refresh events
		this.$result.on("refresh", () => {
			console.log("List refreshed, forcing date formatting");
			this.ensureFormattedDates();
		});
	}

	applyFormatters() {
		this.columns.forEach((column) => {
			if (column.df && ["Date", "Datetime"].includes(column.df.fieldtype)) {
				console.log(`Applying BS formatter to ${column.df.fieldname}`);
				column.formatter = this.customDateFormatter(column.df);
			}
		});
	}

	customDateFormatter(df) {
		return (value, row, column, data) => {
			if (!value || typeof value !== "string") return "";
			try {
				if (df.fieldtype === "Date") {
					const bsDate = this.getCachedBsDate(value);
					if (bsDate) {
						return `
                            <span class="ad-date">${value}</span>
                            <span class="bs-date">${bsDate}</span>
                        `;
					}
					return value;
				} else if (df.fieldtype === "Datetime") {
					const [date, time] = value.split(" ");
					if (!date) return value;
					const bsDate = this.getCachedBsDate(date);
					if (bsDate) {
						return `
                            <span class="ad-date">${value}</span>
                            <span class="bs-date">${bsDate} ${time || ""}</span>
                        `;
					}
					return value;
				}
			} catch (e) {
				console.error(`Error converting date for ${df.fieldname}:`, e);
				return value;
			}
		};
	}

	getCachedBsDate(adDate) {
		if (!dateCache.has(adDate)) {
			dateCache.set(adDate, window.adToBs(adDate) || null);
		}
		return dateCache.get(adDate);
	}

	ensureFormattedDates() {
		if (!this.data || !this.data.length) {
			console.log("No data available to format");
			return;
		}
		console.log(`Processing ${this.data.length} visible rows`);
		this.data.forEach((data, index) => {
			const $row = this.$result.find(`.list-row`).eq(index);
			if (!$row.length) {
				console.log(`Row ${index} not found in DOM`);
				return;
			}
			this.columns.forEach((column) => {
				if (column.df && ["Date", "Datetime"].includes(column.df.fieldtype)) {
					let $cell = $row.find(`a[data-filter^="${column.df.fieldname},="]`);
					if (!$cell.length) {
						console.log(
							`Primary cell not found for ${column.df.fieldname} in row ${index}. Trying fallback. Row HTML:`,
							$row.html()
						);
						$cell = $row.find(
							`.list-row-col:contains("${data[column.df.fieldname]}") a`
						);
					}
					if (!$cell.length) {
						console.log(
							`Fallback cell not found for ${column.df.fieldname} in row ${index}`
						);
						return;
					}
					const originalValue = data[column.df.fieldname];
					if (originalValue) {
						const formattedValue = this.customDateFormatter(column.df)(
							originalValue,
							null,
							column,
							data
						);
						if (formattedValue && $cell.html().trim() !== formattedValue) {
							console.log(
								`Updating ${column.df.fieldname} to ${formattedValue} in row ${index}`
							);
							$cell.html(formattedValue); // Use html() to support multiple spans
							this.formattedValues.set(
								`${index}-${column.df.fieldname}`,
								formattedValue
							);
						}
					}
				}
			});
		});
		this.formattedValues.clear(); // Clear cache after processing
	}

	observeDOMChanges() {
		if (this.observer) {
			this.observer.disconnect();
		}
		const targetNode = this.$result[0];
		if (!targetNode) {
			console.log("No target node to observe");
			return;
		}
		this.observer = new MutationObserver(
			debounce((mutations) => {
				console.log("DOM changed, forcing date formatting");
				this.ensureFormattedDates();
			}, 300)
		);
		this.observer.observe(targetNode, {
			childList: true,
			attributes: true,
			subtree: true,
			characterData: true,
		});
	}

	// Ensure formatting during row creation
	make_row(row, data, idx) {
		const $row = super.make_row(row, data, idx);
		this.columns.forEach((column) => {
			if (column.df && ["Date", "Datetime"].includes(column.df.fieldtype)) {
				const value = data[column.df.fieldname];
				if (value) {
					const formattedValue = this.customDateFormatter(column.df)(
						value,
						data,
						column,
						data
					);
					$row.find(`a[data-filter^="${column.df.fieldname},="]`).html(formattedValue);
				}
			}
		});
		return $row;
	}

	destroy() {
		if (this.observer) {
			this.observer.disconnect();
		}
		$(document).off("page-change");
		this.$result.off("refresh");
		super.destroy();
	}
};
