export interface IMessagePort {
  postMessage(data: any): void
  onmessage: ((data: any) => void) | null
  close(): void
}

export interface IMessageChannel {
  port1: IMessagePort
  port2: IMessagePort
}

export class MessagePort implements IMessagePort {
  private _otherPort: MessagePort | null
  public onmessage: ((data: any) => void) | null = null
  private _closed = false

  constructor() {
    this._otherPort = null
    this.onmessage = null
  }

  public connect(otherPort: MessagePort): void {
    this._otherPort = otherPort
  }

  public postMessage(data: any): void {
    if (this._closed) {
      throw new Error("Cannot post message through a closed port")
    }
    if (!this._otherPort) {
      throw new Error("Port is not connected")
    }

    setTimeout(() => {
      if (this._otherPort?.onmessage && !this._otherPort._closed) {
        this._otherPort.onmessage(data)
      }
    }, 0)
  }

  public close(): void {
    this._closed = true
    this._otherPort = null
  }
}

export class MessageChannel implements IMessageChannel {
  public readonly port1: IMessagePort
  public readonly port2: IMessagePort

  constructor() {
    const port1 = new MessagePort()
    const port2 = new MessagePort()

    port1.connect(port2)
    port2.connect(port1)

    this.port1 = port1
    this.port2 = port2
  }
}
