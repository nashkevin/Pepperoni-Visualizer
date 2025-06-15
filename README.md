# Pepperoni Visualizer

Pepperoni Visualizer is a simple visual tool for placing pepperoni (or any
equivalent circular topping) on a pizza. More to the point, it's my way of
using a fun project to answer a question that I had one evening while making
pizza from scratch:

> Is there an elegant way to arrange an arbitrary number of toppings and to
know ahead of time the maximum number that would fit in this arrangement, given
only the relative diameters of pizza base and topping?

It's easy enough to estimate a theoretical maximum, since you can calculate the
area of the pizza and the total area of your toppings. In reality though, I
wasn't just marching from one side to the other placing an adjoining piece if
it would fit. Standing in my kitchen, I noticed that there was some
subconscious logic in what I was doing. I was trying to make it look
presentable, which meant that I had some unknown definition of what presentable
was. Could I play with angles and radii to come up with an algorithm that would
figure it out?

## Technologies

As for the tech, these days the code I write is rarely meant for web browsers,
so I also wanted to challenge myself. There are truly countless JavaScript
libraries in existence and powerful tools to abstract away much of the basic
setup, but this project uses only the standard HTML/CSS/JS trifecta with no
imported libraries or templates.

## Using It

Using [Pepperoni Visualizer](https://nashkevin.github.io/Pepperoni-Visualizer/)
is quite simple. You can move the sliders to adjust the parameters of your
pizza, and the preview will update automatically. The initial design defined
three parameters:

* Pizza size
* Number of pepperoni
* Pepperoni size

though I may add further complexity in the future.

## To-Do

* Fix "flickering" ring distribution
* Allow pepperoni count increases to adjust other sliders as needed to fit
* Report parameter values with units
* Make mobile friendly
