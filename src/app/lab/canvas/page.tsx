import { getSavedNodePositions } from "@/app/actions";
import FlowCanvas from "@/components/flow-canvas";

import "@xyflow/react/dist/style.css";

async function Page() {
  const savedPositions = await getSavedNodePositions();
  return <FlowCanvas savedPositions={savedPositions} />;
}

export default Page;
