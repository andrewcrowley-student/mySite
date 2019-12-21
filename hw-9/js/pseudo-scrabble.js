/* File: pseudo-scrabble.js
 * COMP 4610-201 Assignment: Implementing a Bit of Scrabble with Drag-and-Drop
 * Created: 12-16-2019
 * File Description: Behavior layer of the Pseudo-Scrabble game page,
 * implemetning the game's functionality.
 * 
 * Tile drag and drop is implemented using the JQuery UI Sortable and Droppable
 * widgets respectively.
 * Requires JQuery 3.4.1 and JQuery UI 1.11.
 *
 * 
 * ScrabbleTiles associative array is defined in Scrabble_Pieces_AssociativeArray_Jesse.js,
 * and is Copyright (c) 2015 Jesse M. Heines, UMass Lowell Computer Science, heines@cs.uml.edu
 * 
 * Andrew Crowley, UMass Lowell Computer Science, andrew_crowley@student.uml.edu
 * Copyright (c) 2019 by Andrew Crowley. All rights reserved.
*/

// Image resource directory
const IMG_DIR = "./images";
// Directory containing Scrabble tile images
const TILE_IMG_DIR = IMG_DIR + "/tiles";

// Maximum number of tiles allowed on the tile tray at once
const TILE_TRAY_CAPACITY = 7;


// ScrabbleTile keys of undepleted letter tiles
var arrRemainingTileKeys;

// Current game round
var intRoundCount = 0;
// Player's score across rounds
var intGameScore = 0;
// Player's previous round score
var intRoundScore = 0;
// Player's previous round word; empty String if their word was invalid
var strRoundWord = "";

$(document).ready(function () {
    // Set the game board spaces as JQuery UI Draggable drop targets
    $(".boardSpace").droppable({
        // Only game tiles should be played to board spaces
        accept: ".gameTile",
        // A board space enables when a tile is played to its preceeding, left-adjacent space
        disabled: true,
        // Callback function for when a tile is placed to an enabled board space
        drop: function (event, ui) {
            var jQueryDraggedTile = $(ui.draggable);
            // Remove JQuery UI Sortable helper class and CSS from the placed tile element
            jQueryDraggedTile.removeClass("ui-sortable-helper");
            jQueryDraggedTile.css({
                'z-index': '',
                'left': '',
                'top': ''
            });

            // Fix the tile to the board space
            $(this).append(jQueryDraggedTile.prop("outerHTML"));

            // Disable this board space for tile placement
            $(this).droppable("option", "disabled", true);
            // Enable the proceeding, right-adjacent board space for tile placement
            $(this).next(".boardSpace").droppable("option", "disabled", false);

            // Remove the placed tile from the tile tray
            jQueryDraggedTile.remove();

            // Attempt to draw a replacement tile from the tile bank
            $("#tileTray").append(generateGameTileHTML(drawRandomGameTile()));
        }
    });
    // The starting space is the only space initially enabled
    $("#startSpace").droppable("option", "disabled", false);

    /* Set game tiles on the game tray as draggable elements
     * that can be rearranged on the tile tray
    */
    $("#tileTray").sortable();

    /* When a player clicks the "New Game" button,
     * clear the scorebox of the previous game's records,
     * replenishing all drawn tiles before starting the first round
    */
    $("#newGameButton").on("click", function () {
        // Initialize the scoreboard's values
        intRoundCount = 0;
        intGameScore = 0;
        strRoundWord = "";
        updateScoreboardWithRoundResults();

        // Clear the tile tray of any pre-exisiting game tiles
        var jQueryTileTray = $("#tileTray");
        jQueryTileTray.empty();

        // Replenish the tile bank
        for (tileLetter in ScrabbleTiles) {
            ScrabbleTiles[tileLetter]["number-remaining"]
                = ScrabbleTiles[tileLetter]["original-distribution"];
        }
        // Replenish the array of unused tiles' keys
        arrRemainingTileKeys = Object.keys(ScrabbleTiles);

        // Draw the player's starting tiles to the tile tray
        for (i = 0; i < TILE_TRAY_CAPACITY; i++) {
            jQueryTileTray.append(generateGameTileHTML(drawRandomGameTile()));
        }

        intRoundScore = 0;
        startNewRound();
    });

    /* Validate then score the player's board,
     * updating the scorebox with the round's results before starting the next round.
    */
    $("#scoreWordButton").on("click", function () {
        if (intRoundCount >= 1) {
            scoreRoundBoard();
            startNewRound();
        }
    });
});

/**
 * Scores the word played to the Scrabble board,
 * updating the scorebox with the player's round score and total score.
 */
function scoreRoundBoard() {
    var strTileLetter;
    var strTileImageFilepath;
    var intTileScore;
    var intWordMultiplier = 1;

    // To-do: Word validation

    /* Score a validated word by summing each of its tile's values,
     * checking beneath each tile for a letter/word multiplier.
     *
     * Letter multipliers are applied to a tile's value immediately;
     * word multipliers are applied once the value of each tile has been determined.
    */
    $(".boardSpace .gameTile img").each(function() {
        // Parse the placed tile's image file for its letter 
        strTileImageFilepath = $(this).attr("src");
        strTileLetter = strTileImageFilepath.match(/([A-Z]|Blank).jpg/)[0].replace(".jpg", "");

        // Blank tile has no score value, but should be displayed as '_' in the scorebox results
        if (strTileLetter.match("Blank")) {
            strTileLetter = "_";
        }
        // Add the value of a non-Blank tile to the word's score
        else if (strTileLetter.match(/[A-Z]/)) {
            intTileScore = ScrabbleTiles[strTileLetter]["value"];
            // Double the tile's score if the tile was placed on a "Double Letter Score" space
            if ($(this).parent().parent().hasClass("doubleLetterSpace")) {
                intTileScore *= 2;
            }
            // Add the tile's score to the round score
            intRoundScore += intTileScore;
        }
        // Double the word score multiplier if the tile was placed on a "Double Word Score" space
        if ($(this).parent().parent().hasClass("doubleWordSpace")) {
            intWordMultiplier *= 2;
        }

        // Append the tile's letter to build the String of the played word
        strRoundWord += strTileLetter;
    });
    // Add the round score to the player's total score
    intGameScore += intRoundScore * intWordMultiplier;

    // Update the scorebox with the round word, round score and new total score
    updateScoreboardWithRoundResults();
}

/**
 * Begins a new round of Scrabble, initializing the game board and updating round-based records.
 */
function startNewRound() {
    // Update the scoreboard's round count
    $("#roundCount").text((++intRoundCount).toString(10));

    // Clear the previous round's word and score
    strRoundWord = "";
    intRoundScore = 0;

    // Clear the game board of the previous round's tiles
    $(".boardSpace").each(function () {
        $(this).empty();
    });

    // Disable all board spaces as Droppables but the first
    $(".boardSpace").droppable("option", "disabled", true);
    $("#startSpace").droppable("option", "disabled", false);
}

/**
 * Updates the game scorebox with the player's game and round-end records.
 * To be called at the start of a new game, or the end of a round following word scoring.
 */
function updateScoreboardWithRoundResults() {
    $("#gameScore").text(intGameScore.toString(10));
    $("#roundScore").text(intRoundScore.toString(10));
    $("#roundWord").text(strRoundWord.toString(10));
}

/**
 * Generates the HTML for a Scrabble game tile of the argument letter.
 * 
 * Elements created from generated HTML are li elements with class .gameTile.
 * .gameTile elements wrap image files of their respective Scrabble tile.
 * 
 * @param {String} strTileLetter Scrabble tile letter A-Z, or _ for the blank tile
 * @returns {String} HTML of .gameTile li for the argument tile letter
 * @returns {String} empty String if argument tile letter is invalid
 */
function generateGameTileHTML(strTileLetter) {
    var strGameTileHTML = "";

    // Find the filepath of the argument letter key's tile image file
    var strTileImageFilepath = "";
    // Letter key "_" indicates the Blank tile, whose image file is Scrabble_Tile_Blank.jpg
    if (strTileLetter == "_") {
        strTileImageFilepath = TILE_IMG_DIR + "/Scrabble_Tile_Blank.jpg";
    }
    else if (strTileLetter.match(/[A-Z]/)) {
        strTileImageFilepath = TILE_IMG_DIR + "/Scrabble_Tile_" + strTileLetter + ".jpg";
    }

    // If an image filepath was found for the argument letter key,
    // build the HTML of that key's respective game tile
    if (strTileImageFilepath != "") {
        strGameTileHTML = "<div class='gameTile'>"
            + "<img src='" + strTileImageFilepath + "' alt='" + strTileLetter + " Tile'>"
            + "</div>";
    }

    return strGameTileHTML;
}

/**
 * Attemtps to draw from the remaining tiles of the ScrabbleTile tile bank,
 * returning the letter of the drawn tile.\
 * 
 * @returns {String} letter of tile drawn
 * @returns {String} empty String if no tiles remain
 */
function drawRandomGameTile() {
    var strDrawnTileKey = "";

    // If tiles remain, pick a key of a remaining tile pseudo-randomly
    if (arrRemainingTileKeys.length > 0) {
        // Select a key from the remaining possible tile keys
        strDrawnTileKey = arrRemainingTileKeys[(Math.floor(Math.random() * arrRemainingTileKeys.length))];

        // Decrement the number of the key's tiles remaining
        var intTilesOfKeyLeft = ScrabbleTiles[strDrawnTileKey]["number-remaining"] - 1;
        ScrabbleTiles[strDrawnTileKey]["number-remaining"] = intTilesOfKeyLeft;

        // If no tiles of the key remain, remove it from the set of remaining tile keys
        if (intTilesOfKeyLeft == 0) {
            arrRemainingTileKeys.splice(arrRemainingTileKeys.indexOf(strDrawnTileKey), 1);
        }
    }

    return strDrawnTileKey;
}
