import BaseCover from "./BaseCover.js";

interface MessageOptions {}

class Message extends BaseCover {
  key;
  private options: MessageOptions;
  open(options: MessageOptions): void {
    this.options = options;
  }

  constructor() {
    super();
    this.key = `message-${Math.random().toString(36).slice(2)}`;
  }
}

export default Message;
