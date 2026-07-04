import { setup, assign, fromCallback } from 'xstate';
import script from '../config/demo-script.json';

interface DemoContext {
  currentSceneIndex: number;
  remainingTime: number;
  totalScenes: number;
}

const ticker = fromCallback(({ sendBack }) => {
  const interval = setInterval(() => {
    sendBack({ type: 'TICK' });
  }, 1000);
  return () => clearInterval(interval);
});

export const demoMachine = setup({
  types: {} as {
    context: DemoContext;
    events:
      | { type: 'START' }
      | { type: 'PAUSE' }
      | { type: 'RESUME' }
      | { type: 'NEXT' }
      | { type: 'PREV' }
      | { type: 'TICK' }
      | { type: 'SCENE_COMPLETE' }
      | { type: 'STOP' };
  },
  actors: {
    ticker
  },
  actions: {
    incrementScene: assign({
      currentSceneIndex: ({ context }) => Math.min(context.currentSceneIndex + 1, context.totalScenes - 1),
      remainingTime: ({ context }) => script[Math.min(context.currentSceneIndex + 1, context.totalScenes - 1)].duration / 1000,
    }),
    decrementScene: assign({
      currentSceneIndex: ({ context }) => Math.max(context.currentSceneIndex - 1, 0),
      remainingTime: ({ context }) => script[Math.max(context.currentSceneIndex - 1, 0)].duration / 1000,
    }),
    tickTime: assign({
      remainingTime: ({ context }) => Math.max(context.remainingTime - 1, 0),
    }),
    resetTime: assign({
      remainingTime: ({ context }) => script[context.currentSceneIndex].duration / 1000,
    })
  },
  guards: {
    isLastScene: ({ context }) => context.currentSceneIndex >= context.totalScenes - 1,
    timeExpired: ({ context }) => context.remainingTime <= 0
  }
}).createMachine({
  id: 'demo',
  initial: 'idle',
  context: {
    currentSceneIndex: 0,
    remainingTime: 0,
    totalScenes: script.length
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'playing',
          actions: ['resetTime']
        }
      }
    },
    playing: {
      invoke: {
        src: 'ticker'
      },
      always: {
        guard: 'timeExpired',
        target: 'scene_transition'
      },
      on: {
        PAUSE: 'paused',
        NEXT: 'scene_transition',
        PREV: {
          target: 'playing',
          actions: ['decrementScene']
        },
        TICK: {
          actions: ['tickTime']
        },
        SCENE_COMPLETE: 'scene_transition',
        STOP: 'idle'
      }
    },
    paused: {
      on: {
        RESUME: 'playing',
        STOP: 'idle'
      }
    },
    scene_transition: {
      always: [
        {
          guard: 'isLastScene',
          target: 'finished'
        },
        {
          target: 'playing',
          actions: ['incrementScene']
        }
      ]
    },
    finished: {
      on: {
        STOP: 'idle'
      }
    }
  }
});
