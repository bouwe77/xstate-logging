import { useInterpret, useMachine } from "@xstate/react";
import { actions, assign, createMachine, spawn } from "xstate";

const { log, send } = actions;

const myMachine = createMachine(
  {
    id: "myMachine",
    entry: "spawnLogMachine",
    on: {
      DO_SOMETHING: {
        actions: [log("Hello from myMachine"), "logViaSpawnedMachine"]
      }
    }
  },
  {
    actions: {
      logViaSpawnedMachine: send("LOG", { to: (ctx) => ctx.ref })
    }
  }
);

const logMachine = createMachine({
  id: "logMachine",
  on: {
    LOG: {
      actions: [log("hello from logMachine...")]
    }
  }
});

export default function App() {
  const service = useInterpret(myMachine, {
    actions: {
      spawnLogMachine: assign({
        ref: () => spawn(logMachine, "mySpawnedLogMachine")
      })
    },
    logger: (str) => console.info(str)
  });

  const [, send] = useMachine(logMachine, {
    logger: (str) => console.error(str)
  });

  return (
    <>
      <button onClick={() => service.send("DO_SOMETHING")}>
        Log through myMachine
      </button>
      <button onClick={() => send("LOG")}>
        Log directly from the logMachine
      </button>
    </>
  );
}
