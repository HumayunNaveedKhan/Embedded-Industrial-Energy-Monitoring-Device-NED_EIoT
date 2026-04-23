/**
 * NED-EIoT — Google Sheets Dashboard AppScript
 * Version: 1.4.2
 * 
 * Google Apps Script for receiving real-time energy data
 * from NED-EIoT devices via HTTPS GET requests and logging
 * to a structured Google Sheets dashboard with daily,
 * weekly, monthly, and yearly consumption analytics,
 * pie charts, column charts, and day/night breakdowns.
 * 
 * Endpoint: Deploy as Web App → Execute as Me → Anyone
 * 
 * Author:  Humayun Khan
 * Lab:     HHRCM Lab, NCRA-NEDUET, Karachi, Pakistan
 * Patent:  IPO Pakistan Application No. 967/2025 (Under Review)
 * 
 * CONFIGURATION:
 * Replace sheetId with your own Google Sheets ID.
 * 
 * © 2025 Humayun Khan, HHRCM Lab NCRA-NEDUET
 */
 
 function doGet(e) {
  try {
    return logPowerData(e);
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.message);
  }
}

function logPowerData(e) {
  var sheetId = "Put GoogleSheets ID here";
  var spreadsheet, sheet;

  try {
    spreadsheet = SpreadsheetApp.openById(sheetId);
    sheet = spreadsheet.getSheetByName("Data") || spreadsheet.getActiveSheet();
  } catch (error) {
    return ContentService.createTextOutput("Error accessing sheet: " + error.message);
  }

  // Set headers if sheet is empty
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    sheet.getRange(1, 1, 1, 10).setValues([[
      "Timestamp", "Current (A)", "Voltage (V)", "Power (kW)", "Energy (kWh)",
      "Daily Consumption (kWh)", "Weekly Consumption (kWh)", "Monthly Consumption (kWh)",
      "Yearly Consumption (kWh)", "Week Number"
    ]]);
  }

  var current = parseFloat(e.parameter.current) || 0;
  var voltage = parseFloat(e.parameter.voltage) || 0;
  var power = parseFloat(e.parameter.power) || 0;
  var interval = parseFloat(e.parameter.interval) || 10;
  if (current === 0 && voltage === 0 && power === 0) {
    return ContentService.createTextOutput("Error: Invalid or missing parameters");
  }

  var power_kw = power / 1000;

  var now = new Date();
  var timestamp = Utilities.formatDate(now, "Asia/Karachi", "EEEE, dd MMMM, yyyy, HH:mm:ss");

  var properties = PropertiesService.getScriptProperties();
  var storedInterval = parseFloat(properties.getProperty("sheetInterval") || "10");
  if (interval !== storedInterval) {
    properties.setProperty("sheetInterval", interval);
    sheet.getRange("E3").setValue("Energy Inst (" + interval + "-sec)");
  }
  var intervalHours = interval / 3600;

  var energy_kwh = 0;
  var currentLastRow = sheet.getLastRow();
  if (currentLastRow > 1) {
    var lastTimestampStr = sheet.getRange(currentLastRow, 1).getValue();
    var lastTimestamp = new Date(lastTimestampStr);
    if (lastTimestamp && !isNaN(lastTimestamp.getTime())) {
      var timeDiffMs = now.getTime() - lastTimestamp.getTime();
      var timeDiffHours = timeDiffMs / (1000 * 60 * 60);
      if (timeDiffHours >= 0 && timeDiffHours <= 24) {
        energy_kwh = power_kw * timeDiffHours;
      } else {
        energy_kwh = power_kw * intervalHours;
      }
    } else {
      energy_kwh = power_kw * intervalHours;
    }
  } else {
    energy_kwh = power_kw * intervalHours;
  }

  var dailyConsumption = parseFloat(calculateConsumption(sheet, now, "day")) + energy_kwh;
  var weeklyConsumption = parseFloat(calculateConsumption(sheet, now, "week")) + energy_kwh;
  var monthlyConsumption = parseFloat(calculateConsumption(sheet, now, "month")) + energy_kwh;
  var yearlyConsumption = parseFloat(calculateConsumption(sheet, now, "year")) + energy_kwh;

  var weekNumber = Utilities.formatDate(now, "Asia/Karachi", "w");

  sheet.appendRow([
    timestamp, 
    current, 
    voltage, 
    power_kw, 
    energy_kwh, 
    dailyConsumption.toFixed(3), 
    weeklyConsumption.toFixed(3), 
    monthlyConsumption.toFixed(3), 
    yearlyConsumption.toFixed(3), 
    weekNumber
  ]);

  var dashboardSheet = spreadsheet.getSheetByName("Dashboard");
  if (!dashboardSheet) {
    dashboardSheet = spreadsheet.insertSheet("Dashboard");
    dashboardSheet.getRange("A1").setValue("Period");
    dashboardSheet.getRange("B1").setValue("Consumption (kWh)");
    dashboardSheet.getRange("A2").setValue("Daily");
    dashboardSheet.getRange("A3").setValue("Weekly");
    dashboardSheet.getRange("A4").setValue("Monthly");
    dashboardSheet.getRange("A5").setValue("Yearly");

    dashboardSheet.getRange("A6").setValue("Day Consumption (7am-7pm)");
    dashboardSheet.getRange("A7").setValue("Night Consumption (7pm-7am)");

    var pieChart = dashboardSheet.newChart()
      .setChartType(Charts.ChartType.PIE)
      .addRange(dashboardSheet.getRange("A1:B5"))
      .setPosition(10, 1, 0, 0)
      .setOption('title', 'Energy Consumption by Period')
      .setOption('width', 600)
      .setOption('height', 400)
      .build();
    dashboardSheet.insertChart(pieChart);

    dashboardSheet.getRange("A8").setValue("Select Period");
    dashboardSheet.getRange("B8").setDataValidation(SpreadsheetApp.newDataValidation().setAllowInvalid(false).requireValueInList(['Week', 'Month', 'Year'], true).build());

    dashboardSheet.getRange("A9").setValue("Start Date (YYYY-MM-DD)");
    dashboardSheet.getRange("A10").setValue("End Date (YYYY-MM-DD)");

    dashboardSheet.getRange("A12").setValue("Date/Period");
    dashboardSheet.getRange("B12").setValue("Total Units");

    var columnChart = dashboardSheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(dashboardSheet.getRange("A12:B12"))
      .setPosition(1, 1, 0, 0)
      .setOption('title', 'Units per Date/Period')
      .setOption('width', 600)
      .setOption('height', 400)
      .build();
    dashboardSheet.insertChart(columnChart);

    // Add the line graph for per day consumption
    dashboardSheet.getRange("C12").setValue("Date");
    dashboardSheet.getRange("D12").setValue("Daily Consumption (kWh)");
    var lineChart = dashboardSheet.newChart()
      .setChartType(Charts.ChartType.LINE)
      .addRange(dashboardSheet.getRange("C12:D12"))
      .setPosition(1, 6, 0, 0)
      .setOption('title', 'Daily Consumption Over Time')
      .setOption('width', 600)
      .setOption('height', 400)
      .build();
    dashboardSheet.insertChart(lineChart);
  }

  dashboardSheet.getRange("B2").setValue(dailyConsumption.toFixed(3));
  dashboardSheet.getRange("B3").setValue(weeklyConsumption.toFixed(3));
  dashboardSheet.getRange("B4").setValue(monthlyConsumption.toFixed(3));
  dashboardSheet.getRange("B5").setValue(yearlyConsumption.toFixed(3));

  var dayConsumption = calculateDayNightConsumption(sheet, now, 'day');
  var nightConsumption = calculateDayNightConsumption(sheet, now, 'night');
  dashboardSheet.getRange("B6").setValue(dayConsumption);
  dashboardSheet.getRange("B7").setValue(nightConsumption);

  return ContentService.createTextOutput(
    "Logged: " + timestamp + ", Current: " + current + " A, Voltage: " + voltage + " V, " +
    "Power: " + power_kw.toFixed(3) + " kW, Energy: " + energy_kwh.toFixed(6) + " kWh, " +
    "Daily: " + dailyConsumption.toFixed(3) + " kWh, Weekly: " + weeklyConsumption.toFixed(3) + " kWh, " +
    "Monthly: " + monthlyConsumption.toFixed(3) + " kWh, Yearly: " + yearlyConsumption.toFixed(3) + " kWh"
  );
}

function calculateConsumption(sheet, currentTime, period) {
  var lastRow = sheet.getLastRow();
  var data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 5).getValues() : [];

  var startDate;
  switch (period) {
    case "day":
      startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
      break;
    case "week":
      startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
      break;
    case "month":
      startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
      break;
    case "year":
      startDate = new Date(currentTime.getFullYear(), 0, 1);
      break;
    default:
      return "0";
  }

  var totalConsumption = 0;
  for (var i = 0; i < data.length; i++) {
    var rowDate = new Date(data[i][0]);
    var energy_kwh = parseFloat(data[i][4]) || 0;
    if (rowDate >= startDate && rowDate <= currentTime) {
      totalConsumption += energy_kwh;
    }
  }

  return totalConsumption.toFixed(3);
}

function calculateDayNightConsumption(sheet, currentTime, timeOfDay, periodOrStart, end) {
  if (periodOrStart === undefined) periodOrStart = 'Month';
  if (end === undefined) end = currentTime;

  var lastRow = sheet.getLastRow();
  var data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 5).getValues() : [];

  var startDate;
  if (periodOrStart instanceof Date) {
    startDate = periodOrStart;
  } else {
    switch (periodOrStart) {
      case 'Week':
        startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() - currentTime.getDay());
        break;
      case 'Month':
        startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), 1);
        break;
      case 'Year':
        startDate = new Date(currentTime.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
        break;
    }
  }

  var total = 0;
  for (var i = 0; i < data.length; i++) {
    var rowDate = new Date(data[i][0]);
    var energy_kwh = parseFloat(data[i][4]) || 0;
    var hour = rowDate.getHours();
    var isDay = (hour >= 7 && hour < 19);
    if (rowDate >= startDate && rowDate <= end && ((timeOfDay === 'day' && isDay) || (timeOfDay === 'night' && !isDay))) {
      total += energy_kwh;
    }
  }

  return total.toFixed(3);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("Update Dashboard")
    .addItem("Refresh Charts", "updateDashboard")
    .addToUi();
}

function updateDashboard() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Data");
  var dashboardSheet = spreadsheet.getSheetByName("Dashboard");
  var period = dashboardSheet.getRange("B8").getValue() || 'Month';
  var startDateStr = dashboardSheet.getRange("B9").getValue();
  var endDateStr = dashboardSheet.getRange("B10").getValue();

  var now = new Date();
  var startDate = startDateStr ? new Date(startDateStr) : null;
  var endDate = endDateStr ? new Date(endDateStr) : now;

  if (startDate && endDate) {
    var dayConsumption = calculateDayNightConsumption(sheet, now, 'day', startDate, endDate);
    var nightConsumption = calculateDayNightConsumption(sheet, now, 'night', startDate, endDate);
    dashboardSheet.getRange("B6").setValue(dayConsumption);
    dashboardSheet.getRange("B7").setValue(nightConsumption);
  } else {
    var dayConsumption = calculateDayNightConsumption(sheet, now, 'day', period);
    var nightConsumption = calculateDayNightConsumption(sheet, now, 'night', period);
    dashboardSheet.getRange("B6").setValue(dayConsumption);
    dashboardSheet.getRange("B7").setValue(nightConsumption);
  }

  var lastRow = sheet.getLastRow();
  var data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 5).getValues() : [];

  var groupedData = {};
  var groupedDaily = {};

  var startDateGroup;
  switch (period) {
    case 'Week':
      startDateGroup = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      break;
    case 'Month':
      startDateGroup = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'Year':
      startDateGroup = new Date(now.getFullYear(), 0, 1);
      break;
  }

  for (var i = 0; i < data.length; i++) {
    var rowDate = new Date(data[i][0]);
    if (rowDate >= startDateGroup && rowDate <= now) {
      var key;
      switch (period) {
        case 'Week':
          key = Utilities.formatDate(rowDate, "Asia/Karachi", "dd MMM yyyy");
          break;
        case 'Month':
          key = Utilities.formatDate(rowDate, "Asia/Karachi", "dd MMM yyyy");
          break;
        case 'Year':
          key = Utilities.formatDate(rowDate, "Asia/Karachi", "MMM yyyy");
          break;
        default:
          key = Utilities.formatDate(rowDate, "Asia/Karachi", "dd MMM yyyy");
          break;
      }
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key] += parseFloat(data[i][4]) || 0;

      var dailyKey = Utilities.formatDate(rowDate, "Asia/Karachi", "dd MMM yyyy");
      if (!groupedDaily[dailyKey]) {
        groupedDaily[dailyKey] = 0;
      }
      groupedDaily[dailyKey] += parseFloat(data[i][4]) || 0;
    }
  }

  // Clear from row 12 down for columns A and B
  var dashLastRow = dashboardSheet.getLastRow();
  var clearCount = dashLastRow - 11;
  if (clearCount > 0) {
    dashboardSheet.getRange(12, 1, clearCount, 2).clearContent();
  }

  // Clear from row 12 down for columns C and D
  if (clearCount > 0) {
    dashboardSheet.getRange(12, 3, clearCount, 2).clearContent();
  }

  dashboardSheet.getRange("A12").setValue("Date/Period");
  dashboardSheet.getRange("B12").setValue("Total Units");

  var row = 13;
  var keys = Object.keys(groupedData);
  keys.sort(function(a, b) {
    return new Date(a) - new Date(b);
  });
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    dashboardSheet.getRange(row, 1).setValue(key);
    dashboardSheet.getRange(row, 2).setValue(groupedData[key].toFixed(3));
    row++;
  }

  dashboardSheet.getRange("C12").setValue("Date");
  dashboardSheet.getRange("D12").setValue("Daily Consumption (kWh)");

  var dailyRow = 13;
  var dailyKeys = Object.keys(groupedDaily);
  dailyKeys.sort(function(a, b) {
    return new Date(a) - new Date(b);
  });
  for (var k = 0; k < dailyKeys.length; k++) {
    var key = dailyKeys[k];
    dashboardSheet.getRange(dailyRow, 3).setValue(key);
    dashboardSheet.getRange(dailyRow, 4).setValue(groupedDaily[key].toFixed(3));
    dailyRow++;
  }

  var charts2 = dashboardSheet.getCharts();
  for (var m = 0; m < charts2.length; m++) {
    var chart = charts2[m];
    var title = chart.getOptions().get('title');
    if (title === 'Units per Date/Period') {
      var builder = chart.modify();
      builder.setChartType(Charts.ChartType.COLUMN);
      builder.clearRanges();
      builder.addRange(dashboardSheet.getRange("A12:A" + (row - 1)));
      builder.addRange(dashboardSheet.getRange("B12:B" + (row - 1)));
      dashboardSheet.updateChart(builder.build());
    } else if (title === 'Daily Consumption Over Time') {
      var builder = chart.modify();
      builder.setChartType(Charts.ChartType.LINE);
      builder.clearRanges();
      builder.addRange(dashboardSheet.getRange("C12:C" + (dailyRow - 1)));
      builder.addRange(dashboardSheet.getRange("D12:D" + (dailyRow - 1)));
      dashboardSheet.updateChart(builder.build());
    }
  }
}
