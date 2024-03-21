[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/DlFCTo_q)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=14046929&assignment_repo_type=AssignmentRepo)


# 2024 MDDN342 Project 1: Parameterised Space
NOTE: Check Github commits for progress updates. If there is no title with the commit, it probably means it was a minor change.

The fundamental idea behind this design is just a grid of cubes, with two functionalities: they know how high they are and whether they are "active" or not. With these simple properties and some modular functionality within the grid system, many different designs are possible; the three that have been implemented are Random Propagation, Ripple, and Game of Life.

# Random Propagation:
The first design, Random Propagation, spawns cubes randomly which travel across the grid, raising nearby cubes as it travels (the height raised is based on its distance from all active cubes), until it reaches the end. These cubes can be set to rebound. The colouring is based on the height, where near the base level is blue and above is red. The overall effect looks like a heat map.

This design was not submitted as the final because I found it difficult to loop given that cube movement is tied to the frame rate i.e. one frame is one "step".

# Ripple (FINAL): 
The design that came after, Ripple, chooses some cubes to oscillate up and down once per second, making nearby cubes do the same in a wave movement. Like with Random Propagation, the amount each cube is raised is based on its distance from all active cubes, and its colour changes with height; with lowering being yellow and higher being white.

The initial design only had the central cube as the chosen cube, but this was expanded to allow for any cube to have this behaviour. These cubes can be chosen randomly or specifically using grid.setActive(...). 

# Game of Life:
The final design, Conway's game of life, is a simple cell evolution / simulation game. The design follows the rules set out by the game exactly. Dead cubes are lower in height than alive cubes. Colouring is very simple: dead cubes are dark grey, alive cubes are light grey, with no in between. The dimension has been turned on in order to make it easier to see.

This design was not submitted as the final since it is not a looping animtation and it may take longer than one second to complete.
