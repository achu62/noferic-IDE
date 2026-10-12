#jai sri ram
import turtle
screen = turtle.Screen()
screen.bgcolor("white")
t = turtle.Turtle()
t.color("black")
t.speed(0)
for i in range(0,360):
    t.circle(360-i)
    t.right(10)
turtle.done()

