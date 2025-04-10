// lib\websocket\websocket-manager.ts
export class WebSocketManager {
  private socket!: WebSocket;
  private messageHandlers: Array<(data: any) => void> = [];
  private errorHandlers: Array<(error: any) => void> = [];
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  public isConnected = false;
  private connectionStart: number | null = null; // Timestamp when connection opens
  
  constructor(private url: string) {
    this.connect();
  }
  
  private connect() {
    this.socket = new WebSocket(this.url);
  
    this.socket.onopen = () => {
      this.isConnected = true;
      this.connectionStart = Date.now(); // Record the time when the connection opens
      console.log("WebSocket connected");
      
      // Start heartbeat: send a keepalive every 30 seconds
      this.pingInterval = setInterval(() => {
        if (this.isConnected) {
          this.socket.send(JSON.stringify({ type: 'keepalive' }));
        }
      }, 30000);
    };
  
    this.socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        data = event.data;
      }
    
      console.log("Received message:", data);
    
      // if (Array.isArray(data)) {
      //   data.forEach((msg) => {
      //     this.messageHandlers.forEach((handler) => handler(msg));
      //   });
      // } else {
      //   this.messageHandlers.forEach((handler) => handler(data));
      // }

      // Simply call all registered message handlers with the data,
      // leaving it up to the handler to process arrays vs. single messages.
      this.messageHandlers.forEach((handler) => handler(data));
    };
  
    this.socket.onerror = (error) => {
      console.error("WebSocket error", error);
      this.errorHandlers.forEach((handler) => handler(error));
    };
  
    this.socket.onclose = () => {
      this.isConnected = false;
      console.log("WebSocket disconnected");
      
      // Log how long the connection was open, if available
      if (this.connectionStart !== null) {
        const duration = (Date.now() - this.connectionStart)/1000/60;
        console.log(`Connection was open for ${duration} minutes`);
      }
      
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      // Future improvement: implement reconnection logic here
    };
  }
  
  public send(data: any) {
    if (this.isConnected) {
      console.log("Sending message:", data);
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }
  
  public addMessageHandler(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
  }
  
  public addErrorHandler(handler: (error: any) => void) {
    this.errorHandlers.push(handler);
  }
  
  public disconnect() {
    this.socket.close();
  }
  
  /**
   * Returns the duration (in milliseconds) that the WebSocket has been open.
   * If the connection is closed, it returns the duration until the close event.
   */
  public getConnectionDuration(): number {
    if (this.connectionStart === null) {
      return 0;
    }
    return Date.now() - this.connectionStart;
  }
}
