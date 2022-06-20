import { useInterpret } from "@xstate/react";
import { actions, assign, createMachine, spawn } from "xstate";
import { send } from "xstate/lib/actions";

const { log } = actions;

const myMachine = createMachine(
  {
    id: "myMachine",
    entry: "spawnAnotherMachine",
    on: {
      DO_SOMETHING: {
        actions: [log("hello"), "logViaSpawnedMachine"]
      }
    }
  },
  {
    actions: {
      logViaSpawnedMachine: (ctx) => send("LOG", { to: ctx.anotherMachineRef })
    }
  }
);

const logMachine = createMachine({
  id: "logMachine",
  on: {
    LOG: {
      actions: log("hello from the log machine...")
    }
  }
});

export default function App() {
  const service = useInterpret(myMachine, {
    actions: {
      spawnLogMachine: assign({
        logMachineRef: () => spawn(logMachine)
      })
    },
    logger: console.info
  });

  return (
    <>
      <button onClick={() => service.send("DO_SOMETHING")}>Click here</button>
    </>
  );
}
