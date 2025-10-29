import BaseCover from "./BaseCover.js";

interface MessageOptions {}

class Message extends BaseCover {
  key;
  private options: MessageOptions;

  constructor(options: MessageOptions) {
    super();
    this.options = options;
    this.key = `message-${Math.random().toString(36).slice(2)}`;
  }
  open() {}
}

export default Message;
