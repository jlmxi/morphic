// src/utils/event-bridge.ts
export class EventBridge {
  private id: string;
  private messageListeners: Map<string, (detail: any) => void> = new Map();
  private handleMessageBound: (event: MessageEvent) => void;

  constructor(id: string) {
    this.id = id;

    // Bind `handleMessage` to avoid creating multiple instances
    this.handleMessageBound = this.handleMessage.bind(this);

    // Register with the bridge-event-bus on the host page if available.
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'xi-register-listener', id: this.id }, '*');
      console.log('[EventBridge] Sent registration request to bridgeEventBus as:', this.id);
    } else {
      console.warn('[EventBridge] Not inside an iframe or bridgeEventBus is unavailable.');
    }

    // if (window.parent && (window.parent as any).bridgeEventBus) {
    //   (window.parent as any).bridgeEventBus.registerListener(this.id, window);
    //   console.log('[EventBridge] Registered with bridgeEventBus as:', this.id);
    // } else {
    //   console.warn('[EventBridge] Host page bridgeEventBus not available.');
    // }

    // Automatically listen for incoming messages.
    window.addEventListener('message', this.handleMessageBound);
  }

  private handleMessage(event: MessageEvent) {
    // Only process events with a type starting with "xi-"
    if (event.data && event.data.type && event.data.type.startsWith('xi-')) {
      // Optionally ignore events sent by this instance.
      if (event.data.senderId === this.id) return;
      const callback = this.messageListeners.get(event.data.type);
      if (callback) {
        console.log(`[EventBridge] Received event ${event.data.type} with detail:`, event.data.detail);
        callback(event.data.detail);
      }
    }
  }

  /**
   * Register a callback to be invoked when an event of the given type is received.
   * The event type must start with "xi-".
   */
  public on(eventType: string, callback: (detail: any) => void) {
    if (!eventType.startsWith('xi-')) {
      console.error('[EventBridge] Event type must start with "xi-":', eventType);
      return;
    }
    this.messageListeners.set(eventType, callback);
    console.log(`[EventBridge] Listener registered for event type: ${eventType}`);
  }

  /**
   * Sends an event to the host page via window.parent.postMessage.
   * The event type must start with "xi-".
   */
  public sendEvent(eventType: string, detail: any) {
    if (!eventType.startsWith('xi-')) {
      console.error('[EventBridge] Event type must start with "xi-":', eventType);
      return;
    }
    const message = { type: eventType, detail, senderId: this.id };
    console.log('[EventBridge] Sending event:', message);
    window.parent.postMessage(message, '*');
  }

  /**
   * Unregister this instance from the bridge-event-bus and remove the message listener.
   */
  public dispose() {
    console.log(`[EventBridge] Disposing ${this.id}`);

    // Notify the host page to unregister this listener
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'xi-unregister-listener', id: this.id }, '*');
      console.log(`[EventBridge] Sent xi-unregister-listener for ${this.id}`);
    } else {
      console.warn(`[EventBridge] Not in an iframe, skipping unregister postMessage.`);
    }

    // if (window.parent && (window.parent as any).bridgeEventBus) {
    //   (window.parent as any).bridgeEventBus.unregisterListener(this.id);
    //   console.log('[EventBridge] Unregistered from bridgeEventBus:', this.id);
    // }

    window.removeEventListener('message', this.handleMessageBound);
  }
}
