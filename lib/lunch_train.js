import PassengerList from './passenger_list';

const MESSAGE_PREFIX = '!';

export default class LunchTrain {
  constructor(message) {
    this.client = message.client;
    this.channel = message.channel;
    this.conductor = message.author;

    this.state = {
      start: false,
      close: false,
      left: false,
      time: null
    };

    this.passengerList = new PassengerList(this.channel);
    this.client.on('message', msg => this.listen(msg));
  }

  listen(message) {
    if (
      message.channel !== this.channel
      && message.content[0] !== MESSAGE_PREFIX
    ) {
      return null;
    }
    switch (message.content) {
      case '!join':
        this.passengerList.add(message.author);
        break;
      case '!leave':
        this.passengerList.remove(message.author);
        break;
      case '!list':
        this.passengerList.list();
        break;
      default:
        // do nothing
        break;
    }
    return true;
  }

  start() {
    this.state.start = true;
    this.channel.send(
      `@here CHOO CHOO ${this.conductor} has started a lunch train CHOO CHOO`
    );
    this.passengerList.add(this.conductor);
  }
}
