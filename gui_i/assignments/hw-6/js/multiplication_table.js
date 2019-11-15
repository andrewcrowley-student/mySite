/* File: multiplication_table.js
 * Created: 11-14-2019
 * File Description: JavaScript layer of the Multiplication Table widget.
 * Provides methods for generating and writing a table element
 * populated with the products of an input, incremental range of
 * multipliers and multiplicands.
 * COMP 4610-201 Assignment: Creating an Interactive Dynamic Table
 * 
 * Andrew Crowley, UMass Lowell Computer Science, andrew_crowley@student.uml.edu
 * Copyright (c) 2019 by Andrew Crowley. All rights reserved.
*/

// Maximum axis range of the generated table
var MAX_RANGE = 100;

// timesTableForm text input ids
var INPUT_FORM_IDS = ["minMultiplier", "maxMultiplier", "minMultiplicand", "maxMultiplicand"];

/*
 * Populates table timesTable with rows and data built from
 * the multiplier and multiplicand ranges input to form timesTableForm.
 * 
 * Returns true if timesTable was populated,
 * false if timesTableForm input was erroneous.
*/
function populateTimesTable() {
    // Clear pre-existing timesTable contents
    clearTimesTable();
    // Clear error hints for previous input
    clearErrorHints();

    // If either multiplier or multiplicand range inputs are invalid, don't populate timesTable
    multiplierRangeValid = validateRangeInput("minMultiplier", "maxMultiplier");
    multiplicandRangeValid = validateRangeInput("minMultiplicand", "maxMultiplicand")
    if (!multiplierRangeValid || !multiplicandRangeValid)
        return false;

    var minMultiplicand = Number.parseInt(document.getElementById("minMultiplicand").value);
    var maxMultiplicand = Number.parseInt(document.getElementById("maxMultiplicand").value);
    var minMultiplier = Number.parseInt(document.getElementById("minMultiplier").value);
    var maxMultiplier = Number.parseInt(document.getElementById("maxMultiplier").value);

    // Generate the table's set of multipliers
    var multipliers = []
    var numMultipliers = maxMultiplier - minMultiplier + 1;
    for (var i = 0; i < numMultipliers; i++)
        multipliers[i] = minMultiplier + i;

    // Generate the table's set of multiplicands
    var multiplicands = [];
    var numMultiplicands = maxMultiplicand - minMultiplicand + 1;
    for (var i = 0; i < numMultiplicands; i++)
        multiplicands[i] = minMultiplicand + i;

    var timesTable = document.createElement("table");
    timesTable.id = "timesTable";

    // Populate the first row with a blank cell, followed by the set of multipliers
    var tableRow = timesTable.insertRow();
    tableRow.insertCell().appendChild(document.createTextNode(""));
    for (var i = 0; i < numMultipliers; i++)
        tableRow.insertCell().appendChild(document.createTextNode(multipliers[i]));
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

/*
 * Validates a pair of lower and upper bound inputs from timesTableForm,
 * verifying that both inputs hold Integer values
 * and that the greater bound is not less than the lower.
 * 
 * If the inputs are a valid range, true is returned.
 * If not, erroneous inputs are marked with an error hint and false is returned.
*/
function validateRangeInput(lowerBoundId, upperBoundId) {
    // Validate the individual string of both bounds' input values
    lowerBoundValid = validateInput(lowerBoundId);
    upperBoundValid = validateInput(upperBoundId);
    if (!lowerBoundValid || !upperBoundValid)
        return false;

    var lowerBound = Number.parseInt(document.getElementById(lowerBoundId).value);
    var upperBound = Number.parseInt(document.getElementById(upperBoundId).value);

    // Verify that the lower bound is not greater than the upper bound
    if (lowerBound > upperBound) {
        onInputError(lowerBoundId, "Lower bound > Upper bound");
        onInputError(upperBoundId, "Upper bound < Lower bound");
        return false;
    }

    // Reject a range greater than the max-accepted table axis length
    else if (upperBound - lowerBound + 1 > MAX_RANGE) {
        onInputError(lowerBoundId, "Range exceeds max of " + MAX_RANGE);
        onInputError(upperBoundId, "Range exceeds max of " + MAX_RANGE);
        return false;
    }

    return true;
}

/*
 * Checks if form input with id inputId
 * contains a string that can represent an Integer.
 * 
 * If the input is valid, true is returned.
 * If not, the erroneous input is marked with an error hint, then false is returned.
*/
function validateInput(inputId) {
    var inputValue = document.getElementById(inputId).value;
    // Verify that the input value contains a string
    if (inputValue.length == 0) {
        onInputError(inputId, "Missing input!");
        return false;
    }
    // Verify that the input string is interpretable as an Integer
    else if (isNaN(inputValue) || !Number.isInteger(Number(inputValue))) {
        onInputError(inputId, "Input is not an integer!");
        return false;
    }

    return true;
}

/*
 * Marks erroneous form input inputId
 * with a light-red background color and
 * a hint message contextual to its error.
*/
function onInputError(inputId, errorMessage) {
    // Write error hint to span adjacent to input
    document.getElementById(inputId + "ErrorLabel").innerHTML = errorMessage;
    console.log(inputId + "ErrorLabel")
    // Change input's background color to hint the error
    document.getElementById(inputId).style.backgroundColor = "#ff6666"
}

/*
 * Clears error hints on all input fields,
 * removing background color from the fields
 * and any hint text in their adjacent spans.
*/
function clearErrorHints() {
    for (var i = 0; i < INPUT_FORM_IDS.length; i++) {
        document.getElementById(INPUT_FORM_IDS[i]).style.backgroundColor = "";
        document.getElementById(INPUT_FORM_IDS[i] + "ErrorLabel").innerHTML = "";
    }
}

/*
 * Clears existing children of table timesTable.
*/
function clearTimesTable() {
    var timesTable = document.getElementById("timesTable");
    if (timesTable != null)
        document.getElementById("timesTableWrapper").removeChild(timesTable);
}
