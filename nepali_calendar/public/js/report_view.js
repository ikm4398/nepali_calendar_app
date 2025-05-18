
// Ensure required functions are defined
if (!window.adToBs) {
	console.error("adToBs function is not defined. Ensure bs_converter.js is loaded.");
}
if (!window.CalendarUtils) {
	console.error("CalendarUtils is not defined. Ensure calendar_utils.js is loaded.");
}

// Function to format Date fields
window.ReportFormatFormDate = function (dateStr) {
	try {
		if (!dateStr) return "";
		const bsDate = window.adToBs(dateStr);
		const formatted = window.CalendarUtils.formatDatetime(bsDate);
		return formatted.date;
	} catch (e) {
		console.error("Error in ReportFormatFormDate:", e, "Input dateStr:", dateStr);
		return dateStr;
	}
};

// Function to format Datetime fields
window.ReportFormatFormDatetime = function (datetimeStr) {
	try {
		if (!datetimeStr) return "";
		const datePart = datetimeStr.split(" ")[0];
		const bsDate = window.adToBs(datePart);
		const formatted = window.CalendarUtils.formatDatetime(datetimeStr);
		return `${bsDate} ${formatted.time}`.trim();
	} catch (e) {
		console.error("Error in ReportFormatFormDatetime:", e, "Input datetimeStr:", datetimeStr);
		return datetimeStr;
	}
};

// Extend DataTable for Report View
class CustomDataTable extends DataTable {
	initializeComponents() {
		super.initializeComponents();
		const originalGetCellContent = this.cellmanager.getCellContent;
		this.cellmanager.getCellContent = function (cell, refreshHtml = false) {
			let hcontent = originalGetCellContent.call(this, cell, refreshHtml);
			if (
				!cell.isHeader &&
				!cell.isFilter &&
				cell.content &&
				/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(cell.content)
			) {
				if (cell.content.includes(" ")) {
					// Datetime field: Show AD datetime and BS datetime
					const bsDatetime = window.ReportFormatFormDatetime(cell.content);
					cell.html = `${cell.content}<br><span class="nepali_date-conversion">${bsDatetime}</span>`;
				} else {
					// Date field: Show AD date and BS date
					const bsDate = window.ReportFormatFormDate(cell.content);
					cell.html = `${cell.content}<br><span class="nepali_date-conversion">${bsDate}</span>`;
				}
				hcontent = originalGetCellContent.call(this, cell, refreshHtml);
			}
			return hcontent;
		};
	}
}

window.DataTable = CustomDataTable;

// Extend QueryReport
frappe.provide("frappe.views");
frappe.views.QueryReport = class CustomQueryReport extends frappe.views.QueryReport {
	init() {
		return super.init();
	}
};

// Extend ReportView
frappe.views.ReportView = class CustomReportView extends frappe.views.ReportView {
	setup_datatable(values) {
		this.$datatable_wrapper.empty();
		this.datatable = new window.DataTable(this.$datatable_wrapper[0], {
			columns: this.columns,
			data: this.get_data(values),
			getEditor: this.get_editing_object.bind(this),
			language: frappe.boot.lang,
			translations: frappe.utils.datatable.get_translations(),
			checkboxColumn: true,
			inlineFilters: true,
			cellHeight: 35,
			direction: frappe.utils.is_rtl() ? "rtl" : "ltr",
			events: {
				onRemoveColumn: (column) => {
					this.remove_column_from_datatable(column);
				},
				onSwitchColumn: (column1, column2) => {
					this.switch_column(column1, column2);
				},
				onCheckRow: () => {
					const checked_items = this.get_checked_items();
					this.toggle_actions_menu_button(checked_items.length > 0);
				},
			},
			hooks: {
				columnTotal: frappe.utils.report_column_total,
			},
			headerDropdown: [
				{
					label: __("Add Column"),
					action: (datatable_col) => {
						let columns_in_picker = [];
						const columns = this.get_columns_for_picker();

						columns_in_picker = columns[this.doctype]
							.filter((df) => !this.is_column_added(df))
							.map((df) => ({
								label: __(df.label, null, df.parent),
								value: df.fieldname,
							}));

						delete columns[this.doctype];

						for (let cdt in columns) {
							columns[cdt]
								.filter((df) => !this.is_column_added(df))
								.map((df) => ({
									label: __(df.label, null, df.parent) + ` (${cdt})`,
									value: df.fieldname + "," + cdt,
								}))
								.forEach((df) => columns_in_picker.push(df));
						}

						const d = new frappe.ui.Dialog({
							title: __("Add Column"),
							fields: [
								{
									label: __("Select Column"),
									fieldname: "column",
									fieldtype: "Autocomplete",
									options: columns_in_picker,
								},
								{
									label: __("Insert Column Before {0}", [
										__(datatable_col.docfield.label).bold(),
									]),
									fieldname: "insert_before",
									fieldtype: "Check",
								},
							],
							primary_action: ({ column, insert_before }) => {
								if (!columns_in_picker.map((col) => col.value).includes(column)) {
									frappe.show_alert({
										message: __("Invalid column"),
										indicator: "orange",
									});
									d.hide();
									return;
								}

								let doctype = this.doctype;
								if (column.includes(",")) {
									[column, doctype] = column.split(",");
								}

								let index = datatable_col.colIndex;
								if (insert_before) {
									index = index - 1;
								}
								this.add_column_to_datatable(column, doctype, index);
								d.hide();
							},
						});

						d.show();
					},
				},
			],
		});
	}
};

// Extend ListView to support Nepali date formatting
frappe.views.ListView = class CustomListView extends frappe.views.ListView {
	setup_columns() {
		super.setup_columns();
		// Override formatters for Date and Datetime fields
		this.columns.forEach((col) => {
			if (col.df && (col.df.fieldtype === "Date" || col.df.fieldtype === "Datetime")) {
				const originalFormatter = col.df.formatter || ((val) => val);
				col.df.formatter = (value, row, column, data) => {
					if (!value) return originalFormatter(value, row, column, data);
					if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(value)) {
						const formatted =
							col.df.fieldtype === "Datetime"
								? window.ReportFormatFormDatetime(value)
								: window.ReportFormatFormDate(value);
						return `${value}<br><span class="nepali_date-conversion2">${formatted}</span>`;
					}
					return originalFormatter(value, row, column, data);
				};
			}
		});
	}
};
