[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/DlFCTo_q)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=14046929&assignment_repo_type=AssignmentRepo)


# 2024 MDDN342 Project 1: Parameterised Space
The fundamental idea behind this design is just a grid of cubes, with two functionalities: they know how high they are and whether they are "active" or not. With these simple properties and some modular functionality within the grid system, many different designs are possible; the three that have been implemented are Random Propagation, Ripple, and Game of Life.

# Random Propagation:
The first design, Random Propagation, spawns cubes randomly which travel across the grid, raising nearby cubes as it travels (the height raised is based on its distance from all active cubes), until it reaches the end. These cubes can be set to rebound. The colouring is based on the height, where near the base level is blue and above is red. The overall effect looks like a heat map.

This design was not submitted as the final because I found it difficult to loop given that cube movement is tied to the frame rate i.e. one frame is one "step".

# Ripple (FINAL): 
The design that came after, Ripple, chooses some cubes to oscillate up and down once per second, making nearby cubes do the same in a wave movement. Like with Random Propagation, colour changes with height, with lowering being yellow and higher being white.

The initial design only had the central cube as the chosen cube, but this was expanded to allow for any cube to have this behaviour. These cubes can be chosen randomly or specifically using grid.setActive(...). 

The submitted design 









#### OLD #####

, where cubes move along the grid; Conway's game of life; and the sumbitted design, ripple, where active cubes oscillate up and down, affecting other cubes.


# Game of Life:
... is rendered with depth to make it easier to see

# Ripple (FINAL): 
The ripple design consists of a few select cubes that oscillate up and down once per second, affecting nearby cubes that are within some distance from them. The distance between the active cubes and the nearby cubes depends how high they will be raised. All the active cubes have the same period. The max amplitude of oscillate is completely adjustable and can be done during runtime.

Colours are influenced by the height of the cube. The higher the cube, the more its colour tends towards white. The lower the cube, the more its colour tends towards yellow. The cubes are rendered without dimension to make them look like they are glowing.

Initially, the design was only meant to have a a single active cube in the grid's centre, but this behaviour has been expanded so now any cube can be set to active and have this effect. This can be done through the console with setActive(...) method.




# Game Of Life:
The GoL design is based on John Conway's Game of Life, which is a simple cell evolution / simulation game. It follows the rules of GoL exactly as described. Dead cubes are lower than alive cubes.

Colouring is very simple: dead cubes are dark grey, alive cubes are light grey, with no in between. The dimension has been turned on in order to make it easier to see.

This design was not submitted as the final since it is not a looping animtation and it may take longer than one second to complete.