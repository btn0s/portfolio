"use client";

import { TextHighlight } from "@/components/ui/text-highlight";
import { motion } from "motion/react";
import { TRANSITION_SECTION, VARIANTS_SECTION } from "@/config/variants";
import { Separator } from "@/components/ui/separator";
import { Lightbox } from "@/components/ui/lightbox";
import { CodeBlock } from "@/components/ui/code-block";
import React from "react";

// Game screenshots
import gameInterface from "@/assets/images/lab/321bang/game-interface.png";
import gameResults from "@/assets/images/lab/321bang/game-results.png";
import gameArchitecture from "@/assets/images/lab/321bang/game-architecture.png";

export const featured_item = {
  title: "321Bang",
  description: "A real-time multiplayer reaction game",
  image: gameInterface,
  link: "/lab/321bang",
};

const PageContent = () => {
  return (
    <>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4 max-w-xl py-10"
        layout
        key="bang-section-1"
      >
        <h1 className="text-xl font-medium mb-4">
          I built a real-time multiplayer reaction game that tests players'
          reflexes with millisecond precision
        </h1>

        <div className="w-full rounded-lg mb-6 overflow-hidden">
          <Lightbox
            src={gameInterface}
            alt="321Bang Game Interface showing the countdown screen with two players waiting for the BANG moment"
          />
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <h2>Overview</h2>

          <p>
            321Bang is a multiplayer reaction game I created to explore
            server-authoritative architecture in a competitive environment. The
            game challenges players to test their reflexes in a simple yet
            engaging format, while solving complex technical challenges behind
            the scenes.
          </p>

          <div className="mb-3 gap-2 text-xs flex flex-col">
            <strong>Project Type</strong>
            <span>Personal Exploration</span>
          </div>

          <div className="mb-3 gap-2 text-xs flex flex-col">
            <strong>Technologies</strong>
            <span>React, Node.js, Socket.IO, Redis</span>
          </div>

          <div className="mb-3 gap-2 text-xs flex flex-col">
            <strong>Timeline</strong>
            <span>6 weeks (nights & weekends)</span>
          </div>

          <Separator className="my-8" />

          <h2>Game Design</h2>
          <p>
            My primary goal was to create a{" "}
            <TextHighlight>simple, engaging game</TextHighlight> that would
            allow me to explore{" "}
            <TextHighlight>
              server-authoritative multiplayer architecture
            </TextHighlight>{" "}
            and its challenges.
          </p>

          <p>
            The game pits two players against each other in a test of reflexes:
            after joining a match, players watch a countdown, then race to tap
            the BANG button first when it appears.{" "}
            <TextHighlight>
              The fastest player wins the round in a best-of-five format.
            </TextHighlight>{" "}
            What makes this challenging is that the BANG moment comes after a
            random delay (3-6 seconds), so players can't simply time their
            clicks—they must genuinely react.
          </p>

          <div className="my-4 rounded-lg overflow-hidden">
            <Lightbox
              src={gameResults}
              alt="321Bang Game Results showing reaction times and round winner"
            />
          </div>

          <Separator className="my-8" />

          <h2>Technical Goals</h2>
          <p>
            My primary objective was to implement a{" "}
            <TextHighlight>truly fair multiplayer experience</TextHighlight>{" "}
            where:
          </p>
          <ul>
            <li>The server maintains authoritative control over game state</li>
            <li>Client-side prediction is minimized to prevent cheating</li>
            <li>
              Reaction times are measured with{" "}
              <TextHighlight>millisecond precision</TextHighlight>
            </li>
            <li>Network latency is accounted for in determining winners</li>
            <li>The experience feels responsive despite server authority</li>
          </ul>

          <CodeBlock
            language="typescript"
            value={`// Game state management
interface GameState {
  id: string;
  players: Player[];
  status: 'waiting' | 'countdown' | 'ready' | 'bang' | 'results';
  currentRound: number;
  rounds: Round[];
  winner: string | null;
  bangTimestamp: number | null;
}

// Core game types
interface Player {
  id: string;
  name: string;
  connected: boolean;
  ready: boolean;
  reactionTimes: number[];
  timeOffset: number; // Client-server time difference
  latency: number;    // Average network latency
}

interface Round {
  winner: string | null;
  playerReactions: {
    [playerId: string]: number; // reaction time in ms
  };
}`}
            className="my-6"
          />

          <Separator className="my-8" />

          <h2>Implementation</h2>
          <p>
            I built 321Bang using{" "}
            <TextHighlight>React for the frontend</TextHighlight> and{" "}
            <TextHighlight>Node.js with Socket.IO</TextHighlight> for real-time
            communication. The architecture includes:
          </p>
          <ul>
            <li>
              A matchmaking system that pairs players and creates isolated game
              instances
            </li>
            <li>Synchronized game state managed exclusively by the server</li>
            <li>
              Time synchronization between clients and server to normalize
              reaction measurements
            </li>
            <li>
              Anti-cheat mechanisms that validate client actions against server
              expectations
            </li>
            <li>
              Graceful handling of disconnections and reconnections mid-game
            </li>
          </ul>

          <div className="my-4 rounded-lg overflow-hidden">
            <Lightbox
              src={gameArchitecture}
              alt="321Bang Architecture Diagram showing server and client communication"
            />
          </div>

          <CodeBlock
            language="javascript"
            value={`// Server-side game loop
const startGameLoop = (gameId) => {
  const game = activeGames.get(gameId);
  if (!game || game.players.length !== 2) return;
  
  game.status = 'countdown';
  broadcastGameState(game);
  
  // Random delay between 3-6 seconds before showing BANG
  const bangDelay = 3000 + Math.floor(Math.random() * 3000);
  
  setTimeout(() => {
    game.status = 'ready';
    broadcastGameState(game);
    
    setTimeout(() => {
      game.status = 'bang';
      game.bangTimestamp = Date.now();
      broadcastGameState(game);
      
      // Set timeout to end round if no one clicks
      game.timeoutId = setTimeout(() => {
        endRound(game, null); // No winner
      }, 5000);
    }, bangDelay);
  }, 3000); // 3 second countdown
};`}
            className="my-6"
          />

          <h2>Challenges & Solutions</h2>
          <p>
            The biggest challenge was{" "}
            <TextHighlight>
              ensuring fairness despite varying network conditions
            </TextHighlight>
            . I implemented a time synchronization protocol that:
          </p>
          <ul>
            <li>
              Establishes client-server time offset through multiple ping
              measurements
            </li>
            <li>
              Adjusts reaction time calculations based on each player's network
              latency
            </li>
            <li>
              Uses server timestamps as the single source of truth for all game
              events
            </li>
          </ul>

          <CodeBlock
            language="javascript"
            value={`// Client-side time synchronization
const syncTime = () => {
  // Send 5 pings to get accurate measurement
  const pings = [];
  
  const sendPing = (count = 0) => {
    if (count >= 5) {
      // Calculate average latency
      const avgLatency = pings.reduce((sum, p) => sum + p, 0) / pings.length;
      socket.emit('finalize-sync', { avgLatency });
      return;
    }
    
    const start = Date.now();
    socket.emit('ping', { clientTime: start });
    
    socket.once('pong', ({ serverTime }) => {
      const end = Date.now();
      const latency = end - start;
      pings.push(latency);
      
      // Calculate client-server time offset
      const clientTime = end - (latency / 2);
      const offset = clientTime - serverTime;
      
      // Store offset locally
      setTimeOffset(offset);
      
      // Continue with next ping
      setTimeout(() => sendPing(count + 1), 100);
    });
  };
  
  sendPing();
};`}
            className="my-6"
          />

          <CodeBlock
            language="javascript"
            value={`// Server-side reaction time calculation
socket.on('player-reaction', ({ clientTime, gameId, playerId }) => {
  const game = activeGames.get(gameId);
  if (!game || game.status !== 'bang' || !game.bangTimestamp) return;
  
  const player = game.players.find(p => p.id === playerId);
  if (!player) return;
  
  // Adjust client time using stored offset and latency
  const adjustedClientTime = clientTime - player.timeOffset;
  
  // Calculate reaction time
  const reactionTime = adjustedClientTime - game.bangTimestamp;
  
  // Validate reaction time is reasonable
  if (reactionTime < 0 || reactionTime > 2000) {
    // Potential cheating attempt
    socket.emit('error', { message: 'Invalid reaction time' });
    return;
  }
  
  // Record reaction time
  recordPlayerReaction(game, playerId, reactionTime);
  
  // Check if all players have reacted
  checkRoundCompletion(game);
});`}
            className="my-6"
          />

          <p>
            Another significant challenge was{" "}
            <TextHighlight>preventing cheating</TextHighlight>. Since reaction
            games are particularly susceptible to exploitation, I implemented
            several anti-cheat measures:
          </p>
          <ul>
            <li>Server-side validation of all reaction times</li>
            <li>
              Detection of suspicious patterns (e.g., consistently superhuman
              reaction times)
            </li>
            <li>Randomized delays to prevent prediction</li>
            <li>Encrypted communication to prevent packet sniffing</li>
          </ul>

          <Separator className="my-8" />

          <h2>Results</h2>
          <p>
            Building 321Bang taught me valuable lessons about{" "}
            <TextHighlight>
              real-time multiplayer game development
            </TextHighlight>
            :
          </p>
          <ul>
            <li>
              The critical importance of time synchronization in competitive
              games
            </li>
            <li>
              How to balance server authority with responsive client experiences
            </li>
            <li>
              Techniques for mitigating network latency in time-sensitive
              applications
            </li>
            <li>
              Approaches to prevent common cheating vectors in multiplayer games
            </li>
            <li>
              The value of simple game mechanics that create engaging
              experiences
            </li>
          </ul>

          <p>
            The most rewarding outcome was seeing friends compete against each
            other, with reaction time differences of just{" "}
            <TextHighlight>5-10 milliseconds</TextHighlight> determining
            winners. The game successfully created those "just one more round"
            moments that make simple games addictive.
          </p>

          <p>
            I've since applied these learnings to other real-time applications,
            particularly the techniques for time synchronization and latency
            compensation, which have proven valuable even in non-gaming
            contexts.
          </p>

          <h2>Key Takeaways</h2>
          <p>If I were to continue developing 321Bang, I would focus on:</p>
          <ul>
            <li>Adding support for more than two players</li>
            <li>
              Implementing a global leaderboard with reaction time statistics
            </li>
            <li>Creating tournament functionality for organized competition</li>
            <li>Adding visual distractions to increase difficulty</li>
            <li>Developing a mobile app version with haptic feedback</li>
          </ul>

          <p>
            The core architecture is solid and scalable, making these
            enhancements relatively straightforward to implement on the existing
            foundation.
          </p>
        </div>
      </motion.section>
    </>
  );
};

export default React.memo(PageContent);
