"use client";

import { motion } from "motion/react";
import { TRANSITION_SECTION, VARIANTS_SECTION } from "@/config/variants";
import { Separator } from "@/components/ui/separator";
import { Lightbox } from "@/components/ui/lightbox";
import Mermaid from "@/components/mermaid";
import { CodeBlock } from "@/components/ui/code-block";
import { InlineCode } from "@/components/ui/inline-code";
import coverImage from "@/assets/images/work/time-machine/cover.png";

const PageContent = () => {
  return (
    <>
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
        className="flex flex-col gap-4 max-w-4xl py-10"
      >
        <h1 className="text-xl font-medium mb-4">
          A bridge system that enabled seamless modernization—delivering new
          features in a legacy system without a rewrite
        </h1>

        <div className="aspect-video w-full rounded-lg mb-6 overflow-hidden">
          <Lightbox src={coverImage} alt="TimeMachine Bridge System" />
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <h2>Overview</h2>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <strong>My Role:</strong>
            <span>Project Lead, Software Engineer II</span>
          </div>

          <p>
            American Express needed to modernize a legacy system without
            disrupting the business. I designed a bridge system that enabled
            incremental modernization and delivered new features that were used
            to bring on a new vertical market.
          </p>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <strong>Team:</strong>
            <span>10 engineers, 300+ CCPs</span>
          </div>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <strong>Timeline:</strong>
            <span>6 months</span>
          </div>

          <Separator className="my-8" />

          <h2>The Challenge</h2>
          <p>
            Anyone who's been a software engineer has experienced the pain of
            modernizing a legacy system. Engineers asking for rewrites are often
            met with resistance.
          </p>
          <p>
            This was the reality for the engineering team at American Express.
            The existing system, built in Angular 1.x, processed millions of
            interactions per day—any downtime would have massive business and
            customer experience implications.
          </p>

          <p>
            A complete rewrite wasn't an option. But modernization was critical.
            The engineering team needed a way to incrementally adopt React while
            keeping the Angular app running smoothly—without slowing product
            velocity.
          </p>

          <h2>The Hypothesis</h2>
          <p>
            Knowing that a rewrite would be a massive undertaking, I started
            exploring ways to incrementally modernize the system. Fairly quickly
            I began to wonder if it would be possible to run React alongside
            Angular in the same browser.
          </p>
          <p>
            A few things about React and the DOM made me think it might be
            possible.
          </p>
          <ul>
            <li>
              React apps run in the shadow DOM and are then given a root div to
              mount into.
            </li>
            <li>
              React also provides a native way to mount components outside of
              the React hierarchy.
            </li>
          </ul>

          <p>
            So in theory it seemed possible to run React invisibly (in the
            shadow DOM) and then mount the components we wanted into the Angular
            app where they should live. The Angular app could feed data to the
            React app and as long as we used a Flux-like architecture all the
            React components would be in sync.
          </p>

          <p>This was the hypothesis. What were the risks?</p>

          <h2>Challenges & Solutions</h2>

          <h3>Embedding React Inside Angular Without Conflicts</h3>
          <p>
            The first issue was how to embed a React app into an existing
            Angular system without breaking styles, scripts, or execution flow.
          </p>

          <p>
            The solution: run React inside the Shadow DOM. This created a
            self-contained environment where React could operate without
            interfering with Angular's global styles or scripts.
          </p>

          <CodeBlock
            language="typescript"
            value={`// Create shadow DOM and mount React
const shadowRoot = document.createElement('div');
document.body.appendChild(shadowRoot);
const shadow = shadowRoot.attachShadow({ mode: 'open' });

ReactDOM.render(<App />, shadow);`}
          />

          <Mermaid
            id="shadow-dom-diagram"
            title="Shadow DOM + React Portals"
            source={`
          flowchart TD
            subgraph Angular
              A[Angular Component] -->|Contains| D[Empty Div Placeholder]
            end

            subgraph React Shadow DOM
              P[React Portal] -->|Mounts into| D
              C[React Component] -->|Renders within| P
            end
        `}
          />

          <h3>Making Angular and React Communicate</h3>
          <p>
            The second major challenge: how do Angular and React talk to each
            other? They had separate component trees, separate event systems,
            and no shared state.
          </p>

          <p>
            We needed a universal messaging system. Instead of tightly coupling
            them, we built a global event bus on
            <InlineCode>window</InlineCode>—acting as a shared communication
            layer between both frameworks.
          </p>

          <CodeBlock
            language="typescript"
            value={`// Simple event bus implementation
const eventBus = {
  dispatch: (event, data) => window.dispatchEvent(
    new CustomEvent(event, { detail: data })
  ),
  subscribe: (event, callback) => {
    const handler = e => callback(e.detail);
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }
};`}
          />

          <p>
            This event bus worked similarly to the browser's native event
            system, allowing Angular and React to dispatch and listen for events
            without direct dependencies.
          </p>

          <Mermaid
            id="event-bus-diagram"
            title="Event Bus Communication"
            source={`
          flowchart TD
            subgraph Global Event Bus
              EB[Window Event Listener]
            end

            subgraph Angular
              AC[Angular Component] -->|Dispatches| EB
              AD[Angular Listener] -->|Subscribes to| EB
            end

            subgraph React
              RC[React Component] -->|Dispatches| EB
              RH[React Listener] -->|Subscribes to| EB
            end
        `}
          />

          <h3>Preventing Stale State & Event Issues</h3>
          <p>
            React's functional components use closures, meaning event handlers
            could reference outdated state if not managed correctly. This led to
            stale event listeners and inconsistencies between Angular and React
            updates.
          </p>

          <CodeBlock
            language="typescript"
            value={`function Component() {
  // Prevent stale closures with useCallback
  const handleEvent = useCallback((data) => {
    setState(prevState => ({ ...prevState, ...data }));
  }, []);
  
  useEffect(() => {
    return eventBus.subscribe('angular-event', handleEvent);
  }, [handleEvent]);
}`}
          />

          <p>
            We solved this by using <InlineCode>useMemo</InlineCode> and
            <InlineCode>useCallback</InlineCode> to ensure event handlers always
            referenced the latest state. This prevented race conditions and
            guaranteed reliable data flow.
          </p>

          <Mermaid
            id="react-memoization-diagram"
            title="React Memoization Fix"
            source={`
          sequenceDiagram
            participant R as React Component
            participant H as Handler Function
            participant E as Event Bus

            R->>H: Registers useCallback Handler
            H->>E: Subscribes to Global Event
            E->>H: Dispatches Event
            H->>R: Updates State via useMemo
        `}
          />

          <h2>The Solution: TimeMachine</h2>
          <p>
            At its core, TimeMachine wasn't just a technical fix—it was a
            mindset shift. It proved that modernization didn't have to mean
            stopping everything and starting over. Instead, we could layer the
            new on top of the old, using existing infrastructure as a foundation
            for the future rather than something to be discarded.
          </p>

          <p>
            TimeMachine worked because it was designed for gradual evolution.
          </p>

          <p>
            It let teams ship React-powered features immediately—without waiting
            for a full migration. Angular components could still function as
            they always had, but over time, new development naturally shifted
            toward React. This meant:
          </p>

          <ul>
            <li>Zero downtime. Existing functionality was untouched.</li>
            <li>
              No immediate rewrites. Engineers didn't have to halt progress
              while reworking foundational systems.
            </li>
            <li>
              A migration path that fit within product velocity. React adoption
              wasn't disruptive—it happened organically.
            </li>
          </ul>

          <p>Under the hood, TimeMachine consisted of three key innovations:</p>

          <h3>A Shadow DOM container for React</h3>
          <ul>
            <li>
              Ensured isolation, preventing conflicts with Angular's global
              styles or execution flow.
            </li>
            <li>
              Allowed React to function as a self-contained environment,
              rendering independently while still being present in the same DOM.
            </li>
          </ul>

          <h3>React Portals to bridge the two worlds</h3>
          <ul>
            <li>
              Enabled React to mount components inside Angular templates, giving
              us the ability to place new UI elements anywhere in the existing
              app without hacking around Angular's structure.
            </li>
            <li>
              Allowed for progressive replacement—React components could
              gradually replace Angular ones without breaking anything.
            </li>
          </ul>

          <CodeBlock
            language="tsx"
            value={`// Portal component to inject React into Angular DOM
function AngularPortal({ selector, children }) {
  const targetRef = useRef(document.querySelector(selector));
  return targetRef.current ? createPortal(children, targetRef.current) : null;
}`}
          />

          <h3>A global event system for seamless communication</h3>
          <ul>
            <li>
              Allowed Angular and React to share data, actions, and events via
              the browser's window object.
            </li>
            <li>
              Created a decoupled architecture, ensuring neither framework had
              to know about the internals of the other.
            </li>
            <li>
              Used <InlineCode>useMemo</InlineCode> and{" "}
              <InlineCode>useCallback</InlineCode> in React to prevent stale
              event listeners and race conditions.
            </li>
          </ul>

          <p>
            What made TimeMachine different from other modernization strategies
            was that it required no buy-in beyond the engineers using it. There
            was no need to ask leadership for a full rewrite, no need to
            convince product teams to stop feature work. It just worked. Over
            time, as React components naturally replaced Angular ones, the
            migration happened almost invisibly.
          </p>

          <Separator className="my-8" />

          <h2>Conclusion: A Blueprint for the Future</h2>
          <p>
            TimeMachine proved that modernization doesn't have to be an
            all-or-nothing effort. The industry often frames legacy systems as
            something to escape from, but in reality, they are systems that
            work—they just need a way forward.
          </p>

          <p>This approach became a repeatable pattern beyond our team:</p>

          <ul>
            <li>
              It showed that React and Angular could coexist indefinitely if
              needed, meaning no hard deadlines or rewrites.
            </li>
            <li>
              It provided a framework for adopting modern tools incrementally,
              reducing risk while still making forward progress.
            </li>
            <li>
              It laid the foundation for other teams at American Express to
              follow a similar migration strategy, accelerating adoption without
              disruption.
            </li>
          </ul>

          <p>
            By the time I left, TimeMachine had enabled the successful launch of
            a new vertical market—without any of the usual modernization pain.
            It wasn't just about making React work in an Angular app. It was
            about proving that with the right approach, you don't have to stop
            building to evolve.
          </p>
        </div>
      </motion.section>
    </>
  );
};

export default PageContent;
