/* File: multiplication_table.js
 * Created: 11-14-2019
 * File Description: JavaScript layer of the Multiplication Table widget.
 * Provides methods for generating a table element,
 * populated with the products of an incremental
 * multiplier and multiplicand range.
 * COMP 4610-201 Assignment: Using the jQuery Validation Plugin with Your Dynamic Table
 * 
 * Andrew Crowley, UMass Lowell Computer Science, andrew_crowley@student.uml.edu
 * Copyright (c) 2019 by Andrew Crowley. All rights reserved.
*/

// Max value range of each times table axis
const MAX_AXIS_RANGE = 100;

// timesTableForm input ids 
const TIMES_TABLE_INPUT_IDS = {
    minMultiplier: "minMultiplier",
    maxMultiplier: "maxMultiplier",
    minMultiplicand: "minMultiplicand",
    maxMultiplicand: "maxMultiplicand"
}
Object.freeze(TIMES_TABLE_INPUT_IDS);

// timesTableForm input value error messages
const TIMES_TABLE_INPUT_ERROR_MSGS = {
    valueEmpty: "Missing value",
    valueNotInteger: "Value is not an integer",
    lowerBoundGreaterThanUpper: "Lower bound > Upper Bound",
    maxRangeExceeded: "Range exceeds maximum of " + MAX_AXIS_RANGE
};
Object.freeze(TIMES_TABLE_INPUT_ERROR_MSGS);


// ready event prevents jQuery method execution before document has loaded
$(function () {
    // Verify the value of a timesTableForm input after the input loses focus
    $(".rangeInput").blur(function () {
        unflagRangeFormInput($(this).attr("id"));
        verifyRangeFormInput($(this).attr("id"));
    });

    // Generate times table for valid form input values on tableFormSubmit button click
    $("#tableFormSubmitButton").click(function () {
        var inputIsValid = true;

        // Clear any existing times table entries
        clearTimesTable();

        // Verify that each form input value is valid
        $(".rangeInput").each(function () {
            strRangeInputId = $(this).attr("id");
            if (!verifyRangeFormInput($(this).attr("id"))) {
                inputIsValid = false;
            }
        });
        // If input values are valid, verify that the
        // multiplier and multiplicand ranges defined by input are valid
        if (inputIsValid) {
            var rangeIsValid = true;
            // Verify the multipler range
            if (!verifyRange("minMultiplier", "maxMultiplier")) {
                rangeIsValid = false;
            }
            // Verify the multiplicand range
            if (!verifyRange("minMultiplicand", "maxMultiplicand")) {
                rangeIsValid = false;
            }

            // If both ranges are valid, generate the times table
            if (rangeIsValid) {
                populateTimesTable(
                    Number.parseInt($("#" + TIMES_TABLE_INPUT_IDS.minMultiplier).val(), 10),
                    Number.parseInt($("#" + TIMES_TABLE_INPUT_IDS.maxMultiplier).val(), 10),
                    Number.parseInt($("#" + TIMES_TABLE_INPUT_IDS.minMultiplicand).val(), 10),
                    Number.parseInt($("#" + TIMES_TABLE_INPUT_IDS.maxMultiplicand).val(), 10)
                );
            }
        }
    });
});

/**
 * Populates table timesTable with rows and data built from
 * the multiplier and multiplicand range values of timesTableForm inputs.
 * 
 * Each entry of the table is the product of its x and y table coordinates,
 * such that the x axis consists of multipliers and the y axis multiplicands.
 * 
 * @param {int} minMultiplier lower multiplier bound
 * @param {int} maxMultiplier upper multiplier bound
 * @param {int} minMultiplicand lower multiplicand bound
 * @param {int} maxMultiplicand upper multiplicand bound
 */
function populateTimesTable(minMultiplier, maxMultiplier, minMultiplicand, maxMultiplicand) {
    // Generate the table's set of multipliers
    var multipliers = [];
    var numMultipliers = maxMultiplier - minMultiplier + 1;
    for (var i = 0; i < numMultipliers; i++) {
        multipliers[i] = minMultiplier + i;
    }

    // Generate the table's set of multiplicands
    var multiplicands = [];
    var numMultiplicands = maxMultiplicand - minMultiplicand + 1;
    for (var i = 0; i < numMultiplicands; i++) {
        multiplicands[i] = minMultiplicand + i;
    }

    var timesTable = document.createElement("table");
    timesTable.id = "timesTable";

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
    document.getElementById("timesTableWrapper").appendChild(timesTable);
}

/**
 * Verifies the string value of a timesTableForm input,
 * flagging the input as erroneous if the string is empty
 * or is not interpretable as an integer.
 * 
 * @param {string} strRangeInputId id of timesTableForm input
 * @returns {boolean} true if input value is valid
 * @returns {boolean} false if input value is invalid
 */
function verifyRangeFormInput(strRangeInputId) {
    // Get the input's value
    var strFormInputValue = $("#" + strRangeInputId).val();
    // Verify that the input's value is non-empty
    if (strFormInputValue.length == 0) {
        flagRangeFormInput(strRangeInputId, TIMES_TABLE_INPUT_ERROR_MSGS.valueEmpty);
        return false;
    }
    // Verify that the input's value is interpretable as an integer
    else if (isNaN(strFormInputValue) || (!Number.isInteger(Number(strFormInputValue)))) {
        flagRangeFormInput(strRangeInputId, TIMES_TABLE_INPUT_ERROR_MSGS.valueNotInteger);
        return false;
    }

    return true;
}

/**
 * Verifies that the lower and upper bound inputs from
 * a range group of timesTableForm produce a valid range.
 * 
 * A range is invalid if the lower bound is greater than the upper,
 * or if the range spans more than 100 integers.
 * @param {string} lowerBoundInputId
 * @param {string} upperBoundInputId
 * @returns {boolean} true if upper and lower bounds produce a valid range
 * @returns {boolean} false if produced range is invalid
 */
function verifyRange(lowerBoundInputId, upperBoundInputId) {
    lowerBound = Number.parseInt($("#" + lowerBoundInputId).val());
    upperBound = Number.parseInt($("#" + upperBoundInputId).val());

    // Verify that the lower bound is not greater than the upper
    if (lowerBound > upperBound) {
        flagRangeFormInput(lowerBoundInputId, TIMES_TABLE_INPUT_ERROR_MSGS.lowerBoundGreaterThanUpper);
        flagRangeFormInput(upperBoundInputId, TIMES_TABLE_INPUT_ERROR_MSGS.lowerBoundGreaterThanUpper);
        return false;
    }
    // Verify that the range is not greater than the maximum
    else if (upperBound - lowerBound > MAX_AXIS_RANGE) {
        flagRangeFormInput(upperBoundInputId, TIMES_TABLE_INPUT_ERROR_MSGS.maxRangeExceeded);
        return false;
    }

    return true;
}

/**
 * Flags the timesTableForm input with id strRangeInputId as erroneous,
 * styling the input with a light-red background to visually cue an error
 * and writing a contextual error message to the input's adjacent .errorLabel.
 * 
 * @param {string} strRangeInputId id of timesTableForm input
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
 * to the timesTableForm input with id strRangeInputId,
 * also removing any text written to the input's adjacent .errorLabel.
 * 
 * @param {string} strRangeInputId id of timesTableForm input
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
 * Clears existing children of table timesTable.
*/
function clearTimesTable() {
    var timesTable = document.getElementById("timesTable");
    if (timesTable != null) {
        document.getElementById("timesTableWrapper").removeChild(timesTable);
    }
}
