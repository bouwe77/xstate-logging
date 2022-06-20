import { useInterpret , useMachine} from "@xstate/react";
import { actions, assign, createMachine, spawn } from "xstate";
import { send } from "xstate/lib/actions";

const { log } = actions;

const myMachine = createMachine(
  {
    id: "myMachine",
    entry: "spawnLogMachine",
    on: {
      DO_SOMETHING: {
        actions: [log("hello"), "logViaSpawnedMachine"]
      }
    }
  },
  {
    actions: {
      logViaSpawnedMachine: (ctx) => {
        console.log(ctx.ref)
        return send("LOG", { to: ctx.ref })
      }
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
        ref: () => spawn(logMachine, 'mySpawnedLogMachine')
      })
    },
    logger: console.info
  });

  const [,send] = useMachine(logMachine)

  return (
    <>
      <button onClick={() => service.send("DO_SOMETHING")}>Click here</button>
      <button onClick={() => send("LOG")}>Log directly</button>
    </>
  );
}
