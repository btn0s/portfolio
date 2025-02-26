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
        className="flex flex-col gap-4 max-w-xl py-10"
      >
        <h1 className="text-xl font-medium mb-4">
          A bridge system that enabled seamless modernization—delivering new
          features in a legacy system without a rewrite
        </h1>

        <div className="w-full rounded-lg mb-6 overflow-hidden">
          <Lightbox src={coverImage} alt="TimeMachine Bridge System" />
        </div>

        <div className="prose prose-sm prose-invert max-w-none">
          <h2>Overview</h2>

          <p>
            American Express needed to modernize a critical Angular 1.x system
            that processed millions of daily interactions without disruption.
          </p>
          <p>
            I designed TimeMachine, a bridge system enabling incremental React
            adoption while maintaining business continuity.
          </p>

          <div className="mb-3 flex items-center gap-2 text-xs">
            <strong>My Role:</strong>
            <span>Project Lead, Software Engineer II</span>
          </div>

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
            The existing Angular 1.x system at American Express was critical but
            aging. Any downtime would impact millions of customer interactions
            and business operations. A complete rewrite was too risky, but
            modernization was essential.
          </p>

          <p>
            We needed to adopt React incrementally while keeping the Angular app
            fully operational and maintaining product velocity.
          </p>

          <h2>The Hypothesis</h2>
          <p>
            I theorized we could run React alongside Angular in the same browser
            by leveraging two key capabilities:
          </p>

          <ul>
            <li>
              React's ability to run in a shadow DOM with an isolated root
            </li>
            <li>
              React Portals for mounting components outside the React hierarchy
            </li>
          </ul>

          <p>
            This approach would allow React to run invisibly in the shadow DOM
            while mounting components directly into the Angular app. With a
            shared event system, both frameworks could maintain synchronized
            state.
          </p>

          <h2>Technical Solutions</h2>

          <h3>Shadow DOM Isolation</h3>
          <p>
            I ran React inside the Shadow DOM to create an invisible parallel
            environment that could exist alongside the legacy Angular app
            without interfering with it. This approach let React operate behind
            the scenes while only exposing components where needed.
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

          <h3>Cross-Framework Communication</h3>
          <p>
            I built a global event bus on <InlineCode>window</InlineCode> that
            served as a universal messaging system between Angular and React,
            allowing them to share data without direct dependencies.
          </p>

          <CodeBlock
            language="typescript"
            value={`// Event bus implementation
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

          <h3>Preventing Stale State</h3>
          <p>
            React's functional components created a risk of stale closures. I
            implemented a pattern using <InlineCode>useCallback</InlineCode> to
            ensure event handlers always referenced the latest state, preventing
            race conditions.
          </p>

          <CodeBlock
            language="typescript"
            value={`function Component() {
  const handleEvent = useCallback((data) => {
    setState(prevState => ({ ...prevState, ...data }));
  }, []);
  
  useEffect(() => {
    return eventBus.subscribe('angular-event', handleEvent);
  }, [handleEvent]);
}`}
          />

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

          <h2>TimeMachine: The Bridge System</h2>
          <p>
            TimeMachine enabled gradual modernization without disruption. Teams
            could ship React features immediately while maintaining existing
            Angular functionality. This approach delivered:
          </p>

          <ul>
            <li>Zero downtime during modernization</li>
            <li>Continuous feature development without pausing for rewrites</li>
            <li>Organic React adoption that aligned with product velocity</li>
          </ul>

          <h3>Key Components</h3>

          <h4>1. Shadow DOM Container</h4>
          <p>
            Created an invisible runtime for React that coexisted with Angular
            without disrupting the existing application. This allowed React to
            operate in the background while selectively exposing UI only where
            needed.
          </p>

          <h4>2. React Portals</h4>
          <p>
            Enabled React components to render directly within Angular
            templates, allowing precise placement and gradual replacement of UI
            elements.
          </p>

          <CodeBlock
            language="tsx"
            value={`// Portal component for Angular integration
function AngularPortal({ selector, children }) {
  const targetRef = useRef(document.querySelector(selector));
  return targetRef.current ? createPortal(children, targetRef.current) : null;
}`}
          />

          <h4>3. Global Event System</h4>
          <p>
            Created a decoupled communication layer that allowed both frameworks
            to share data and events without tight coupling.
          </p>

          <p>
            What made TimeMachine powerful was its simplicity. It required no
            management approval for a rewrite and no disruption to product
            roadmaps. Engineers could adopt React incrementally, and the
            migration happened organically as new features were built.
          </p>

          <Separator className="my-8" />

          <h2>Results</h2>
          <p>TimeMachine enabled American Express to:</p>

          <ul>
            <li>Launch a new vertical market without modernization delays</li>
            <li>Maintain 100% system uptime throughout the transition</li>
            <li>Gradually shift to React without a disruptive rewrite</li>
            <li>
              Create a reusable pattern for other teams facing similar
              challenges
            </li>
          </ul>

          <p>
            This approach proved that legacy modernization doesn't require
            choosing between business continuity and technical evolution. With
            the right architecture, you can build for the future while
            preserving what works today.
          </p>
        </div>
      </motion.section>
    </>
  );
};

export default PageContent;
