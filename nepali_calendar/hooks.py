# nepali_calendar/hooks.py

app_name = "nepali_calendar"
app_title = "Nepali Calendar"
app_publisher = "indra @deskgoo"
app_description = "Nepali Calendar"
app_email = "ikm4398@gmail.com"
app_license = "mit"

# Include JS and CSS assets
app_include_js = [
    "/assets/nepali_calendar/dist/bs_converter.iife.js",
    "/assets/nepali_calendar/js/nepali.datepicker.v4.0.8.min.js",
    "/assets/nepali_calendar/js/calendar_utils.js",
    "/assets/nepali_calendar/js/calendar_toggle.js",
    "/assets/nepali_calendar/js/custom_date_control.js",  # New JS file for custom control
]
app_include_css = [
    "/assets/nepali_calendar/css/custom.css",
    "/assets/nepali_calendar/css/nepali.datepicker.v4.0.8.min.css",
]

# Override default Date and Datetime controls
control_overrides = {
    "Date": "nepali_calendar.custom_date_control.CustomDate",
    "Datetime": "nepali_calendar.custom_date_control.CustomDatetime",
}