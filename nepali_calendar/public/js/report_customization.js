// Global constants (assumed values)
window.BS_DATE_REPORT_OPTION = "a.d."; // Options: 'a.d.' (A.D. with B.S. below) or 'b.s.' (B.S. only)
window.BS_DATE_FORMAT = "YYYY-MM-DD";
window.BS_DATE_FORMAT_USER = "YYYY-MM-DD";
window.TYPE_DATE = "date";
window.TYPE_DATETIME = "datetime";

// Placeholder for original Frappe formatters (assumed to be defaults)
const datetime_str_to_user =
	frappe.datetime.str_to_user ||
	function (value) {
		return value;
	};
const FormatFormDate =
	frappe.form.formatters.Date ||
	function (value) {
		return frappe.datetime.str_to_user(value);
	};
const FormatFormDatetime =
	frappe.form.formatters.Datetime ||
	function (value) {
		return frappe.datetime.str_to_user(value);
	};

// Custom formatters for reports
function convert_datetime_str_to_user(value, forHtml = false) {
	if (!value || value.includes("<br>") || value.includes("BS")) return value; // Skip if already formatted
	try {
		const bsDate = window.adToBs(value);
		if (!bsDate) throw new Error("Invalid B.S. date conversion");
		const separator = forHtml ? "<br>" : "\n";
		if (BS_DATE_REPORT_OPTION.toLowerCase() === "b.s.") {
			return bsDate;
		} else {
			return `${value}${separator}${bsDate}`;
		}
	} catch (e) {
		console.error("Error converting date for display:", e);
		return value; // Fallback to A.D. date
	}
}

function FormatDateReport(value, forHtml = false) {
	return convert_datetime_str_to_user(value, forHtml);
}

function FormatDatetimeReport(value, forHtml = false) {
	if (!value || value.includes("<br>") || value.includes("BS")) return value; // Skip if already formatted
	try {
		const { date, time } = window.CalendarUtils.formatDatetime(value);
		if (!date) throw new Error("Invalid date format");
		const bsDate = window.adToBs(date);
		if (!bsDate) throw new Error("Invalid B.S. date conversion");
		const separator = forHtml ? "<br>" : "\n";
		if (BS_DATE_REPORT_OPTION.toLowerCase() === "b.s.") {
			return time ? `${bsDate} ${time}` : bsDate;
		} else {
			const adDisplay = time ? `${date} ${time}` : date;
			const bsDisplay = time ? `${bsDate} ${time}` : bsDate;
			return `${adDisplay}${separator}${bsDisplay}`;
		}
	} catch (e) {
		console.error("Error formatting datetime for report:", e);
		return value; // Fallback to original value
	}
}

// Extend ReportView (unchanged)
class ExtendedReportView extends frappe.views.ReportView {
	setup_datatable(values) {
		super.setup_datatable(values);
		if (this.datatable) {
			$(this.datatable.wrapper).empty();
			this.datatable.buildOptions({
				cellHeight: 45,
			});
			this.datatable.prepare();
			this.datatable.initializeComponents();
			this.datatable.refresh(this.get_data(this.data), this.columns);
			this.datatable.columnmanager.applyDefaultSortOrder();
		}
	}
}

frappe.views.ReportView = ExtendedReportView;

// Extend QueryReport
class ExtendedQueryReport extends frappe.views.QueryReport {
	render_datatable() {
		super.render_datatable();
		if (this.datatable) {
			let columns = this.columns.filter((col) => !col.hidden);
			$(this.datatable.wrapper).empty();
			this.datatable.buildOptions({
				cellHeight: 45,
			});
			this.datatable.prepare();
			this.datatable.initializeComponents();
			this.datatable.refresh(this.data, columns);
		}
	}

	get_filters_html_for_print() {
		const applied_filters = this.get_filter_values();
		return Object.keys(applied_filters)
			.map((fieldname) => {
				const df = frappe.query_report.get_filter(fieldname).df;
				let value = applied_filters[fieldname];
				if (df.fieldtype === "Date" || df.fieldtype === "Datetime") {
					try {
						const formattedValue =
							df.fieldtype === "Date"
								? FormatDateReport(value, true)
								: FormatDatetimeReport(value, true);
						if (!formattedValue) throw new Error("Invalid date conversion");
						value = formattedValue;
					} catch (e) {
						console.error("Error converting filter date:", e);
						// Fallback to A.D. date
					}
				}
				return `<h6>${__(df.label)}: ${value}</h6>`;
			})
			.join("");
	}

	prepare_print_data(data) {
		if (!data) return data;
		const columns = this.columns.filter((col) => !col.hidden);
		return data.map((row) => {
			const newRow = { ...row };
			columns.forEach((col, i) => {
				if (
					(col.fieldtype === "Date" || col.fieldtype === "Datetime") &&
					newRow[col.fieldname]
				) {
					const currentValue = newRow[col.fieldname];
					// Only format if not already formatted
					if (!currentValue.includes("<br>") && !currentValue.includes("BS")) {
						newRow[col.fieldname] =
							col.fieldtype === "Date"
								? FormatDateReport(currentValue, true)
								: FormatDatetimeReport(currentValue, true);
					}
				}
			});
			return newRow;
		});
	}

	pdf_report(print_settings) {
		frappe.datetime.str_to_user = (value) => convert_datetime_str_to_user(value, true);
		frappe.form.formatters.Date = (value) => FormatDateReport(value, true);
		frappe.form.formatters.Datetime = (value) => FormatDatetimeReport(value, true);
		const originalData = this.data;
		this.data = this.prepare_print_data(this.data);
		try {
			const ret = super.pdf_report(print_settings);
			return ret;
		} catch (error) {
			throw error;
		} finally {
			frappe.datetime.str_to_user = datetime_str_to_user;
			frappe.form.formatters.Date = FormatFormDate;
			frappe.form.formatters.Datetime = FormatFormDatetime;
			this.data = originalData;
		}
	}

	print_report(print_settings) {
		frappe.datetime.str_to_user = (value) => convert_datetime_str_to_user(value, true);
		frappe.form.formatters.Date = (value) => FormatDateReport(value, true);
		frappe.form.formatters.Datetime = (value) => FormatDatetimeReport(value, true);
		const originalData = this.data;
		this.data = this.prepare_print_data(this.data);
		try {
			const ret = super.print_report(print_settings);
			return ret;
		} catch (error) {
			throw error;
		} finally {
			frappe.datetime.str_to_user = datetime_str_to_user;
			frappe.form.formatters.Date = FormatFormDate;
			frappe.form.formatters.Datetime = FormatFormDatetime;
			this.data = originalData;
		}
	}

	get_data_for_csv(include_indentation) {
		const rows = this.datatable.bodyRenderer.visibleRows;
		if (this.raw_data.add_total_row) {
			rows.push(this.datatable.bodyRenderer.getTotalRow());
		}
		return rows.map((row) => {
			const standard_column_count = this.datatable.datamanager.getStandardColumnCount();
			return row.slice(standard_column_count).map((cell, i) => {
				if (cell.column.fieldtype === "Duration") {
					cell.content = frappe.utils.get_formatted_duration(cell.content);
				}
				if (
					(cell.column.fieldtype === "Date" || cell.column.fieldtype === "Datetime") &&
					cell.content
				) {
					cell.content = (
						cell.column.fieldtype === "Date"
							? FormatDateReport(cell.content, false)
							: FormatDatetimeReport(cell.content, false)
					).replace("\n", "; ");
				}
				if (include_indentation && i === 0) {
					cell.content = "   ".repeat(row.meta.indent) + (cell.content || "");
				}
				return cell.content || "";
			});
		});
	}
}

frappe.views.QueryReport = ExtendedQueryReport;
