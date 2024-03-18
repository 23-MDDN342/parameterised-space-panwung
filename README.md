[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/DlFCTo_q)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=14046929&assignment_repo_type=AssignmentRepo)
### 2024 MDDN342 Project 1: Parameterised Space

I have developed this code far beyond the scope of this project. While the code can create a zoom background, it is capable of so much more.
The core inspiration behind this design is just a grid of cubes, which contain a raise height and an active flag. With these simple properties and some modular functionality within the grid system, many different designs are possible; the three that have been implemented are random propagations, where cubes move along the grid; Conway's game of life; and the sumbitted design, ripple, where active cubes oscillate up and down, affecting other cubes.

Ripple (FINAL): 
The ripple design consists of a few select cubes that oscillate up and down once per second, affecting nearby cubes that are within some distance from them. The distance between the active cubes and the nearby cubes depends how high they will be raised. All the active cubes have the same period. The max amplitude of oscillate is completely adjustable and can be done during runtime.

Colours are influenced by the height of the cube. The higher the cube, the more its colour tends towards white. The lower the cube, the more its colour tends towards yellow. The cubes are rendered without dimension to make them look like they are glowing.

Initially, the design was only meant to have a a single active cube in the grid's centre, but this behaviour has been expanded so now any cube can be set to active and have this effect. This can be done through the console with setActive(...) method.

Random Propagation:


This design was not submitted as the final because I found it difficult to loop given that cube movement is tied to the frame rate i.e. one frame is one "step".


Game Of Life:
The GoF design is based on John Conway's Game of Life, which is a simple cell evolution / simulation game. It follows the rules of GoF exactly as described, with dead cubes remaining 

This design was not submitted as the final since it is not a looping animtation and it may take longer than one second to complete.





EXAMPLE README 
Update this! 

This design is inspired by fireworks and flowers. I want it to be full of changes, so that every frame can have a fresh feeling.

In terms of concrete performance, I draw different geometric figures, let them spread out, and overlay their number at the same time, through the time difference to make the whole dynamic background become enthusiastic.

In terms of color, I made different shapes correspond to different colors, and changed the parameters so that they were different every time they appeared, so that there would be differences between different loops.

In the initial design, I only added the circle. Through the color change of the circle and the superposition of the movement track, although it has a good effect, I think it is too monotonous.

In the later stages, I added a lot of geometric shapes, which made the color and pattern more variable.
