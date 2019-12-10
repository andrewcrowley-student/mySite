/* File: multiplication_table.js
 * Created: 11-14-2019
 * File Description: JavaScript layer of the Multiplication Table Widget.
 * Provides implementation for creating multiplication tables from two given ranges -
 * a multiplier and multiplicand range - and methods for validating range input.
 * COMP 4610-201 Assignment: Using the jQuery UI Slider and Tab Widgets
 * 
 * Andrew Crowley, UMass Lowell Computer Science, andrew_crowley@student.uml.edu
 * Copyright (c) 2019 by Andrew Crowley. All rights reserved.
*/

const MIN_TABLE_FACTOR = -50;
const MAX_TABLE_FACTOR = 50;
const MAX_TABLE_AXIS_RANGE = 101;

// Range input ids of form tableRangeForm
const RANGE_FORM_INPUT_IDS = {
    minMultiplier: "minMultiplier",
    maxMultiplier: "maxMultiplier",
    minMultiplicand: "minMultiplicand",
    maxMultiplicand: "maxMultiplicand"
}
Object.freeze(RANGE_FORM_INPUT_IDS);

// Text set to a range input's .errorLabel upon input value error
const RANGE_FORM_INPUT_VALUE_ERRORS = {
    valueEmpty: "Missing value",
    valueNotInteger: "Value is not an integer",
    lowerBoundGreaterThanUpper: "Lower bound > Upper Bound",
    maxRangeExceeded: "Range exceeds maximum of " + MAX_TABLE_AXIS_RANGE
};
Object.freeze(RANGE_FORM_INPUT_VALUE_ERRORS);

// Number of tables created by the user
var intTablesCreated = 0;

$(document).ready(function () {
    // Create the tabs widget.
    // Tabs consist of the range input tab
    // and the tabs of created times tables.
    $("#widgetTabs").tabs();

    // Remove a tab and its content when the tab's close icon is clicked
    $("#widgetTabs").tabs().on("click", "span.ui-icon-close", function () {
        var jQueryTabToRemove = $(this).closest(".tableTab");

        // Remove the tab's times table, then the tab
        $(jQueryTabToRemove.attr("href")).remove;
        $(jQueryTabToRemove).remove;
        $("#widgetTabs").tabs("refresh");
    });
    // Remove all table tabs and their content when the "Clear Tabs" button is clicked
    $("#tabClearButton").click(function () {
        $(".tableTab").each(function () {
            $($(this).attr("href")).remove;
            $(this).remove
        });
        $("#widgetTabs").tabs("refresh");
    });


    // Create the input tab's multiplier and multiplicand range sliders
    $(".rangeSlider").slider({
        range: true,
        min: MIN_TABLE_FACTOR,
        max: MAX_TABLE_FACTOR,
        // Handles created for the slider's lower and upper bound
        values: [MIN_TABLE_FACTOR, MAX_TABLE_FACTOR],
        animate: true,
        change: function (e, ui) {
            // Set a changed handle value to the handle's text
            $(ui.handle).text(ui.value);
        },
        slide: function (e, ui) {
            // Update a handle's text as it's being slid
            $(ui.handle).text(ui.value);
        }
    });
    // Set the initial text of each handle to its starting value
    $(".rangeSlider").each(function () {
        var arrSliderValues = $(this).slider("values");
        $(this).find(".ui-slider-handle").each(function (intHandleIndex) {
            $(this).text(arrSliderValues[intHandleIndex]);
        });
    });
    // When a handle changes value, set the value to its corresponding form input
    $(".rangeSlider").on("slidechange", function (e, ui) {
        var strSliderId = $(this).attr("id");

        // Note: Returned handle index is not zero-indexed
        var intHandleIndex = $(ui.handle).index() - 1;

        // Get the id of the handle's cooresponding form input
        var strInputId;
        switch (strSliderId) {
            case "multiplierSlider":
                if (intHandleIndex == 0) {
                    strInputId = RANGE_FORM_INPUT_IDS.minMultiplier;
                }
                else if (intHandleIndex == 1) {
                    strInputId = RANGE_FORM_INPUT_IDS.maxMultiplier;
                }
                break;
            case "multiplicandSlider":
                if (intHandleIndex == 0) {
                    strInputId = RANGE_FORM_INPUT_IDS.minMultiplicand;
                }
                else if (intHandleIndex == 1) {
                    strInputId = RANGE_FORM_INPUT_IDS.maxMultiplicand;
                }
                break;
            default:
                break;
        }
        // Set form input value as the slid handle's value
        $("#" + strInputId).val(ui.value);
        // Verify the input value
        verifyRangeInputValue(strInputId);
    });

    // When a range form input loses focus, verify the input's value
    $(".rangeInput").blur(function () {
        var strInputId = $(this).attr("id");

        var strSliderId;
        var intHandleIndex;
        if (verifyRangeInputValue(strInputId)) {
            switch (strInputId) {
                case RANGE_FORM_INPUT_IDS.minMultiplier:
                    strSliderId = "multiplierSlider";
                    intHandleIndex = 0;
                    break;
                case RANGE_FORM_INPUT_IDS.maxMultiplier:
                    strSliderId = "multiplierSlider";
                    intHandleIndex = 1;
                    break;
                case RANGE_FORM_INPUT_IDS.minMultiplicand:
                    strSliderId = "multiplicandSlider";
                    intHandleIndex = 0;
                    break;
                case RANGE_FORM_INPUT_IDS.maxMultiplicand:
                    strSliderId = "multiplicandSlider";
                    intHandleIndex = 1;
                    break;
            }
            $("#" + strSliderId).slider("values", intHandleIndex, $("#" + strInputId).val());
        }
    });

    // If each range form input has a valid value,
    // create a multiplication table from the input, writing the table to a new tab
    $("#tableFormSubmitButton").click(function () {
        var rangesValid = true;

        // Verify that each table range group was provided valid input values
        $(".rangeGroupWrapper").each(function () {
            var inputValuesValid = true;

            // Verify that the group's form input values are valid
            var strRangeGroupId = $(this).attr("id");
            $("#" + strRangeGroupId + " .rangeInput").each(function () {
                if (!verifyRangeInputValue($(this).attr("id"))) {
                    inputValuesValid = false;
                    rangesValid = false;
                }
            });

            // If each of the group's input values are valid,
            // verify that the range of the values does not exceed the maximum
            if (inputValuesValid) {
                var strIdLowerBound;
                var strIdUpperBound;
                switch (strRangeGroupId) {
                    case "multipliers":
                        strIdLowerBound = RANGE_FORM_INPUT_IDS.minMultiplier;
                        strIdUpperBound = RANGE_FORM_INPUT_IDS.maxMultiplier;
                        break;
                    case "multiplicands":
                        strIdLowerBound = RANGE_FORM_INPUT_IDS.minMultiplicand;
                        strIdUpperBound = RANGE_FORM_INPUT_IDS.maxMultiplicand;
                        break;
                }
                if (!verifyRange(strIdLowerBound, strIdUpperBound)) {
                    rangesValid = false;
                }
            }
        });

        // If both range groups are valid, create a times table from the ranges
        if (rangesValid) {
            createTimesTable(
                Number.parseInt($("#" + RANGE_FORM_INPUT_IDS.minMultiplier).val(), 10),
                Number.parseInt($("#" + RANGE_FORM_INPUT_IDS.maxMultiplier).val(), 10),
                Number.parseInt($("#" + RANGE_FORM_INPUT_IDS.minMultiplicand).val(), 10),
                Number.parseInt($("#" + RANGE_FORM_INPUT_IDS.maxMultiplicand).val(), 10)
            );
        }
    });
});

/**
 * Verifies the string value of a tableRangeForm input,
 * flagging the input as erroneous if the string is empty
 * or is uninterpretable as an integer.
 * 
 * @param {string} strRangeInputId id of tableRangeForm input
 * @returns {boolean} true if input value is valid
 * @returns {boolean} false if input value is invalid
 */
function verifyRangeInputValue(strRangeInputId) {
    // Clear any previously-flagged error on the input
    unflagRangeFormInput(strRangeInputId);

    // Get the input value
    var strFormInputValue = $("#" + strRangeInputId).val();
    // Verify that the input value is non-empty
    if (strFormInputValue == "") {
        flagRangeFormInput(strRangeInputId, RANGE_FORM_INPUT_VALUE_ERRORS.valueEmpty);
        return false;
    }
    // Verify that the input value is interpretable as an integer
    else if (isNaN(strFormInputValue) || (!Number.isInteger(Number(strFormInputValue)))) {
        flagRangeFormInput(strRangeInputId, RANGE_FORM_INPUT_VALUE_ERRORS.valueNotInteger);
        return false;
    }

    return true;
}

/**
 * Verifies that the lower and upper bound inputs from
 * a tableRangeForm input group produce a valid range.
 * 
 * A range is invalid if the lower bound is greater than the upper,
 * or if the range spans more than the table axis maxmimum.
 * @param {string} lowerBoundInputId id of tableRangeForm lower bound input
 * @param {string} upperBoundInputIdid id of tableRangeForm upper bound input
 * @returns {boolean} true if upper and lower bounds produce a valid range
 * @returns {boolean} false if produced range is invalid
 */
function verifyRange(lowerBoundInputId, upperBoundInputId) {
    lowerBound = Number.parseInt($("#" + lowerBoundInputId).val());
    upperBound = Number.parseInt($("#" + upperBoundInputId).val());

    // Verify that the lower bound is not greater than the upper
    if (lowerBound > upperBound) {
        flagRangeFormInput(lowerBoundInputId, RANGE_FORM_INPUT_VALUE_ERRORS.lowerBoundGreaterThanUpper);
        flagRangeFormInput(upperBoundInputId, RANGE_FORM_INPUT_VALUE_ERRORS.lowerBoundGreaterThanUpper);
        return false;
    }
    // Verify that the range is not greater than the maximum
    else if (upperBound - lowerBound > MAX_TABLE_AXIS_RANGE) {
        flagRangeFormInput(upperBoundInputId, RANGE_FORM_INPUT_VALUE_ERRORS.maxRangeExceeded);
        return false;
    }

    return true;
}

/**
 * Flags the tableRangeForm input with id strRangeInputId as erroneous,
 * styling the input with a light-red background to visually cue an error
 * and writing a contextual error message to the input's adjacent .errorLabel.
 * 
 * @param {string} strRangeInputId id of tableRangeForm input
 * @param {string} strErrorMsg message identifying the input value's error
 */
function flagRangeFormInput(strRangeInputId, strErrorMsg) {
    // Write error message to the label adjacent to the input
    $("#" + strRangeInputId + "ErrorLabel").text(strErrorMsg);
    // Change input's background color to further indicate error
    $("#" + strRangeInputId).css({
        "background-color": "#ff6666"
    });
}

/**
 * Clears all styling applied by flagRangeFormInput()
 * to the tableRangeForm input with id strRangeInputId,
 * also removing any text written to the input's adjacent .errorLabel.
 * 
 * @param {string} strRangeInputId id of tableRangeForm input
 * @param {string} strErrorMsg message identifying the input value's error
 */
function unflagRangeFormInput(strRangeInputId) {
    // Clear error message text from label adjacent to input
    $("#" + strRangeInputId + "ErrorLabel").text("");
    // Remove error-cuing background color from input styling
    $("#" + strRangeInputId).css({
        "background-color": ""
    });
}

/**
 * Creates a times table with rows and data built from
 * the multiplier and multiplicand range values of tableRangeForm inputs.
 * 
 * Each entry of the table is the product of its x and y table coordinates,
 * such that the x axis consists of multipliers and the y axis multiplicands.
 * 
 * The table is output to a tab titled with the table's order of creation.
 * @param {int} minMultiplier lower multiplier bound
 * @param {int} maxMultiplier upper multiplier bound
 * @param {int} minMultiplicand lower multiplicand bound
 * @param {int} maxMultiplicand upper multiplicand bound
 */
function createTimesTable(minMultiplier, maxMultiplier, minMultiplicand, maxMultiplicand) {
    // Build the table's set of multipliers
    var multipliers = [];
    var numMultipliers = maxMultiplier - minMultiplier + 1;
    for (var i = 0; i < numMultipliers; i++) {
        multipliers[i] = minMultiplier + i;
    }

    // Build the table's set of multiplicands
    var multiplicands = [];
    var numMultiplicands = maxMultiplicand - minMultiplicand + 1;
    for (var i = 0; i < numMultiplicands; i++) {
        multiplicands[i] = minMultiplicand + i;
    }

    var timesTable = document.createElement("table");
    timesTable.className = "timesTable";

    // Populate the first row with a blank cell, followed by the set of multipliers
    var tableRow = timesTable.insertRow();
    tableRow.insertCell().appendChild(document.createTextNode(""));
    for (var i = 0; i < numMultipliers; i++) {
        tableRow.insertCell().appendChild(document.createTextNode(multipliers[i]));
    }
    timesTable.appendChild(tableRow);

    // Populate the remainder of the table
    for (var i = 0; i < numMultiplicands; i++) {
        tableRow = timesTable.insertRow();
        var tableData;
        // Row population begins with j=-1 to assign multiplicands to the first column
        for (var j = -1; j < numMultipliers; j++) {
            tableData = tableRow.insertCell();
            // Place multiplicand i into the first column in the current row
            if (j == -1)
                tableData.appendChild(document.createTextNode(multiplicands[i]));
            // Place product of intersecting multiplier and multiplicand into the current cell
            else
                tableData.appendChild(document.createTextNode(multiplicands[i] * multipliers[j]));
        }
        // Append the populated row into the table
        timesTable.appendChild(tableRow);
    }
    // Update count of created times tables
    intTablesCreated++;

    // Tab entry to be appended to the tab widget
    strTableTabEntry = "<li class='tableTab'><a href='#table" + intTablesCreated + "'>Table #" + intTablesCreated + "</a>"
        + " <span class='ui-icon ui-icon-close'>Remove Tab</span></li>";

    // Find the tab widget's tab list, appending the new tab entry
    $("#widgetTabs").tabs().find(".ui-tabs-nav").append(strTableTabEntry);
    
    // Append the new tab's content div, containing the created times table, to the tab widget
    $("#widgetTabs").tabs().append("<div id='table" + intTablesCreated + "' class='timesTableWrapper'>"
        + timesTable.outerHTML + "</div>");
    $("#widgetTabs").tabs("refresh");
}
