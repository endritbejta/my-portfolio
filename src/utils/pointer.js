/**
 * One shared source of pointer movement for the whole page.
 *
 * The dot background, the cursor dot and the footer eyes all want the cursor
 * position. Each registering its own `mousemove` listener means the browser
 * dispatches (and the page runs) the same event three times over, so they
 * subscribe here instead: a single listener on the window feeds every
 * subscriber, and it is attached only while there is at least one.
 *
 * Handlers get the original event, so they read `clientX`/`clientY` (or
 * `target`) exactly as they would from their own listener. Call the returned
 * function to unsubscribe.
 */
const moveHandlers = new Set();
const leaveHandlers = new Set();

const dispatchMove = (event) => {
  for (const handler of moveHandlers) handler(event);
};

const dispatchLeave = (event) => {
  for (const handler of leaveHandlers) handler(event);
};

const subscribe = (handlers, handler, attach, detach) => {
  handlers.add(handler);
  if (handlers.size === 1) attach();

  return () => {
    handlers.delete(handler);
    if (handlers.size === 0) detach();
  };
};

/** The cursor moved. */
export const onPointerMove = (handler) =>
  subscribe(
    moveHandlers,
    handler,
    () => window.addEventListener("mousemove", dispatchMove),
    () => window.removeEventListener("mousemove", dispatchMove)
  );

/** The cursor left the page. */
export const onPointerLeave = (handler) =>
  subscribe(
    leaveHandlers,
    handler,
    () => document.addEventListener("mouseleave", dispatchLeave),
    () => document.removeEventListener("mouseleave", dispatchLeave)
  );
