Name: Andrew Crowley
SID: 01400760

This was a fun final! I plan on polishing my submission over the break, making it more player-friendly,
but for now it fulfills the assignment's base requirements.

I used Jesse Heines' ScrabbleTile associative array to implement tile distribution and score values,
crediting him within source. Drawn tiles are random, and replace played tiles.
When the player has drawn the last tile from their tile bank, no further tiles are provided.

A player can drag and drop tiles to the board, but cannot remove set tiles.
This is intended, but maybe cruel from a game design standpoint!

Spelled words must start from the Star space. A space proceeding the Star won't enable as a
Droppable until its preceeding, left-adjacent space has a tile. When a space has a tile,
it's disabled for further input. This is to enforce the rules of Scrabble tile placement, but also
might not a user-friendly thing to do.

A user's word score is calculated appropriately, with multiplier spaces correctly applied.
Each word score - or round score - is added into a cross-round game score that is maintained until
the user starts a new game. The player's cross-round score, score from their previous round, and their
last-played word are displayed to a score box in the left-corner of the screen. This scorebox correctly updates,
clearing completely when the user starts a new game.

At the end of each round, the game board is cleared. The player may play as may rounds as they wish,
or until they run out of tiles. However, I didn't cover the case of a user's tile bank running dry.
I tested that it *can* happen, but as my submission is, a player won't know *when* this happens.
I didn't include a tile count in the game, or prompt the user to reset after their last tile had been played.
If a user gets to the point where they have no tiles, they need to assume to start a New Game themselves,
something I'll correct in my free time.

Word validation is also something I hadn't implemented. Any set of letters placed on the board is a valid word.
I'll also correct this post-finals.
