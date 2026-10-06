# How I Built Basketball Empire

## 1. Who I Am

Hi, I’m Aaron. I’m a Year 8 student.

I really enjoy playing basketball. I also like playing Monopoly with my friends and family.

Recently, I started learning about AI and how it can help people create things.

Then I had an idea:

**Could I use AI to build my own basketball board game?**

That was how Basketball Empire started.

## 2. The First Idea

I wanted to combine the parts I liked about basketball and Monopoly.

In Monopoly, you buy properties, collect rent and trade with other players.

In my game, you buy basketball teams, recruit players and earn points from other teams.

Instead of building houses and hotels, you improve your team by recruiting better players.

The player with the most points at the end becomes the champion.

## 3. Designing the Game

At first, I thought creating the rules would be easy.

It was not.

I had to decide:

- What every block on the board should do
- How much each team should cost
- How much another player should pay when landing on it
- How auctions should work
- How players could trade
- How someone could win or become bankrupt

Some rules sounded good when I wrote them down, but they were not fun when we actually played.

I had to keep changing them.

## 4. Building It with Codex

I used Codex to help turn my ideas into code.

I did not simply say, “Make the whole game.”

I gave it one task at a time.

For example:

> Let four players join the same room.

> Make the pieces move one block at a time.

> Show the name of the player who owns a team.

> Start an auction when someone does not buy a team.

Codex helped write the code, but I still had to explain the idea, test the result and decide what needed to change.

I learned that AI gives better results when my instructions are clear and specific.

## 5. Things Went Wrong

A lot of things broke while I was building the game.

Sometimes the Create Room button did not work.

Sometimes a Mac could open the game, but a phone could not connect.

At one point, the game declared the wrong player as the champion.

The Recruit button also stopped working, and the game history appeared on top of the auction screen.

When something broke, I took a screenshot and explained:

- What I clicked
- What I expected to happen
- What actually happened

Then I worked with Codex to find and fix the problem.

I discovered that fixing bugs can take longer than building the first version of a feature.

## 6. Putting the Game Online

At first, Basketball Empire only worked on my own computer.

The address was `localhost`, which meant that my friends could not play from their homes.

I used GitHub to save the code and keep a history of the changes.

Then I experimented with servers and Tailscale so that another device could connect to the game.

My test was simple:

1. Create a room on my computer.
2. Join the room from another phone.
3. Roll the dice.
4. Check whether both devices show the same result.

When it worked for the first time, the game stopped feeling like a school experiment. It felt like a real online game.

## 7. Buying a Domain

The temporary server address was long and difficult to remember.

I wanted the game to have a proper name and address, so I registered the domain:

**hoopire.com**

Buying the domain was only the first step.

I also had to learn about DNS, HTTPS and how to connect the domain to the server.

I learned that:

- The domain is the address.
- DNS tells the browser where to go.
- The server is where the game runs.
- HTTPS makes the connection secure.

These were things I had never thought about when visiting websites before.

## 8. Checking the Visitors

After putting the website online, I wanted to know whether anyone was actually visiting it.

I learned how to check the daily views.

I could see things such as:

- How many people opened the website
- Which days had the most visitors
- Whether they used a phone or a computer
- Which pages they visited

At the moment, the website has received **[add your real number] views**.

The numbers help me understand whether people are interested and whether a new change brings more players.

I do not need to collect their real names. Anonymous visitor numbers are enough.

## 9. What I Learned

Before this project, I had never built a complete multiplayer website.

I did not know every step when I started.

I began with one idea, then made one screen, one room and one playable turn.

Every problem showed me what I needed to learn next.

This project taught me that AI does not replace the person creating something.

I still needed to:

- Come up with the idea
- Design the rules
- Explain each feature
- Test the game
- Find the problems
- Decide whether the result was fun

Basketball Empire is still not finished.

I still have more ideas, more bugs to fix and more things to learn.

But now it is a real game that my friends can play.

And it started with one question:

**Could I use AI to build my own game?**
